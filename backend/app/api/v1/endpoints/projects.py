"""Project Studio endpoints for practical engineering scenarios and milestone submissions."""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.analytics.event_tracker import EventTracker
from app.api.dependencies import get_current_user, get_db, require_role
from app.models.analytics import EventType
from app.models.base import utc_now
from app.models.project import (
    MilestoneSubmissionStatus,
    Project,
    ProjectDifficulty,
    ProjectMilestone,
    ProjectMilestoneSubmission,
)
from app.models.user import User, UserRole

router = APIRouter(prefix="/projects", tags=["Project Studio"])


class MilestoneSubmitRequest(BaseModel):
    repo_link: str
    code_snippet: Optional[str] = None
    notes: Optional[str] = None


class MilestoneCreate(BaseModel):
    title: str
    description: str = ""
    order_index: int = 0
    skills_demonstrated: List[str] = []


class ProjectCreate(BaseModel):
    title: str
    slug: str
    domain: str = "Backend REST API"
    difficulty: str = "Mid-Level"
    context: str
    acceptance_criteria: List[str] = []
    starter_repo: str = "https://github.com/codeintellect/starter-repo"
    evaluation_rubric: List[Dict[str, Any]] = []
    milestones: List[MilestoneCreate] = []


def format_project_dict(p: Project, current_user_id: Optional[str], db: Session) -> dict:
    milestones_data = []
    all_submitted = True
    any_verified = False

    for m in p.milestones:
        sub_info = None
        if current_user_id:
            sub = db.execute(
                select(ProjectMilestoneSubmission)
                .where(
                    ProjectMilestoneSubmission.milestone_id == m.id,
                    ProjectMilestoneSubmission.user_id == current_user_id,
                )
                .order_by(ProjectMilestoneSubmission.created_at.desc())
            ).scalars().first()

            if sub:
                sub_info = {
                    "id": sub.id,
                    "status": sub.status.value,
                    "score": sub.score,
                    "feedback": sub.feedback,
                    "repo_link": sub.repo_link,
                    "submitted_at": sub.created_at.isoformat(),
                }
                if sub.status == MilestoneSubmissionStatus.GRADED and (sub.score or 0) >= 70:
                    any_verified = True
            else:
                all_submitted = False
        else:
            all_submitted = False

        milestones_data.append({
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "order": m.order_index,
            "skills_demonstrated": m.skills_demonstrated or [],
            "submission": sub_info,
        })

    return {
        "id": p.id,
        "title": p.title,
        "slug": p.slug,
        "domain": p.domain,
        "difficulty": p.difficulty.value if hasattr(p.difficulty, "value") else str(p.difficulty),
        "context": p.context,
        "acceptance_criteria": p.acceptance_criteria or [],
        "starter_repo": p.starter_repo,
        "evaluation_rubric": p.evaluation_rubric or [],
        "is_verified": any_verified,
        "milestones": milestones_data,
    }


@router.get("/scenarios")
def list_scenarios(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """List practical engineering project scenarios with student milestones."""
    stmt = (
        select(Project)
        .options(selectinload(Project.milestones))
        .where(Project.is_published == True)
        .order_by(Project.created_at.desc())
    )
    projects = db.execute(stmt).scalars().all()
    return [format_project_dict(p, current_user.id if current_user else None, db) for p in projects]


@router.get("/{project_id}")
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve detailed project rubric and milestones."""
    stmt = (
        select(Project)
        .options(selectinload(Project.milestones))
        .where((Project.id == project_id) | (Project.slug == project_id))
    )
    p = db.execute(stmt).scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    return format_project_dict(p, current_user.id if current_user else None, db)


@router.post("/{project_id}/milestones/{milestone_id}/submit")
def submit_milestone(
    project_id: str,
    milestone_id: str,
    req: MilestoneSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit milestone code and repository work for instructor rubric evaluation."""
    milestone = db.execute(select(ProjectMilestone).where(ProjectMilestone.id == milestone_id)).scalar_one_or_none()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    sub = ProjectMilestoneSubmission(
        milestone_id=milestone.id,
        user_id=current_user.id,
        repo_link=req.repo_link,
        code_snippet=req.code_snippet,
        notes=req.notes,
        status=MilestoneSubmissionStatus.PENDING_REVIEW,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    EventTracker.log_learning_event(
        db=db,
        user_id=current_user.id,
        event_type=EventType.PROJECT_SUBMIT,
        entity_id=milestone.id,
        entity_type="project_milestone",
        duration_seconds=300,
        details={"milestone_title": milestone.title, "repo": req.repo_link},
    )

    return {
        "id": sub.id,
        "milestone_id": milestone.id,
        "status": sub.status.value,
        "submitted_at": sub.created_at.isoformat(),
        "message": "Milestone submitted successfully. Queued for instructor rubric evaluation.",
    }
