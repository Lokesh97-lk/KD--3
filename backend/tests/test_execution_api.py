"""Tests for isolated code execution, test cases evaluation, and submission verdicts."""

import pytest
from fastapi.testclient import TestClient


def test_code_run_and_submit_flow(client: TestClient):
    # Register student
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Execution Tester",
            "email": "exec.tester@codeintellect.io",
            "password": "SecurePassword123!",
            "role": "student",
        },
    ).json()
    token = reg["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Register instructor and create a problem
    reg_inst = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Instructor Problem Author",
            "email": "author@codeintellect.io",
            "password": "SecurePassword123!",
            "role": "instructor",
        },
    ).json()
    inst_headers = {"Authorization": f"Bearer {reg_inst['token']}"}

    prob_payload = {
        "title": "Sum of Array Invariants",
        "slug": "sum-array-invariants",
        "difficulty": "Easy",
        "topic": "Algorithms",
        "description": "Calculate sum of integers.",
        "constraints": ["1 <= N <= 100"],
        "starter_code": {"python": "import sys\nprint(sum(map(int, sys.stdin.read().split())))\n"},
        "time_limit_ms": 2000,
        "memory_limit_mb": 128,
        "test_cases": [
            {
                "input_data": "1 2 3 4 5",
                "expected_output": "15",
                "is_hidden": False,
                "explanation": "Sample test 1",
            },
            {
                "input_data": "10 -5 20",
                "expected_output": "25",
                "is_hidden": True,
                "explanation": "Confidential test with negative numbers",
            },
        ],
    }
    prob_res = client.post("/api/v1/problems", json=prob_payload, headers=inst_headers)
    assert prob_res.status_code == 200, prob_res.text
    problem = prob_res.json()

    # 1. Test Run Code (Sample execution)
    run_payload = {
        "problem_id": problem["id"],
        "code": "import sys\nprint(sum(map(int, sys.stdin.read().split())))\n",
        "language": "python",
        "stdin": "3 4 5",
    }
    run_res = client.post("/api/v1/execution/run", json=run_payload, headers=headers)
    assert run_res.status_code == 200
    run_data = run_res.json()
    assert run_data["verdict"] == "Accepted"
    assert run_data["stdout"].strip() == "12"

    # 2. Test Submit Code with correct solution
    submit_payload = {
        "problem_id": problem["id"],
        "code": "import sys\nprint(sum(map(int, sys.stdin.read().split())))\n",
        "language": "python",
    }
    sub_res = client.post("/api/v1/execution/submit", json=submit_payload, headers=headers)
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert sub_data["verdict"] == "Accepted"
    assert sub_data["passed_tests"] == 2
    assert sub_data["total_tests"] == 2

    # 3. Test Submit Code with wrong solution
    wrong_payload = {
        "problem_id": problem["id"],
        "code": "print(0)\n",
        "language": "python",
    }
    sub_wrong = client.post("/api/v1/execution/submit", json=wrong_payload, headers=headers)
    assert sub_wrong.status_code == 200
    wrong_data = sub_wrong.json()
    assert wrong_data["verdict"] == "Wrong Answer"
    assert wrong_data["passed_tests"] == 0

    # 4. Check submissions history
    history_res = client.get(f"/api/v1/submissions?problem_id={problem['id']}", headers=headers)
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) >= 2
