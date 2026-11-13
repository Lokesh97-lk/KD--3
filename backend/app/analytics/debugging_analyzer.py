"""Debugging Intelligence Engine for analyzing mistakes and identifying error patterns."""

import re
from datetime import UTC, datetime
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.analytics import ErrorPattern, ErrorTrend
from app.models.base import utc_now


class DebuggingAnalyzer:
    """Classifies errors, tracks frequency, and correlates with learning concepts."""

    @classmethod
    def classify_error(cls, error_output: Optional[str], verdict_str: str) -> str:
        """Categorizes compiler/runtime error message into an actionable engineering misconception."""
        if not error_output:
            if "Time Limit" in verdict_str:
                return "Algorithmic Complexity Timeout"
            if "Wrong Answer" in verdict_str:
                return "Logical Correctness & Edge-Case Failure"
            return "General Engineering Error"

        text = error_output.lower()

        if "syntaxerror" in text or "invalid syntax" in text or "indentationerror" in text:
            return "Syntax & Indentation Error"
        if "boundary" in text or "indexerror" in text or "out of range" in text or "cutoff" in text:
            return "Off-by-One Boundary Condition"
        if "typeerror" in text or "attributeerror" in text or "cannot read property" in text or "null" in text or "none" in text:
            return "Type & Null Pointer Mismatch"
        if "recursionerror" in text or "maximum recursion" in text:
            return "Unbounded Recursion & Stack Overflow"
        if "time limit" in text or "timeout" in text:
            return "Algorithmic Complexity Timeout"
        if "keyerror" in text:
            return "Missing Dictionary Key / Cache Miss"
        if "assertionerror" in text:
            return "Assertion Failure / Boundary Collision"
        if "lock" in text or "deadlock" in text or "async" in text:
            return "Asynchronous Race Condition"

        return "Logical Correctness & Edge-Case Failure"

    @classmethod
    def record_error_occurrence(
        cls,
        db: Session,
        user_id: str,
        category: str,
        error_message: Optional[str] = None,
        related_concept: Optional[str] = None,
        fix_duration_minutes: float = 5.0,
    ) -> ErrorPattern:
        """Updates or registers an error pattern for the student."""
        stmt = select(ErrorPattern).where(
            ErrorPattern.user_id == user_id,
            ErrorPattern.category == category,
        )
        existing = db.execute(stmt).scalar_one_or_none()

        if existing:
            existing.occurrence_count += 1
            existing.last_encountered = utc_now()
            existing.avg_fix_minutes = round((existing.avg_fix_minutes + fix_duration_minutes) / 2.0, 1)
            existing.trend = ErrorTrend.REPEATING if existing.occurrence_count > 3 else ErrorTrend.STABLE
            if error_message:
                existing.sample_error_message = error_message[:500]
            db.commit()
            db.refresh(existing)
            return existing
        else:
            new_pattern = ErrorPattern(
                user_id=user_id,
                category=category,
                occurrence_count=1,
                avg_fix_minutes=round(fix_duration_minutes, 1),
                trend=ErrorTrend.IMPROVING,
                last_encountered=utc_now(),
                sample_error_message=error_message[:500] if error_message else None,
                related_concept=related_concept or "Algorithms & Data Structures",
            )
            db.add(new_pattern)
            db.commit()
            db.refresh(new_pattern)
            return new_pattern

    @classmethod
    def get_user_error_patterns(cls, db: Session, user_id: str) -> List[dict]:
        """Returns error categories with percentage breakdown for Debugging Intelligence dashboard."""
        stmt = select(ErrorPattern).where(ErrorPattern.user_id == user_id).order_by(ErrorPattern.occurrence_count.desc())
        patterns = db.execute(stmt).scalars().all()

        total_occurrences = sum(p.occurrence_count for p in patterns) or 1
        return [
            {
                "category": p.category,
                "count": p.occurrence_count,
                "percentage": round((p.occurrence_count / total_occurrences) * 100),
                "avg_fix_minutes": p.avg_fix_minutes,
                "trend": p.trend.value,
                "last_encountered": p.last_encountered.isoformat(),
                "related_concept": p.related_concept,
            }
            for p in patterns
        ]
