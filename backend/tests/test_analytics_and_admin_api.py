"""Tests for Learning Observatory, Debugging Intelligence, Admin Console, and Instructor Studio."""

import pytest
from fastapi.testclient import TestClient


def test_analytics_and_observatory_endpoints(client: TestClient):
    # Register student
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Analytics Student",
            "email": "analytics.stud@codeintellect.io",
            "password": "SecurePassword123!",
            "role": "student",
        },
    ).json()
    token = reg["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Observatory Overview
    res_overview = client.get("/api/v1/analytics/overview", headers=headers)
    assert res_overview.status_code == 200
    ov = res_overview.json()
    assert "total_study_hours" in ov
    assert "focus_efficiency_score" in ov

    # 2. Topic Time Distribution
    res_topics = client.get("/api/v1/analytics/topic-time", headers=headers)
    assert res_topics.status_code == 200
    assert isinstance(res_topics.json(), list)

    # 3. Daily Trends
    res_trends = client.get("/api/v1/analytics/daily-trends", headers=headers)
    assert res_trends.status_code == 200
    assert isinstance(res_trends.json(), list)

    # 4. Debugging Errors
    res_errors = client.get("/api/v1/analytics/debugging-errors", headers=headers)
    assert res_errors.status_code == 200
    assert isinstance(res_errors.json(), list)

    # 5. Concept Graph
    res_dag = client.get("/api/v1/analytics/concept-graph", headers=headers)
    assert res_dag.status_code == 200
    assert isinstance(res_dag.json(), list)


def test_admin_console_governance(client: TestClient):
    # Register Admin
    reg_admin = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Lead Admin",
            "email": "admin.test@codeintellect.io",
            "password": "SecurePassword123!",
            "role": "admin",
        },
    ).json()
    admin_headers = {"Authorization": f"Bearer {reg_admin['token']}"}

    # Register target user
    reg_user = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Target User",
            "email": "target.user@codeintellect.io",
            "password": "SecurePassword123!",
            "role": "student",
        },
    ).json()
    target_id = reg_user["user"]["id"]

    # 1. Operational Health
    health_res = client.get("/api/v1/admin/health", headers=admin_headers)
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "operational"

    # 2. List Users
    users_res = client.get("/api/v1/admin/users", headers=admin_headers)
    assert users_res.status_code == 200
    users = users_res.json()
    assert any(u["id"] == target_id for u in users)

    # 3. Promote User to Instructor
    role_res = client.patch(
        f"/api/v1/admin/users/{target_id}/role",
        json={"role": "instructor"},
        headers=admin_headers,
    )
    assert role_res.status_code == 200
    assert role_res.json()["role"] == "instructor"

    # 4. Audit Logs
    audit_res = client.get("/api/v1/admin/audit-logs", headers=admin_headers)
    assert audit_res.status_code == 200
    assert len(audit_res.json()) >= 1
