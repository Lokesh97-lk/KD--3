"""Lesson content and interactive completion tracking endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.analytics.event_tracker import EventTracker
from app.analytics.mastery_engine import MasteryEngine
from app.api.dependencies import get_current_user, get_db
from app.models.analytics import EventType
from app.models.base import utc_now
from app.models.course import Course, CourseEnrollment, Lesson, LessonProgress, Module
from app.models.user import User

router = APIRouter(prefix="/lessons", tags=["Lessons"])


class CompleteLessonRequest(BaseModel):
    time_spent_seconds: int = 120


@router.get("/{lesson_id}")
def get_lesson(lesson_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fetch lesson content, starter code, and learner progress."""
    stmt = (
        select(Lesson)
        .where((Lesson.id == lesson_id) | (Lesson.slug == lesson_id))
    )
    lesson = db.execute(stmt).scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    is_comp = False
    if current_user:
        lp = db.execute(
            select(LessonProgress).where(
                LessonProgress.user_id == current_user.id,
                LessonProgress.lesson_id == lesson.id,
            )
        ).scalar_one_or_none()
        if lp:
            is_comp = lp.is_completed

    return {
        "id": lesson.id,
        "title": lesson.title,
        "slug": lesson.slug,
        "duration_minutes": lesson.duration_minutes,
        "type": lesson.lesson_type.value if hasattr(lesson.lesson_type, "value") else str(lesson.lesson_type),
        "is_completed": is_comp,
        "content_markdown": lesson.content_markdown,
        "starter_code": lesson.starter_code,
        "language": lesson.language,
        "concept_id": lesson.concept_id,
    }


@router.post("/{lesson_id}/complete")
def complete_lesson(
    lesson_id: str,
    req: CompleteLessonRequest = CompleteLessonRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark lesson as completed, record learning event, and update concept mastery."""
    stmt = select(Lesson).where((Lesson.id == lesson_id) | (Lesson.slug == lesson_id))
    lesson = db.execute(stmt).scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Update or create LessonProgress
    lp_stmt = select(LessonProgress).where(
        LessonProgress.user_id == current_user.id,
        LessonProgress.lesson_id == lesson.id,
    )
    lp = db.execute(lp_stmt).scalar_one_or_none()
    if not lp:
        lp = LessonProgress(
            user_id=current_user.id,
            lesson_id=lesson.id,
            is_completed=True,
            time_spent_seconds=req.time_spent_seconds,
            completed_at=utc_now(),
        )
        db.add(lp)
    else:
        lp.is_completed = True
        lp.time_spent_seconds += req.time_spent_seconds
        lp.completed_at = utc_now()

    # Log learning event for observatory
    EventTracker.log_learning_event(
        db=db,
        user_id=current_user.id,
        event_type=EventType.LESSON_COMPLETE,
        entity_id=lesson.id,
        entity_type="lesson",
        duration_seconds=req.time_spent_seconds,
        details={"lesson_title": lesson.title},
    )

    # Recalculate course enrollment progress
    module = db.execute(select(Module).where(Module.id == lesson.module_id)).scalar_one_or_none()
    if module:
        course = db.execute(select(Course).where(Course.id == module.course_id)).scalar_one_or_none()
        if course:
            all_course_lessons = (
                db.execute(
                    select(Lesson.id)
                    .join(Module, Lesson.module_id == Module.id)
                    .where(Module.course_id == course.id)
                )
                .scalars()
                .all()
            )
            completed_count = (
                db.execute(
                    select(func.count(LessonProgress.id)).where(
                        LessonProgress.user_id == current_user.id,
                        LessonProgress.lesson_id.in_(all_course_lessons),
                        LessonProgress.is_completed == True,
                    )
                ).scalar()
                or 0
            )

            pct = int((completed_count / max(len(all_course_lessons), 1)) * 100)
            enrollment = db.execute(
                select(CourseEnrollment).where(
                    CourseEnrollment.course_id == course.id,
                    CourseEnrollment.user_id == current_user.id,
                )
            ).scalar_one_or_none()
            if enrollment:
                enrollment.progress_percentage = pct
                db.commit()

    # Trigger concept mastery update if lesson is associated with a concept
    if lesson.concept_id:
        MasteryEngine.update_concept_mastery(db, current_user.id, lesson.concept_id)

    db.commit()

    return {"status": "success", "lesson_id": lesson.id, "is_completed": True}
