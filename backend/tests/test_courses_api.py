"""Tests for Course catalog, modules, lessons, and completion tracking."""

import pytest
from fastapi.testclient import TestClient


def test_course_creation_and_retrieval(client: TestClient):
    # Register instructor
    reg_inst = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Dr. Alan Turing",
            "email": "turing@codeintellect.io",
            "password": "SecurePassword123!",
            "role": "instructor",
        },
    ).json()
    token = reg_inst["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create Course
    course_payload = {
        "title": "Systems Programming with Rust & C++",
        "slug": "systems-programming-rust",
        "description": "Deep dive into memory safety and RAII.",
        "level": "Intermediate",
        "category": "Systems",
        "duration_hours": 20,
        "modules": [
            {
                "title": "Module 1: Ownership & Lifetimes",
                "description": "Borrow checker invariants",
                "order_index": 0,
                "lessons": [
                    {
                        "title": "1.1 Stack vs Heap Allocations",
                        "slug": "stack-vs-heap",
                        "content_markdown": "# Memory Models\nStack is fast.",
                        "duration_minutes": 15,
                        "order_index": 0,
                    }
                ],
            }
        ],
    }
    create_res = client.post("/api/v1/courses", json=course_payload, headers=headers)
    assert create_res.status_code == 200, create_res.text
    course = create_res.json()
    assert course["slug"] == "systems-programming-rust"
    assert len(course["modules"]) == 1
    assert len(course["modules"][0]["lessons"]) == 1

    lesson_id = course["modules"][0]["lessons"][0]["id"]

    # Student reads and completes lesson
    reg_stud = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Student Tester",
            "email": "student.courses@codeintellect.io",
            "password": "SecurePassword123!",
            "role": "student",
        },
    ).json()
    s_headers = {"Authorization": f"Bearer {reg_stud['token']}"}

    # Complete lesson
    comp_res = client.post(
        f"/api/v1/lessons/{lesson_id}/complete",
        json={"time_spent_seconds": 600},
        headers=s_headers,
    )
    assert comp_res.status_code == 200
    assert comp_res.json()["is_completed"] == True

    # Verify lesson is marked completed in course view
    get_res = client.get(f"/api/v1/courses/{course['id']}", headers=s_headers)
    assert get_res.status_code == 200
    updated_course = get_res.json()
    assert updated_course["completed_lessons"] == 1
