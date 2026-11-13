"""Project Studio, Milestones, Submissions, and Evaluations models."""

import enum
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin, utc_now
from sqlalchemy import JSON, Boolean, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship


class ProjectDifficulty(str, enum.Enum):
    MID_LEVEL = "Mid-Level"
    SENIOR = "Senior"
    LEAD = "Lead"


class MilestoneSubmissionStatus(str, enum.Enum):
    PENDING_REVIEW = "Pending Review"
    GRADED = "Graded"
    REVISION_REQUESTED = "Revision Requested"


class Project(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """An end-to-end practical engineering project/scenario."""

    __tablename__ = "projects"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    domain: Mapped[str] = mapped_column(String(100), default="Backend REST API", nullable=False)
    difficulty: Mapped[ProjectDifficulty] = mapped_column(
        Enum(ProjectDifficulty, name="project_difficulty_enum", native_enum=False),
        default=ProjectDifficulty.MID_LEVEL,
        nullable=False,
    )
    context: Mapped[str] = mapped_column(Text, nullable=False)
    acceptance_criteria: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    starter_repo: Mapped[str] = mapped_column(String(255), default="https://github.com/codeintellect/starter-repo", nullable=False)
    evaluation_rubric: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    author_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)

    milestones: Mapped[List["ProjectMilestone"]] = relationship(
        "ProjectMilestone", back_populates="project", cascade="all, delete-orphan", order_by="ProjectMilestone.order_index"
    )


class ProjectMilestone(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """A milestone within an engineering project."""

    __tablename__ = "project_milestones"

    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    skills_demonstrated: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)

    project: Mapped["Project"] = relationship("Project", back_populates="milestones")
    submissions: Mapped[List["ProjectMilestoneSubmission"]] = relationship(
        "ProjectMilestoneSubmission", back_populates="milestone", cascade="all, delete-orphan"
    )


class ProjectMilestoneSubmission(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Student submission for an engineering project milestone."""

    __tablename__ = "project_milestone_submissions"

    milestone_id: Mapped[str] = mapped_column(String(36), ForeignKey("project_milestones.id"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    repo_link: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    code_snippet: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[MilestoneSubmissionStatus] = mapped_column(
        Enum(MilestoneSubmissionStatus, name="milestone_submission_status_enum", native_enum=False),
        default=MilestoneSubmissionStatus.PENDING_REVIEW,
        nullable=False,
    )
    score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    evaluated_by: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    evaluated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    milestone: Mapped["ProjectMilestone"] = relationship("ProjectMilestone", back_populates="submissions")
