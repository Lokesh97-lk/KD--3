"""Assessment Center endpoints for quizzes, practical exams, and timed tests."""

from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.analytics.event_tracker import EventTracker
from app.api.dependencies import get_current_user, get_db, require_role
from app.models.analytics import EventType, SkillEvidence, VerifiedLevel
from app.models.assessment import (
    Assessment,
    AssessmentAnswer,
    AssessmentAttempt,
    AssessmentQuestion,
    AttemptStatus,
    QuestionType,
)
from app.models.base import utc_now
from app.models.user import User, UserRole

router = APIRouter(prefix="/assessments", tags=["Assessments"])


class AnswerSubmission(BaseModel):
    question_id: str
    answer: str


class SubmitAssessmentRequest(BaseModel):
    answers: List[AnswerSubmission]
    time_taken_seconds: int = 600


class QuestionCreate(BaseModel):
    prompt: str
    question_type: str = "mcq"
    options: List[str] = []
    correct_answer: str
    points: int = 10
    starter_code: Optional[str] = None
    order_index: int = 0


class AssessmentCreate(BaseModel):
    title: str
    description: str = ""
    category: str = "General"
    duration_minutes: int = 30
    passing_score: int = 70
    questions: List[QuestionCreate] = []


def format_assessment_dict(a: Assessment, current_user_id: Optional[str], db: Session) -> dict:
    attempt_status = None
    last_score = None
    if current_user_id:
        stmt = (
            select(AssessmentAttempt)
            .where(AssessmentAttempt.assessment_id == a.id, AssessmentAttempt.user_id == current_user_id)
            .order_by(AssessmentAttempt.started_at.desc())
        )
        attempt = db.execute(stmt).scalars().first()
        if attempt:
            attempt_status = attempt.status.value
            last_score = attempt.score

    questions_data = []
    for q in a.questions:
        questions_data.append({
            "id": q.id,
            "prompt": q.prompt,
            "type": q.question_type.value if hasattr(q.question_type, "value") else str(q.question_type),
            "options": q.options or [],
            "starter_code": q.starter_code,
            "points": q.points,
        })

    return {
        "id": a.id,
        "title": a.title,
        "description": a.description,
        "duration_minutes": a.duration_minutes,
        "total_questions": len(a.questions),
        "passing_score": a.passing_score,
        "category": a.category,
        "user_status": attempt_status,
        "last_score": last_score,
        "questions": questions_data,
    }


@router.get("")
def list_assessments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """List all available formal assessments with current learner attempt status."""
    stmt = (
        select(Assessment)
        .options(selectinload(Assessment.questions))
        .where(Assessment.is_published == True)
        .order_by(Assessment.created_at.desc())
    )
    assessments = db.execute(stmt).scalars().all()
    return [format_assessment_dict(a, current_user.id if current_user else None, db) for a in assessments]


