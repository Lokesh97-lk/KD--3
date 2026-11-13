"""Course, curriculum tracks, and enrollment management endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.analytics.event_tracker import EventTracker
from app.api.dependencies import get_current_user, get_db, require_role
from app.models.analytics import EventType
from app.models.course import Course, CourseEnrollment, CourseLevel, EnrollmentStatus, Lesson, LessonProgress, Module
from app.models.user import User, UserRole

router = APIRouter(prefix="/courses", tags=["Courses"])


class LessonCreate(BaseModel):
    title: str
    slug: str
    content_markdown: str
    duration_minutes: int = 15
    order_index: int = 0
    lesson_type: str = "concept"
    starter_code: Optional[str] = None
    language: str = "python"


class ModuleCreate(BaseModel):
    title: str
    description: str = ""
    order_index: int = 0
    lessons: List[LessonCreate] = []


class CourseCreate(BaseModel):
    title: str
    slug: str
    description: str
    level: str = "Beginner"
    category: str = "Software Engineering"
    duration_hours: int = 10
    modules: List[ModuleCreate] = []


def format_course_dict(course: Course, current_user_id: Optional[str], db: Session) -> dict:
    """Formats course into standard response including live learner progress."""
    total_lessons = sum(len(m.lessons) for m in course.modules)

    completed_lessons = 0
    if current_user_id and total_lessons > 0:
        lesson_ids = [l.id for m in course.modules for l in m.lessons]
        if lesson_ids:
            stmt = select(func.count(LessonProgress.id)).where(
                LessonProgress.user_id == current_user_id,
                LessonProgress.lesson_id.in_(lesson_ids),
                LessonProgress.is_completed == True,
            )
            completed_lessons = db.execute(stmt).scalar() or 0

    modules_data = []
    for mod in course.modules:
        lessons_data = []
        for les in mod.lessons:
            is_comp = False
            if current_user_id:
                lp = db.execute(
                    select(LessonProgress).where(
                        LessonProgress.user_id == current_user_id,
                        LessonProgress.lesson_id == les.id,
                    )
                ).scalar_one_or_none()
                if lp:
                    is_comp = lp.is_completed

            lessons_data.append({
                "id": les.id,
                "title": les.title,
                "slug": les.slug,
                "order": les.order_index,
                "duration_minutes": les.duration_minutes,
                "type": les.lesson_type.value if hasattr(les.lesson_type, "value") else str(les.lesson_type),
                "is_completed": is_comp,
                "content_markdown": les.content_markdown,
                "starter_code": les.starter_code,
                "language": les.language,
            })

        modules_data.append({
            "id": mod.id,
            "title": mod.title,
            "description": mod.description,
            "order": mod.order_index,
            "lessons": lessons_data,
        })

    return {
        "id": course.id,
        "title": course.title,
        "slug": course.slug,
        "description": course.description,
        "level": course.level.value if hasattr(course.level, "value") else str(course.level),
        "duration_hours": course.duration_hours,
        "total_lessons": total_lessons,
        "completed_lessons": completed_lessons,
        "tags": [course.category, course.level.value if hasattr(course.level, "value") else str(course.level)],
        "instructor_name": course.instructor_name,
        "modules": modules_data,
    }


@router.get("")
def list_courses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """List all available curriculum courses with current student progress."""
    stmt = (
        select(Course)
        .options(selectinload(Course.modules).selectinload(Module.lessons))
        .where(Course.is_published == True)
        .order_by(Course.order_index, Course.title)
    )
    courses = db.execute(stmt).scalars().all()
    return [format_course_dict(c, current_user.id if current_user else None, db) for c in courses]


@router.get("/{id_or_slug}")
def get_course(id_or_slug: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fetch single course with all modules, lessons, and student completion states."""
    stmt = (
        select(Course)
        .options(selectinload(Course.modules).selectinload(Module.lessons))
        .where((Course.id == id_or_slug) | (Course.slug == id_or_slug))
    )
    course = db.execute(stmt).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return format_course_dict(course, current_user.id if current_user else None, db)


@router.post("", dependencies=[Depends(require_role([UserRole.INSTRUCTOR, UserRole.ADMIN]))])
def create_course(req: CourseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new curriculum course with nested modules and lessons (Instructor/Admin)."""
    level_enum = CourseLevel.BEGINNER
    if req.level == "Intermediate":
        level_enum = CourseLevel.INTERMEDIATE
    elif req.level == "Advanced":
        level_enum = CourseLevel.ADVANCED

    course = Course(
        title=req.title,
        slug=req.slug,
        description=req.description,
        level=level_enum,
        category=req.category,
        duration_hours=req.duration_hours,
        instructor_name=current_user.full_name,
        instructor_id=current_user.id,
        is_published=True,
    )
    db.add(course)
    db.flush()

    for m_idx, mod_data in enumerate(req.modules):
        module = Module(
            course_id=course.id,
            title=mod_data.title,
            description=mod_data.description,
            order_index=mod_data.order_index or m_idx,
        )
        db.add(module)
        db.flush()

        for l_idx, les_data in enumerate(mod_data.lessons):
            lesson = Lesson(
                module_id=module.id,
                title=les_data.title,
                slug=les_data.slug,
                content_markdown=les_data.content_markdown,
                duration_minutes=les_data.duration_minutes,
                order_index=les_data.order_index or l_idx,
                starter_code=les_data.starter_code,
                language=les_data.language,
            )
            db.add(lesson)

    db.commit()
    db.refresh(course)

    EventTracker.log_audit(
        db=db,
        action="COURSE_CREATED",
        resource_type="course",
        resource_id=course.id,
        user_id=current_user.id,
        details={"title": course.title},
    )

    return format_course_dict(course, current_user.id, db)


@router.post("/{course_id}/enroll")
def enroll_course(course_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Enroll student into a course."""
    course = db.execute(select(Course).where(Course.id == course_id)).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    stmt = select(CourseEnrollment).where(
        CourseEnrollment.course_id == course.id,
        CourseEnrollment.user_id == current_user.id,
    )
    enrollment = db.execute(stmt).scalar_one_or_none()
    if not enrollment:
        enrollment = CourseEnrollment(
            user_id=current_user.id,
            course_id=course.id,
            status=EnrollmentStatus.ACTIVE,
            progress_percentage=0,
        )
        db.add(enrollment)
        db.commit()

        EventTracker.log_learning_event(
            db=db,
            user_id=current_user.id,
            event_type=EventType.LESSON_VIEW,
            entity_id=course.id,
            entity_type="course_enrollment",
            details={"course_title": course.title},
        )

    return {"status": "enrolled", "course_id": course.id, "progress": enrollment.progress_percentage}
