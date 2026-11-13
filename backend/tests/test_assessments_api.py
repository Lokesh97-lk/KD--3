"""Tests for technical assessment creation, attempt grading, and skill verification."""

import pytest
from fastapi.testclient import TestClient


def test_assessment_flow(client: TestClient):
    # Register instructor
    reg_inst = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Instructor Asmt",
            "email": "asmt.inst@codeintellect.io",
            "password": "SecurePassword123!",
            "role": "instructor",
        },
    ).json()
    inst_headers = {"Authorization": f"Bearer {reg_inst['token']}"}

    # Create Assessment
    asmt_payload = {
        "title": "Data Structures Diagnostic Quiz",
        "description": "Test understanding of hash tables and binary trees.",
        "category": "Data Structures",
        "duration_minutes": 20,
        "passing_score": 70,
        "questions": [
            {
                "prompt": "What is the average lookup time complexity of a hash table with good uniform distribution?",
                "question_type": "mcq",
                "options": ["O(1)", "O(log N)", "O(N)", "O(N^2)"],
                "correct_answer": "O(1)",
                "points": 50,
            },
            {
                "prompt": "Which traversal of a Binary Search Tree produces values in strictly sorted order?",
                "question_type": "mcq",
                "options": ["Pre-order", "In-order", "Post-order", "Level-order"],
                "correct_answer": "In-order",
                "points": 50,
            },
        ],
    }
    create_res = client.post("/api/v1/assessments", json=asmt_payload, headers=inst_headers)
    assert create_res.status_code == 200, create_res.text
    assessment = create_res.json()
    asmt_id = assessment["id"]
    q1_id = assessment["questions"][0]["id"]
    q2_id = assessment["questions"][1]["id"]

    # Student takes assessment
    reg_stud = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Student Assessment Taker",
            "email": "student.asmt@codeintellect.io",
            "password": "SecurePassword123!",
            "role": "student",
        },
    ).json()
    stud_headers = {"Authorization": f"Bearer {reg_stud['token']}"}

    submit_payload = {
        "answers": [
            {"question_id": q1_id, "answer": "O(1)"},
            {"question_id": q2_id, "answer": "In-order"},
        ],
        "time_taken_seconds": 300,
    }
    sub_res = client.post(f"/api/v1/assessments/{asmt_id}/submit", json=submit_payload, headers=stud_headers)
    assert sub_res.status_code == 200
    res_data = sub_res.json()
    assert res_data["score"] == 100.0
    assert res_data["passed"] == True

    # Verify that a verified skill evidence was generated in Skill Passport
    passport_res = client.get("/api/v1/passport/evidence", headers=stud_headers)
    assert passport_res.status_code == 200
    evidence_list = passport_res.json()
    assert any("Data Structures Core Competence" in item["skill_name"] for item in evidence_list)
