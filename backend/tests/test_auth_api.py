"""Tests for user registration, authentication, and role assignment."""

import pytest
from fastapi.testclient import TestClient


def test_register_and_login_flow(client: TestClient):
    # Register a new student
    reg_payload = {
        "full_name": "Test Engineer",
        "email": "test.engineer@codeintellect.io",
        "password": "ValidPassword123!",
        "role": "student",
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert "token" in data
    assert data["user"]["email"] == "test.engineer@codeintellect.io"
    assert data["user"]["role"] == "student"

    # Login with the created account
    login_payload = {
        "email": "test.engineer@codeintellect.io",
        "password": "ValidPassword123!",
    }
    res_login = client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 200
    login_data = res_login.json()
    assert "token" in login_data
    token = login_data["token"]

    # Verify /me endpoint
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "test.engineer@codeintellect.io"


def test_login_invalid_password(client: TestClient):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@codeintellect.io", "password": "WrongPassword"},
    )
    assert res.status_code == 401
