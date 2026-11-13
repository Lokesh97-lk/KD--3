"""API v1 master router aggregating all domain routers."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    admin,
    analytics,
    assessments,
    auth,
    courses,
    execution,
    health,
    instructor,
    lessons,
    passport,
    problems,
    projects,
    revision,
    submissions,
)

api_router = APIRouter()

# Core system endpoints
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(courses.router)
api_router.include_router(lessons.router)
api_router.include_router(problems.router)
api_router.include_router(execution.router)
api_router.include_router(submissions.router)
api_router.include_router(assessments.router)
api_router.include_router(analytics.router)
api_router.include_router(revision.router)
api_router.include_router(projects.router)
api_router.include_router(passport.router)
api_router.include_router(instructor.router)
api_router.include_router(admin.router)

__all__ = ["api_router"]
