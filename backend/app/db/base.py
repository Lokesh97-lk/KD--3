"""Central database metadata registry importing all ORM models for Alembic."""

from app.models.analytics import (
    ErrorPattern,
    ErrorTrend,
    EventType,
    LearningEvent,
    RevisionReason,
    RevisionTask,
    RevisionUrgency,
    SkillEvidence,
    StudySession,
    VerifiedLevel,
)
from app.models.assessment import (
    Assessment,
    AssessmentAnswer,
    AssessmentAttempt,
    AssessmentQuestion,
    AttemptStatus,
    QuestionType,
)
from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.concept import (
    ConceptDependency,
    ConceptMasteryStatus,
    ConceptNode,
    UserConceptMastery,
)
from app.models.course import (
    Course,
    CourseEnrollment,
    CourseLevel,
    EnrollmentStatus,
    Lesson,
    LessonProgress,
    LessonType,
    Module,
)
from app.models.problem import (
    ExecutionVerdict,
    Problem,
    ProblemDifficulty,
    Submission,
    TestCase,
)
from app.models.project import (
    MilestoneSubmissionStatus,
    Project,
    ProjectDifficulty,
    ProjectMilestone,
    ProjectMilestoneSubmission,
)
from app.models.system import AuditLog
from app.models.user import User, UserRole

__all__ = [
    "Assessment",
    "AssessmentAnswer",
    "AssessmentAttempt",
    "AssessmentQuestion",
    "AttemptStatus",
    "AuditLog",
    "Base",
    "ConceptDependency",
    "ConceptMasteryStatus",
    "ConceptNode",
    "Course",
    "CourseEnrollment",
    "CourseLevel",
    "EnrollmentStatus",
    "ErrorPattern",
    "ErrorTrend",
    "EventType",
    "ExecutionVerdict",
    "LearningEvent",
    "Lesson",
    "LessonProgress",
    "LessonType",
    "MilestoneSubmissionStatus",
    "Module",
    "Problem",
    "ProblemDifficulty",
    "Project",
    "ProjectDifficulty",
    "ProjectMilestone",
    "ProjectMilestoneSubmission",
    "QuestionType",
    "RevisionReason",
    "RevisionTask",
    "RevisionUrgency",
    "SkillEvidence",
    "StudySession",
    "Submission",
    "TestCase",
    "TimestampMixin",
    "UUIDPrimaryKeyMixin",
    "User",
    "UserConceptMastery",
    "UserRole",
    "VerifiedLevel",
]
