"""Telemetry and Learning Event Tracker."""

from typing import Any, Dict, Optional
from sqlalchemy.orm import Session

from app.models.analytics import EventType, LearningEvent
from app.models.system import AuditLog


class EventTracker:
    """Records learning interactions and administrative audit logs."""

    @classmethod
    def log_learning_event(
        cls,
        db: Session,
        user_id: str,
        event_type: EventType,
        entity_id: str,
        entity_type: str,
        duration_seconds: int = 0,
        details: Optional[Dict[str, Any]] = None,
    ) -> LearningEvent:
        """Persists a learning event for observatory and mastery telemetry."""
        event = LearningEvent(
            user_id=user_id,
            event_type=event_type,
            entity_id=entity_id,
            entity_type=entity_type,
            duration_seconds=duration_seconds,
            details=details or {},
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    @classmethod
    def log_audit(
        cls,
        db: Session,
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        user_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLog:
        """Persists an immutable security/administrative audit log."""
        log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details or {},
            ip_address=ip_address or "127.0.0.1",
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log
