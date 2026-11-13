"""Coding problems and test case catalog endpoints."""

from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.analytics.event_tracker import EventTracker
from app.api.dependencies import get_current_user, get_db, require_role
from app.models.problem import Problem, ProblemDifficulty, TestCase
from app.models.user import User, UserRole

router = APIRouter(prefix="/problems", tags=["Problems"])


class TestCaseCreate(BaseModel):
    input_data: str
    expected_output: str
    is_hidden: bool = False
    explanation: Optional[str] = None
    order_index: int = 0


class ProblemCreate(BaseModel):
    title: str
    slug: str
    difficulty: str = "Medium"
    topic: str = "Algorithms"
    description: str
    constraints: List[str] = []
    starter_code: Dict[str, str] = {}
    time_limit_ms: int = 2000
    memory_limit_mb: int = 128
    concept_id: Optional[str] = None
    test_cases: List[TestCaseCreate] = []


def format_problem_dict(p: Problem, is_staff: bool = False) -> dict:
    cases = []
    for tc in p.test_cases:
        cases.append({
            "id": tc.id,
            "input": tc.input_data if (not tc.is_hidden or is_staff) else "[Hidden Test Input]",
            "expected_output": tc.expected_output if (not tc.is_hidden or is_staff) else "[Hidden Output]",
            "is_hidden": tc.is_hidden,
            "explanation": tc.explanation,
        })

    return {
        "id": p.id,
        "title": p.title,
        "slug": p.slug,
        "difficulty": p.difficulty.value if hasattr(p.difficulty, "value") else str(p.difficulty),
        "topic": p.topic,
        "acceptance_rate": p.acceptance_rate,
        "description": p.description,
        "constraints": p.constraints or [],
        "starter_code": p.starter_code or {},
        "time_limit_ms": p.time_limit_ms,
        "memory_limit_mb": p.memory_limit_mb,
        "concept_id": p.concept_id,
        "test_cases": cases,
    }


@router.get("")
def list_problems(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List published coding problems with test cases."""
    stmt = (
        select(Problem)
        .options(selectinload(Problem.test_cases))
        .where(Problem.is_published == True)
    )
    if topic:
        stmt = stmt.where(Problem.topic == topic)
    if difficulty:
        stmt = stmt.where(Problem.difficulty == difficulty)

    problems = db.execute(stmt).scalars().all()
    is_staff = current_user.role in (UserRole.INSTRUCTOR, UserRole.ADMIN)
    return [format_problem_dict(p, is_staff) for p in problems]


@router.get("/{id_or_slug}")
def get_problem(
    id_or_slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch single coding problem with sample and confidential test specifications."""
    stmt = (
        select(Problem)
        .options(selectinload(Problem.test_cases))
        .where((Problem.id == id_or_slug) | (Problem.slug == id_or_slug))
    )
    problem = db.execute(stmt).scalar_one_or_none()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    is_staff = current_user.role in (UserRole.INSTRUCTOR, UserRole.ADMIN)
    return format_problem_dict(problem, is_staff)


@router.post("", dependencies=[Depends(require_role([UserRole.INSTRUCTOR, UserRole.ADMIN]))])
def create_problem(
    req: ProblemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new coding problem with test cases (Instructor/Admin)."""
    diff_enum = ProblemDifficulty.MEDIUM
    if req.difficulty == "Easy":
        diff_enum = ProblemDifficulty.EASY
    elif req.difficulty == "Hard":
        diff_enum = ProblemDifficulty.HARD

    problem = Problem(
        title=req.title,
        slug=req.slug,
        difficulty=diff_enum,
        topic=req.topic,
        description=req.description,
        constraints=req.constraints,
        starter_code=req.starter_code,
        time_limit_ms=req.time_limit_ms,
        memory_limit_mb=req.memory_limit_mb,
        concept_id=req.concept_id,
        author_id=current_user.id,
        is_published=True,
    )
    db.add(problem)
    db.flush()

    for idx, tc in enumerate(req.test_cases):
        test_case = TestCase(
            problem_id=problem.id,
            input_data=tc.input_data,
            expected_output=tc.expected_output,
            is_hidden=tc.is_hidden,
            explanation=tc.explanation,
            order_index=tc.order_index or idx,
        )
        db.add(test_case)

    db.commit()
    db.refresh(problem)

    EventTracker.log_audit(
        db=db,
        action="PROBLEM_CREATED",
        resource_type="problem",
        resource_id=problem.id,
        user_id=current_user.id,
        details={"title": problem.title},
    )

    return format_problem_dict(problem, is_staff=True)
