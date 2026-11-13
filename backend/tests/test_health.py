"""Tests for health and readiness probes and root endpoint."""

from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient):
    """Test that the root endpoint returns platform metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "CodeIntellect"
    assert data["status"] == "operational"
    assert "documentation" in data
    assert "api_v1" in data


def test_liveness_probe(client: TestClient):
    """Test that the liveness health endpoint returns 200 OK."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "CodeIntellect"
    assert "version" in data


def test_readiness_probe(client: TestClient):
    """Test that the readiness probe returns 200 OK with connected database."""
    response = client.get("/api/v1/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["database"] == "connected"
    assert "timestamp" in data
