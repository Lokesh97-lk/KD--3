"""Live end-to-end integration test verifying all running microservices and endpoints."""

import httpx
import pytest


def test_live_system_end_to_end():
    client = httpx.Client(base_url="http://127.0.0.1:8000/api/v1", timeout=10.0)

    # 1. Student Authentication
    res_login = client.post(
        "/auth/login",
        json={"email": "alex.chen@codeintellect.io", "password": "Secr3t!P@ssword2026"},
    )
    assert res_login.status_code == 200, res_login.text
    token = res_login.json()["token"]
    student_headers = {"Authorization": f"Bearer {token}"}

    # 2. Courses Catalog
    res_courses = client.get("/courses", headers=student_headers)
    assert res_courses.status_code == 200
    courses = res_courses.json()
    assert len(courses) >= 2

    # 3. Problem Catalog & Monaco Code Lab
    res_probs = client.get("/problems", headers=student_headers)
    assert res_probs.status_code == 200
    problems = res_probs.json()
    assert len(problems) >= 3
    prob = problems[0]

    # Run Code
    run_res = client.post(
        "/execution/run",
        json={
            "problem_id": prob["id"],
            "code": prob["starter_code"]["python"],
            "language": "python",
            "stdin": "3\n4\n100\n200\n500\n1200",
        },
        headers=student_headers,
    )
    assert run_res.status_code == 200
    run_data = run_res.json()
    assert run_data["verdict"] == "Accepted"
    assert "ALLOW" in run_data["stdout"]

    # Submit Code
    sub_res = client.post(
        "/execution/submit",
        json={
            "problem_id": prob["id"],
            "code": prob["starter_code"]["python"],
            "language": "python",
        },
        headers=student_headers,
    )
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert sub_data["verdict"] == "Accepted"
    assert sub_data["passed_tests"] > 0

    # 4. Learning Observatory Telemetry
    ov_res = client.get("/analytics/overview", headers=student_headers)
    assert ov_res.status_code == 200
    ov_data = ov_res.json()
    assert ov_data["total_study_hours"] > 0
    assert ov_data["focus_efficiency_score"] > 50

    # 5. Concept Dependency Graph
    dag_res = client.get("/analytics/concept-graph", headers=student_headers)
    assert dag_res.status_code == 200
    nodes = dag_res.json()
    assert len(nodes) >= 4

    # 6. Admin Governance
    admin_login = client.post(
        "/auth/login",
        json={"email": "admin.lead@codeintellect.io", "password": "Secr3t!P@ssword2026"},
    )
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    health_res = client.get("/admin/health", headers=admin_headers)
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "operational"

    users_res = client.get("/admin/users", headers=admin_headers)
    assert users_res.status_code == 200
    assert len(users_res.json()) >= 4

    # 7. Instructor Studio
    inst_login = client.post(
        "/auth/login",
        json={"email": "instructor.elena@codeintellect.io", "password": "Secr3t!P@ssword2026"},
    )
    assert inst_login.status_code == 200
    inst_token = inst_login.json()["token"]
    inst_headers = {"Authorization": f"Bearer {inst_token}"}

    stats_res = client.get("/instructor/stats", headers=inst_headers)
    assert stats_res.status_code == 200
    assert "active_students" in stats_res.json()
