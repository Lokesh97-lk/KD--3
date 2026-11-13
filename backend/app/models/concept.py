"""Concept Dependency Graph and Mastery Models."""

import enum
from datetime import datetime
from typing import List, Optional

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin, utc_now
from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship


class ConceptMasteryStatus(str, enum.Enum):
    LOCKED = "locked"
    PREREQUISITE_WEAK = "prerequisite_weak"
    IN_PROGRESS = "in_progress"
    MASTERED = "mastered"


class ConceptNode(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Represents a node in the programming concept dependency graph."""

    __tablename__ = "concept_nodes"

    node_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    difficulty_level: Mapped[str] = mapped_column(String(50), default="Intermediate", nullable=False)
    recommended_next: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    prerequisites: Mapped[List["ConceptDependency"]] = relationship(
        "ConceptDependency",
        foreign_keys="ConceptDependency.target_concept_id",
        back_populates="target_concept",
        cascade="all, delete-orphan",
    )
    dependents: Mapped[List["ConceptDependency"]] = relationship(
        "ConceptDependency",
        foreign_keys="ConceptDependency.source_concept_id",
        back_populates="source_concept",
        cascade="all, delete-orphan",
    )
    user_masteries: Mapped[List["UserConceptMastery"]] = relationship(
        "UserConceptMastery", back_populates="concept", cascade="all, delete-orphan"
    )


class ConceptDependency(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Directed edge representing prerequisite dependency: source requires target."""

    __tablename__ = "concept_dependencies"

    source_concept_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("concept_nodes.id"), nullable=False, index=True
    )
    target_concept_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("concept_nodes.id"), nullable=False, index=True
    )
    relationship_type: Mapped[str] = mapped_column(String(50), default="requires", nullable=False)

    source_concept: Mapped["ConceptNode"] = relationship(
        "ConceptNode", foreign_keys=[source_concept_id], back_populates="dependents"
    )
    target_concept: Mapped["ConceptNode"] = relationship(
        "ConceptNode", foreign_keys=[target_concept_id], back_populates="prerequisites"
    )


class UserConceptMastery(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Tracks a student's actual calculated mastery percentage and status for a concept."""

    __tablename__ = "user_concept_mastery"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    concept_id: Mapped[str] = mapped_column(String(36), ForeignKey("concept_nodes.id"), nullable=False, index=True)
    mastery_percentage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    practice_accuracy: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    status: Mapped[ConceptMasteryStatus] = mapped_column(
        Enum(ConceptMasteryStatus, name="concept_mastery_status_enum", native_enum=False),
        default=ConceptMasteryStatus.LOCKED,
        nullable=False,
    )
    last_practiced: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    concept: Mapped["ConceptNode"] = relationship("ConceptNode", back_populates="user_masteries")