@router.get("/{assessment_id}")
def get_assessment(
    assessment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve assessment details and questions."""
    stmt = (
        select(Assessment)
        .options(selectinload(Assessment.questions))
        .where(Assessment.id == assessment_id)
    )
    a = db.execute(stmt).scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    return format_assessment_dict(a, current_user.id if current_user else None, db)


@router.post("/{assessment_id}/submit")
def submit_assessment(
    assessment_id: str,
    req: SubmitAssessmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit responses, auto-grade questions, evaluate score, and persist attempt."""
    stmt = select(Assessment).options(selectinload(Assessment.questions)).where(Assessment.id == assessment_id)
    a = db.execute(stmt).scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    total_possible_points = sum(q.points for q in a.questions) or 100
    awarded_points = 0.0

    answers_map = {ans.question_id: ans.answer.strip() for ans in req.answers}

    attempt = AssessmentAttempt(
        assessment_id=a.id,
        user_id=current_user.id,
        status=AttemptStatus.EVALUATED,
        started_at=utc_now(),
        submitted_at=utc_now(),
        time_taken_seconds=req.time_taken_seconds,
        max_score=float(total_possible_points),
    )
    db.add(attempt)
    db.flush()

    for q in a.questions:
        user_ans = answers_map.get(q.id, "")
        is_correct = (user_ans.lower() == q.correct_answer.strip().lower())
        pts = float(q.points) if is_correct else 0.0
        if is_correct:
            awarded_points += pts

        ans_record = AssessmentAnswer(
            attempt_id=attempt.id,
            question_id=q.id,
            user_answer=user_ans,
            is_correct=is_correct,
            points_awarded=pts,
            notes="Correct answer" if is_correct else f"Incorrect. Key: {q.correct_answer}",
        )
        db.add(ans_record)

    pct = round((awarded_points / total_possible_points) * 100, 1)
    passed = pct >= a.passing_score

    attempt.score = awarded_points
    attempt.percentage = pct
    attempt.passed = passed
    attempt.feedback = (
        f"Passed with {pct}%! Technical proficiency verified."
        if passed
        else f"Score {pct}% fell below the {a.passing_score}% benchmark. Concept revision recommended."
    )

    # Log learning event
    EventTracker.log_learning_event(
        db=db,
        user_id=current_user.id,
        event_type=EventType.ASSESSMENT_FINISH,
        entity_id=a.id,
        entity_type="assessment",
        duration_seconds=req.time_taken_seconds,
        details={"score": awarded_points, "percentage": pct, "passed": passed},
    )

    # If passed with high score, grant verified skill in Skill Passport
    if passed:
        skill_name = f"{a.category} Core Competence"
        existing_skill = db.execute(
            select(SkillEvidence).where(
                SkillEvidence.user_id == current_user.id,
                SkillEvidence.skill_name == skill_name,
            )
        ).scalar_one_or_none()

        if not existing_skill:
            evidence = SkillEvidence(
                user_id=current_user.id,
                skill_name=skill_name,
                domain=a.category,
                verified_level=VerifiedLevel.PROFICIENT if pct >= 85 else VerifiedLevel.PRACTITIONER,
                evidence_source=f"Assessment: {a.title}",
                evidence_url=f"/assessments/{a.id}",
                confidence_score=int(pct),
                is_verified=True,
            )
            db.add(evidence)

    db.commit()

    return {
        "attempt_id": attempt.id,
        "score": awarded_points,
        "max_score": total_possible_points,
        "percentage": pct,
        "passed": passed,
        "feedback": attempt.feedback,
    }


@router.post("", dependencies=[Depends(require_role([UserRole.INSTRUCTOR, UserRole.ADMIN]))])
def create_assessment(
    req: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new technical assessment with questions (Instructor/Admin)."""
    assessment = Assessment(
        title=req.title,
        description=req.description,
        category=req.category,
        duration_minutes=req.duration_minutes,
        total_questions=len(req.questions),
        passing_score=req.passing_score,
        instructor_id=current_user.id,
        is_published=True,
    )
    db.add(assessment)
    db.flush()

    for idx, q_data in enumerate(req.questions):
        q_type = QuestionType.MCQ
        if q_data.question_type == "code":
            q_type = QuestionType.CODE
        elif q_data.question_type == "debugging":
            q_type = QuestionType.DEBUGGING

        question = AssessmentQuestion(
            assessment_id=assessment.id,
            prompt=q_data.prompt,
            question_type=q_type,
            options=q_data.options,
            correct_answer=q_data.correct_answer,
            points=q_data.points,
            starter_code=q_data.starter_code,
            order_index=q_data.order_index or idx,
        )
        db.add(question)

    db.commit()
    db.refresh(assessment)

    EventTracker.log_audit(
        db=db,
        action="ASSESSMENT_CREATED",
        resource_type="assessment",
        resource_id=assessment.id,
        user_id=current_user.id,
        details={"title": assessment.title},
    )

    return format_assessment_dict(assessment, current_user.id, db)
