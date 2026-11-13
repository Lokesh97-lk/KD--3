"""Revision Planner and Learning Debt management endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.analytics.event_tracker import EventTracker
from app.api.dependencies import get_current_user, get_db
from app.models.analytics import EventType, RevisionReason, RevisionTask, RevisionUrgency
from app.models.base import utc_now
from app.models.user import User

router = APIRouter(prefix="/revision", tags=["Revision Planner"])


class CreateRevisionTaskRequest(BaseModel):
    topic: str
    reason: str = "repeated_errors"
    urgency: str = "high"
    explanation: str
    estimated_minutes: int = 20
    problem_id: Optional[str] = None


@router.get("/tasks")
def list_revision_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve learner revision queue and completed recovery tasks."""
    stmt = (
        select(RevisionTask)
        .where(RevisionTask.user_id == current_user.id)
        .order_by(RevisionTask.is_completed, RevisionTask.urgency.desc())
    )
    tasks = db.execute(stmt).scalars().all()
    return [
        {
            "id": t.id,
            "topic": t.topic,
            "reason": t.reason.value if hasattr(t.reason, "value") else str(t.reason),
            "urgency": t.urgency.value if hasattr(t.urgency, "value") else str(t.urgency),
            "explanation": t.explanation,
            "estimated_minutes": t.estimated_minutes,
            "problem_id": t.problem_id,
            "is_completed": t.is_completed,
            "completed_at": t.completed_at.isoformat() if t.completed_at else None,
        }
        for t in tasks
    ]


@router.post("/tasks/{task_id}/complete")
def complete_revision_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a revision task as completed, reducing learning debt."""
    stmt = select(RevisionTask).where(RevisionTask.id == task_id, RevisionTask.user_id == current_user.id)
    task = db.execute(stmt).scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Revision task not found")

    task.is_completed = True
    task.completed_at = utc_now()
    db.commit()

    EventTracker.log_learning_event(
        db=db,
        user_id=current_user.id,
        event_type=EventType.CONCEPT_STUDY,
        entity_id=task.id,
        entity_type="revision_task",
        duration_seconds=task.estimated_minutes * 60,
        details={"topic": task.topic},
    )

    return {"status": "success", "task_id": task.id, "is_completed": True}


@router.post("/tasks")
def create_revision_task(
    req: CreateRevisionTaskRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Schedule a targeted revision task."""
    reason_enum = RevisionReason.REPEATED_ERRORS
    if req.reason == "weak_prerequisite":
        reason_enum = RevisionReason.WEAK_PREREQUISITE
    elif req.reason == "retention_decay":
        reason_enum = RevisionReason.RETENTION_DECAY
    elif req.reason == "upcoming_assessment":
        reason_enum = RevisionReason.UPCOMING_ASSESSMENT

    urgency_enum = RevisionUrgency.HIGH
    if req.urgency == "medium":
        urgency_enum = RevisionUrgency.MEDIUM
    elif req.urgency == "low":
        urgency_enum = RevisionUrgency.LOW

    task = RevisionTask(
        user_id=current_user.id,
        topic=req.topic,
        reason=reason_enum,
        urgency=urgency_enum,
        explanation=req.explanation,
        estimated_minutes=req.estimated_minutes,
        problem_id=req.problem_id,
        is_completed=False,
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    return {
        "id": task.id,
        "topic": task.topic,
        "reason": task.reason.value,
        "urgency": task.urgency.value,
        "explanation": task.explanation,
        "estimated_minutes": task.estimated_minutes,
        "is_completed": False,
    }
