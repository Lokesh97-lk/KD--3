"""Code execution and submission evaluation endpoints for Code Lab."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.analytics.debugging_analyzer import DebuggingAnalyzer
from app.analytics.event_tracker import EventTracker
from app.analytics.mastery_engine import MasteryEngine
from app.api.dependencies import get_current_user, get_db
from app.execution.result_processor import ResultProcessor
from app.execution.runner_client import CodeRunnerClient
from app.models.analytics import EventType, StudySession
from app.models.base import utc_now
from app.models.problem import ExecutionVerdict, Problem, Submission, TestCase
from app.models.user import User

router = APIRouter(prefix="/execution", tags=["Code Execution"])


class RunRequest(BaseModel):
    problem_id: str
    code: str
    language: str = "python"
    stdin: Optional[str] = ""


class SubmitRequest(BaseModel):
    problem_id: str
    code: str
    language: str = "python"


@router.post("/run")
async def run_code(
    req: RunRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Executes code against sample inputs in isolated disposable sandbox."""
    problem = db.execute(select(Problem).where((Problem.id == req.problem_id) | (Problem.slug == req.problem_id))).scalar_one_or_none()
    
    timeout_sec = 3.0
    if problem:
        timeout_sec = max(0.5, problem.time_limit_ms / 1000.0)

    # If stdin not provided, use first sample test case if available
    stdin_data = req.stdin or ""
    if not stdin_data and problem:
        sample_tc = db.execute(
            select(TestCase).where(TestCase.problem_id == problem.id, TestCase.is_hidden == False).order_by(TestCase.order_index)
        ).scalars().first()
        if sample_tc:
            stdin_data = sample_tc.input_data

    res = await CodeRunnerClient.execute(
        language=req.language,
        code=req.code,
        stdin=stdin_data,
        timeout_seconds=timeout_sec,
    )

    is_syntax_err = "SyntaxError" in res.stderr
    is_runtime_err = res.exit_code != 0 and not res.timed_out

    if res.timed_out:
        verdict = ExecutionVerdict.TIME_LIMIT_EXCEEDED
    elif is_syntax_err:
        verdict = ExecutionVerdict.COMPILATION_ERROR
    elif is_runtime_err:
        verdict = ExecutionVerdict.RUNTIME_ERROR
    else:
        verdict = ExecutionVerdict.ACCEPTED

    # Log run event
    EventTracker.log_learning_event(
        db=db,
        user_id=current_user.id,
        event_type=EventType.CODE_RUN,
        entity_id=req.problem_id,
        entity_type="problem",
        duration_seconds=max(1, res.runtime_ms // 1000),
        details={"language": req.language, "verdict": verdict.value},
    )

    return {
        "verdict": verdict.value,
        "stdout": res.stdout,
        "stderr": res.stderr,
        "runtime_ms": res.runtime_ms,
        "memory_kb": res.memory_kb,
        "exit_code": res.exit_code,
    }


@router.post("/submit")
async def submit_code(
    req: SubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Evaluates code against the full confidential test suite and saves submission record."""
    stmt = (
        select(Problem)
        .options(selectinload(Problem.test_cases))
        .where((Problem.id == req.problem_id) | (Problem.slug == req.problem_id))
    )
    problem = db.execute(stmt).scalar_one_or_none()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    outcome = await ResultProcessor.evaluate_submission(
        language=req.language,
        code=req.code,
        test_cases=problem.test_cases,
        time_limit_ms=problem.time_limit_ms,
    )

    # Persist Submission record
    submission = Submission(
        user_id=current_user.id,
        problem_id=problem.id,
        language=req.language,
        code=req.code,
        verdict=outcome.verdict,
        passed_tests=outcome.passed_tests,
        total_tests=outcome.total_tests,
        runtime_ms=outcome.runtime_ms,
        memory_kb=outcome.memory_kb,
        submitted_at=utc_now(),
        error_output=outcome.error_output,
        execution_details={"cases_evaluated": outcome.total_tests},
    )
    db.add(submission)

    # Log learning event
    EventTracker.log_learning_event(
        db=db,
        user_id=current_user.id,
        event_type=EventType.CODE_SUBMIT,
        entity_id=problem.id,
        entity_type="problem",
        duration_seconds=max(5, outcome.runtime_ms // 100),
        details={"verdict": outcome.verdict.value, "passed": outcome.passed_tests, "total": outcome.total_tests},
    )

    # Debugging Intelligence & Error Pattern Analysis
    if outcome.verdict != ExecutionVerdict.ACCEPTED:
        cat = DebuggingAnalyzer.classify_error(outcome.error_output, outcome.verdict.value)
        DebuggingAnalyzer.record_error_occurrence(
            db=db,
            user_id=current_user.id,
            category=cat,
            error_message=outcome.error_output,
            related_concept=problem.topic,
            fix_duration_minutes=8.0,
        )
    else:
        # If accepted, update concept mastery!
        if problem.concept_id:
            MasteryEngine.update_concept_mastery(db, current_user.id, problem.concept_id)

    # Update or add to today's study session
    today_session = db.execute(
        select(StudySession).where(
            StudySession.user_id == current_user.id,
            StudySession.topic == problem.topic,
        )
    ).scalars().first()

    if today_session:
        today_session.coding_minutes += 10
        today_session.focused_minutes += 10
    else:
        new_sess = StudySession(
            user_id=current_user.id,
            topic=problem.topic,
            reading_minutes=5,
            coding_minutes=15,
            debugging_minutes=5 if outcome.verdict != ExecutionVerdict.ACCEPTED else 0,
            testing_minutes=5,
            focused_minutes=20,
        )
        db.add(new_sess)

    db.commit()
    db.refresh(submission)

    return {
        "id": submission.id,
        "problem_id": problem.id,
        "problem_title": problem.title,
        "language": req.language,
        "code": req.code,
        "verdict": outcome.verdict.value,
        "passed_tests": outcome.passed_tests,
        "total_tests": outcome.total_tests,
        "runtime_ms": outcome.runtime_ms,
        "memory_kb": outcome.memory_kb,
        "submitted_at": submission.submitted_at.isoformat(),
        "error_output": outcome.error_output,
    }
