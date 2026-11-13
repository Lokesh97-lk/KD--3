"""Tests for application exceptions and structured error handler responses."""

from app.core.exceptions import AppException, EntityNotFoundError
from app.main import app
from fastapi import APIRouter
from fastapi.testclient import TestClient

# Router to trigger error scenarios (named without 'test_' prefix to avoid pytest collection warning)
error_probe_router = APIRouter(prefix="/probe-errors")


@error_probe_router.get("/entity-not-found")
def trigger_not_found():
    raise EntityNotFoundError("Course", "algo-101")


@error_probe_router.get("/custom-app-error")
def trigger_custom_error():
    raise AppException(
        message="Simulated business logic failure",
        status_code=400,
        error_code="BUSINESS_RULE_VIOLATION",
        details={"reason": "pre_requisite_missing"},
    )


app.include_router(error_probe_router)


def test_entity_not_found_response(client: TestClient):
    """Verify EntityNotFoundError generates structured 404 response."""
    response = client.get("/probe-errors/entity-not-found")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "ENTITY_NOT_FOUND"
    assert (
        "Course with identifier 'algo-101' was not found." in data["error"]["message"]
    )
    assert data["error"]["details"]["entity"] == "Course"


def test_custom_app_exception_response(client: TestClient):
    """Verify AppException generates structured error response."""
    response = client.get("/probe-errors/custom-app-error")
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "BUSINESS_RULE_VIOLATION"
    assert data["error"]["message"] == "Simulated business logic failure"
    assert data["error"]["details"]["reason"] == "pre_requisite_missing"
