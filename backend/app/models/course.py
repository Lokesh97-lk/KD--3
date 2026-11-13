"""Course, Module, Lesson, Enrollment, and LessonProgress models."""

import enum
from datetime import UTC, datetime
from typing import List, Optional

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin, utc_now
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship


class CourseLevel(str, enum.Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"


class EnrollmentStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DROPPED = "dropped"


class LessonType(str, enum.Enum):
    CONCEPT = "concept"
    INTERACTIVE = "interactive"
    EXERCISE = "exercise"


class Course(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Educational course representing a full learning track."""

    __tablename__ = "courses"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    level: Mapped[CourseLevel] = mapped_column(
        Enum(CourseLevel, name="course_level_enum", native_enum=False),
        default=CourseLevel.BEGINNER,
        nullable=False,
    )
    category: Mapped[str] = mapped_column(String(100), default="Software Engineering", nullable=False)
    duration_hours: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    instructor_name: Mapped[str] = mapped_column(String(255), default="Staff Instructor", nullable=False)
    instructor_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    modules: Mapped[List["Module"]] = relationship(
        "Module", back_populates="course", cascade="all, delete-orphan", order_by="Module.order_index"
    )
    enrollments: Mapped[List["CourseEnrollment"]] = relationship(
        "CourseEnrollment", back_populates="course", cascade="all, delete-orphan"
    )


class Module(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """A thematic chapter or module inside a course."""

    __tablename__ = "modules"

    course_id: Mapped[str] = mapped_column(String(36), ForeignKey("courses.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    course: Mapped["Course"] = relationship("Course", back_populates="modules")
    lessons: Mapped[List["Lesson"]] = relationship(
        "Lesson", back_populates="module", cascade="all, delete-orphan", order_by="Lesson.order_index"
    )


class Lesson(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """An individual lesson containing markdown content, code examples, or exercises."""

    __tablename__ = "lessons"

    module_id: Mapped[str] = mapped_column(String(36), ForeignKey("modules.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    lesson_type: Mapped[LessonType] = mapped_column(
        Enum(LessonType, name="lesson_type_enum", native_enum=False),
        default=LessonType.CONCEPT,
        nullable=False,
    )
    duration_minutes: Mapped[int] = mapped_column(Integer, default=15, nullable=False)
    content_markdown: Mapped[str] = mapped_column(Text, nullable=False)
    starter_code: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    language: Mapped[str] = mapped_column(String(32), default="python", nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    concept_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)

    module: Mapped["Module"] = relationship("Module", back_populates="lessons")
    progress_records: Mapped[List["LessonProgress"]] = relationship(
        "LessonProgress", back_populates="lesson", cascade="all, delete-orphan"
    )


class CourseEnrollment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Tracks a student's enrollment and overall progress in a course."""

    __tablename__ = "course_enrollments"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    course_id: Mapped[str] = mapped_column(String(36), ForeignKey("courses.id"), nullable=False, index=True)
    status: Mapped[EnrollmentStatus] = mapped_column(
        Enum(EnrollmentStatus, name="enrollment_status_enum", native_enum=False),
        default=EnrollmentStatus.ACTIVE,
        nullable=False,
    )
    progress_percentage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    course: Mapped["Course"] = relationship("Course", back_populates="enrollments")


class LessonProgress(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Tracks completion and time spent on an individual lesson by a user."""

    __tablename__ = "lesson_progress"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    lesson_id: Mapped[str] = mapped_column(String(36), ForeignKey("lessons.id"), nullable=False, index=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    time_spent_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="progress_records")
