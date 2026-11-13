"""System models including AuditLog and platform settings."""

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column


class AuditLog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Audit trail for sensitive platform actions."""

    __tablename__ = "audit_logs"

    user_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    resource_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    details: Mapped[dict | None] = mapped_column(JSON, default=dict, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)

    def __repr__(self) -> str:
        return f"<AuditLog {self.action} on {self.resource_type}:{self.resource_id}>"
