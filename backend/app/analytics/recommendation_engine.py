"""Revision Planner and Learning Debt Recommendation Engine."""

from typing import Any, Dict, List
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.analytics import RevisionReason, RevisionTask, RevisionUrgency
from app.models.problem import ExecutionVerdict, Problem, Submission


class RecommendationEngine:
    """Generates revision tasks and identifies weak engineering concepts."""

    @classmethod
    def get_user_recommendations(cls, db: Session, user_id: str) -> List[Dict[str, Any]]:
        """Retrieves active revision recommendations from database."""
        stmt = (
            select(RevisionTask)
            .where(RevisionTask.user_id == user_id, RevisionTask.is_completed == False)
            .order_by(RevisionTask.urgency.desc())
        )
        tasks = db.execute(stmt).scalars().all()

        if not tasks:
            # Check if user has failed submissions without revision tasks
            stmt_failed = (
                select(Submission)
                .where(
                    Submission.user_id == user_id,
                    Submission.verdict.in_([ExecutionVerdict.WRONG_ANSWER, ExecutionVerdict.TIME_LIMIT_EXCEEDED]),
                )
                .order_by(Submission.submitted_at.desc())
                .limit(3)
            )
            failed_subs = db.execute(stmt_failed).scalars().all()

            for s in failed_subs:
                prob = db.execute(select(Problem).where(Problem.id == s.problem_id)).scalar_one_or_none()
                topic_title = prob.title if prob else "Algorithmic Precision"
                task = RevisionTask(
                    user_id=user_id,
                    topic=f"Boundary Recovery: {topic_title}",
                    reason=RevisionReason.REPEATED_ERRORS,
                    urgency=RevisionUrgency.HIGH,
                    explanation=f"Recent submission failed tests on {topic_title}. Re-test edge cases and cutoff criteria.",
                    estimated_minutes=25,
                    problem_id=s.problem_id,
                    is_completed=False,
                )
                db.add(task)
            db.commit()
            tasks = db.execute(stmt).scalars().all()

        results = []
        for t in tasks:
            results.append({
                "id": t.id,
                "topic": t.topic,
                "reason": t.reason.value,
                "urgency": t.urgency.value,
                "explanation": t.explanation,
                "estimated_minutes": t.estimated_minutes,
                "problem_id": t.problem_id,
            })
        return results
