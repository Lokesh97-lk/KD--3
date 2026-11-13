"""Health and readiness check endpoints."""

from datetime import UTC, datetime

from app.core.config import settings
from app.db.session import check_db_connection
from fastapi import APIRouter, Response, status

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Liveness check")
def health_check() -> dict:
    """Liveness probe to verify that the API server is up and responsive."""
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }


@router.get("/ready", summary="Readiness check")
def readiness_check(response: Response) -> dict:
    """Readiness probe verifying operational status including database connectivity."""
    db_connected = check_db_connection()
    if not db_connected:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "not_ready",
            "database": "disconnected",
            "timestamp": datetime.now(UTC).isoformat(),
        }

    return {
        "status": "ready",
        "database": "connected",
        "timestamp": datetime.now(UTC).isoformat(),
    }
