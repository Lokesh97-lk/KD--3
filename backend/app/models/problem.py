"""Problem, TestCase, and Submission models for the Code Lab."""

import enum
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin, utc_now
from sqlalchemy import JSON, Boolean, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship


class ProblemDifficulty(str, enum.Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"


class ExecutionVerdict(str, enum.Enum):
    ACCEPTED = "Accepted"
    WRONG_ANSWER = "Wrong Answer"
    COMPILATION_ERROR = "Compilation Error"
    RUNTIME_ERROR = "Runtime Error"
    TIME_LIMIT_EXCEEDED = "Time Limit Exceeded"
    MEMORY_LIMIT_EXCEEDED = "Memory Limit Exceeded"
    INTERNAL_ERROR = "Internal Error"


class Problem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """A coding challenge or algorithmic exercise."""

    __tablename__ = "problems"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    difficulty: Mapped[ProblemDifficulty] = mapped_column(
        Enum(ProblemDifficulty, name="problem_difficulty_enum", native_enum=False),
        default=ProblemDifficulty.MEDIUM,
        nullable=False,
    )
    topic: Mapped[str] = mapped_column(String(100), default="Algorithms", nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    constraints: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    starter_code: Mapped[Dict[str, str]] = mapped_column(JSON, default=dict, nullable=False)
    time_limit_ms: Mapped[int] = mapped_column(Integer, default=2000, nullable=False)
    memory_limit_mb: Mapped[int] = mapped_column(Integer, default=128, nullable=False)
    concept_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    author_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    acceptance_rate: Mapped[float] = mapped_column(Float, default=70.0, nullable=False)

    test_cases: Mapped[List["TestCase"]] = relationship(
        "TestCase", back_populates="problem", cascade="all, delete-orphan", order_by="TestCase.order_index"
    )
    submissions: Mapped[List["Submission"]] = relationship(
        "Submission", back_populates="problem", cascade="all, delete-orphan"
    )


class TestCase(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Test case for a coding problem, supporting sample and confidential hidden tests."""

    __tablename__ = "test_cases"

    problem_id: Mapped[str] = mapped_column(String(36), ForeignKey("problems.id"), nullable=False, index=True)
    input_data: Mapped[str] = mapped_column(Text, nullable=False)
    expected_output: Mapped[str] = mapped_column(Text, nullable=False)
    is_hidden: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    problem: Mapped["Problem"] = relationship("Problem", back_populates="test_cases")


class Submission(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Records a learner's code submission and execution verdict."""

    __tablename__ = "submissions"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    problem_id: Mapped[str] = mapped_column(String(36), ForeignKey("problems.id"), nullable=False, index=True)
    language: Mapped[str] = mapped_column(String(32), default="python", nullable=False)
    code: Mapped[str] = mapped_column(Text, nullable=False)
    verdict: Mapped[ExecutionVerdict] = mapped_column(
        Enum(ExecutionVerdict, name="execution_verdict_enum", native_enum=False),
        default=ExecutionVerdict.RUNTIME_ERROR,
        nullable=False,
    )
    passed_tests: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_tests: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    runtime_ms: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    memory_kb: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    error_output: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    execution_details: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, default=dict, nullable=True)

    problem: Mapped["Problem"] = relationship("Problem", back_populates="submissions")
