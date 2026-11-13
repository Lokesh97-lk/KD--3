"""Learner submission history and execution records endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.dependencies import get_current_user, get_db
from app.models.problem import Problem, Submission
from app.models.user import User, UserRole

router = APIRouter(prefix="/submissions", tags=["Submissions"])


@router.get("")
def list_submissions(
    problem_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve submissions history with test verdicts and metrics."""
    stmt = (
        select(Submission)
        .options(selectinload(Submission.problem))
        .order_by(Submission.submitted_at.desc())
    )

    # Regular students only see their own submissions
    if current_user.role not in (UserRole.INSTRUCTOR, UserRole.ADMIN):
        stmt = stmt.where(Submission.user_id == current_user.id)

    if problem_id:
        stmt = stmt.where(Submission.problem_id == problem_id)

    submissions = db.execute(stmt.limit(limit)).scalars().all()

    return [
        {
            "id": s.id,
            "problem_id": s.problem_id,
            "problem_title": s.problem.title if s.problem else "Coding Challenge",
            "language": s.language,
            "code": s.code,
            "verdict": s.verdict.value if hasattr(s.verdict, "value") else str(s.verdict),
            "passed_tests": s.passed_tests,
            "total_tests": s.total_tests,
            "runtime_ms": s.runtime_ms,
            "memory_kb": s.memory_kb,
            "submitted_at": s.submitted_at.isoformat(),
            "error_output": s.error_output,
        }
        for s in submissions
    ]


@router.get("/{submission_id}")
def get_submission(
    submission_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve details for a single submission."""
    stmt = select(Submission).options(selectinload(Submission.problem)).where(Submission.id == submission_id)
    s = db.execute(stmt).scalar_one_or_none()
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")

    if s.user_id != current_user.id and current_user.role not in (UserRole.INSTRUCTOR, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Access denied")

    return {
        "id": s.id,
        "problem_id": s.problem_id,
        "problem_title": s.problem.title if s.problem else "Coding Challenge",
        "language": s.language,
        "code": s.code,
        "verdict": s.verdict.value if hasattr(s.verdict, "value") else str(s.verdict),
        "passed_tests": s.passed_tests,
        "total_tests": s.total_tests,
        "runtime_ms": s.runtime_ms,
        "memory_kb": s.memory_kb,
        "submitted_at": s.submitted_at.isoformat(),
        "error_output": s.error_output,
        "execution_details": s.execution_details,
    }
