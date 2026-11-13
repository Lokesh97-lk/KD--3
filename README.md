# CodeIntellect: Intelligent Coding Learning and Practical Assessment Platform

> **Measure learning, understand engineering ability, identify the root causes of skill gaps, and verify practical competence through real evidence.**

---

## 1. Project Overview

CodeIntellect is a developer engineering skill intelligence platform that bridges the gap between learning programming concepts and independently building, testing, debugging, securing, and delivering production software.

Unlike conventional LMS platforms or practice quiz sites, CodeIntellect focuses on:
- **Learning Observatory**: Deep observability into study time, focus distribution, and effort vs. mastery.
- **Concept Dependency Graph**: Versioned prerequisite chains showing blockers and mastery paths.
- **Debugging Intelligence**: Analysis of compiler errors, runtime exceptions, and time-to-fix metrics.
- **Skill Mastery Engine**: Transparent multi-dimensional scoring of conceptual, testing, and debugging competence.
- **Isolated Code Lab**: Secure, sandboxed evaluation with precise verdicts and test suite confidentiality.
- **Evidence-Based Skill Passport**: Verifiable profiles backed by concrete assessment and project evidence.

---

## 2. Repository Structure

```
E:\CodeIntellect
├── backend/
│   ├── app/
│   │   ├── api/v1/              # API version 1 routers and endpoints
│   │   │   ├── endpoints/       # Domain route handlers (health, auth, etc.)
│   │   │   └── router.py        # Master API v1 router
│   │   ├── analytics/           # Observatory, mastery, and debugging engines
│   │   ├── core/                # Config, security, exceptions, logging
│   │   ├── db/                  # Engine, sessionmaker, metadata base, init
│   │   ├── execution/           # Job queue, runner client, verdict processor
│   │   ├── models/              # SQLAlchemy 2.0 ORM models
│   │   ├── schemas/             # Pydantic v2 validation models
│   │   ├── services/            # Reusable business logic services
│   │   └── main.py              # FastAPI application factory and lifespan
│   ├── migrations/              # Alembic database migrations
│   ├── tests/                   # Backend unit, integration, and API tests
│   ├── alembic.ini              # Alembic configuration
│   └── requirements.txt         # Pinned backend Python dependencies
├── frontend/                    # Vite + React + TypeScript web application
├── code_runner/                 # Isolated code execution microservice
├── infrastructure/              # Docker, deployment, and monitoring assets
├── docs/                        # Architecture, database schema, and API docs
└── tests/                       # Root-level end-to-end and security tests
```

---

## 3. Technology Stack

- **Backend**: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, PostgreSQL (with SQLite local dev fallback)
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Monaco Editor, Lucide React
- **Code Execution**: Dedicated isolated runner with time, memory, output, and process limits
- **Testing & Quality**: Pytest, Pytest-Asyncio, HTTPX, Ruff

---

## 4. Getting Started (Local Development)

### Prerequisites

- **Python 3.11.x**
- **Node.js 20+** / npm 10+
- Optional: PostgreSQL 15+ / Docker

### 1. Backend Setup

```bash
# Create virtual environment with Python 3.11
py -3.11 -m venv .venv

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Install backend dependencies
.\.venv\Scripts\pip.exe install -r backend/requirements.txt
```

### 2. Environment Configuration

Copy the example configuration:

```bash
cp backend/.env.example backend/.env
```

### 3. Database Migrations

Apply the initial schema:

```bash
cd backend
..\.venv\Scripts\alembic.exe upgrade head
```

### 4. Running the Development Server

```bash
cd backend
..\.venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000
```

- API Base URL: `http://127.0.0.1:8000/api/v1`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`
- Health Probe: `http://127.0.0.1:8000/api/v1/health`
- Readiness Probe: `http://127.0.0.1:8000/api/v1/ready`

---

## 5. Running Tests and Linting

```bash
# Run backend test suite
.\.venv\Scripts\pytest.exe -v

# Run Ruff linter and formatter check
.\.venv\Scripts\ruff.exe check backend
.\.venv\Scripts\ruff.exe format --check backend
```

---

## 6. Implementation Status

- [x] **Phase 1: Foundation & Infrastructure** (Complete & Verified)
  - Python 3.11 virtual environment initialized
  - FastAPI application with lifespan management and structured logging
  - Pydantic Settings supporting PostgreSQL & SQLite dev fallback
  - SQLAlchemy 2.0 base metadata and complete ORM models (`User`, `AuditLog`, `Course`, `Problem`, `Submission`, `Assessment`, `Project`, etc.)
  - Alembic migrations and database tables initialized
  - Liveness (`/health`) and Readiness (`/ready`) endpoints active
  - Cryptographic security utilities (bcrypt + JWT)
- [x] **Phase 2: Authentication & Role Governance** (Complete & Verified)
  - Role-based access control for Student, Instructor, and Platform Administrator
  - JWT token issuance, session refresh, and automatic role redirection
- [x] **Phase 3: Learning Paths & Curriculum Management** (Complete & Verified)
  - Courses, modules, interactive lessons, and real-time student progress tracking
  - Lesson completion persistence, time-on-task telemetry, and curriculum authoring
- [x] **Phase 4: Isolated Code Lab & Execution Microservice** (Complete & Verified)
  - Monaco editor workspace with Python 3.11 and Node.js execution
  - Dedicated code runner sandbox with time limits, memory bounds, and output guards
  - Problem catalog with sample inputs and confidential assessment test suites
- [x] **Phase 5: Signature Intelligence & Learning Observatory** (Complete & Verified)
  - Observatory metrics: focused vs. passive time, efficiency index, daily trends
  - Debugging Intelligence: compiler/runtime error classification and time-to-fix analytics
  - Concept Dependency Graph (DAG) with prerequisite mastery and blocker isolation
  - Learning Debt & Spaced Revision Planner with dynamically generated recovery tasks
- [x] **Phase 6: Practical Project Studio & Assessments** (Complete & Verified)
  - Timed technical examinations with auto-graded MCQs and point scoring
  - Engineering scenario simulator with multi-dimensional rubrics and milestone submissions
  - Evidence-based Skill Passport with cryptographic verification and audit links
- [x] **Phase 7: Administration & Instructor Studio** (Complete & Verified)
  - Instructor rubric evaluation interface, cohort misconception analytics
  - Administrator user governance, role management, audit logging, and health monitoring
- [x] **Phase 8: Comprehensive Automated Testing** (Complete & Verified)
  - 23 unit, integration, and live end-to-end API tests passing with 100% success

---

## 7. Fast Development Identities

The database is seeded with ready-to-test developer credentials for each role:

| Role | Email | Password | Primary Workspace |
| :--- | :--- | :--- | :--- |
| **Student** | `alex.chen@codeintellect.io` | `Secr3t!P@ssword2026` | `/dashboard` (Workstation) |
| **Instructor** | `instructor.elena@codeintellect.io` | `Secr3t!P@ssword2026` | `/instructor` (Curriculum Studio) |
| **Administrator** | `admin.lead@codeintellect.io` | `Secr3t!P@ssword2026` | `/admin` (Platform Console) |

---

## 8. Service Endpoints & Ports

- **Frontend Application**: `http://localhost:5173`
- **FastAPI Backend**: `http://127.0.0.1:8000` (Docs: `http://127.0.0.1:8000/docs`)
- **Code Execution Runner**: `http://127.0.0.1:8001` (Health: `http://127.0.0.1:8001/health`)
