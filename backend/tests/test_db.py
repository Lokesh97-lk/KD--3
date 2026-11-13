"""Tests for database connectivity, models, and session handling."""

from app.db.session import check_db_connection
from app.models.system import AuditLog
from app.models.user import User, UserRole
from sqlalchemy.orm import Session


def test_database_connection_check():
    """Verify check_db_connection returns True against operational database."""
    assert check_db_connection() is True


def test_user_model_creation(db_session: Session):
    """Verify User ORM model persistence and defaults."""
    user = User(
        email="learner@codeintellect.io",
        hashed_password="hashed_secure_pass",
        full_name="Jane Developer",
        role=UserRole.STUDENT,
        timezone="UTC",
    )
    db_session.add(user)
    db_session.flush()

    assert user.id is not None
    assert len(user.id) == 36
    assert user.created_at is not None
    assert user.is_active is True
    assert user.is_verified is False

    retrieved = (
        db_session.query(User).filter_by(email="learner@codeintellect.io").first()
    )
    assert retrieved is not None
    assert retrieved.full_name == "Jane Developer"
    assert retrieved.role == UserRole.STUDENT


def test_audit_log_creation(db_session: Session):
    """Verify AuditLog persistence."""
    log_entry = AuditLog(
        action="user_registered",
        resource_type="user",
        resource_id="user-xyz-123",
        details={"method": "email"},
        ip_address="127.0.0.1",
    )
    db_session.add(log_entry)
    db_session.flush()

    assert log_entry.id is not None
    assert log_entry.created_at is not None
    assert log_entry.action == "user_registered"
