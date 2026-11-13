"""FastAPI Application entrypoint for CodeIntellect."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import logger, setup_logging
from app.db.init_db import init_db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan event handler for application startup and shutdown."""
    setup_logging()
    logger.info(
        f"Starting {settings.PROJECT_NAME} in '{settings.ENVIRONMENT}' environment..."
    )

    # Initialize database tables
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except (SQLAlchemyError, OSError) as exc:
        logger.error(f"Failed to initialize database during startup: {exc}")

    yield

    logger.info(f"Shutting down {settings.PROJECT_NAME}...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "CodeIntellect: Intelligent Coding Learning and Practical Assessment Platform. "
        "Measures learning, analyzes coding behavior, identifies skill gaps, and verifies practical engineering competence."
    ),
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware configuration
cors_origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [str(settings.CORS_ORIGINS)]
if "*" in cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"^https?://.*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Global custom exception handlers
register_exception_handlers(app)

# Include master API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["System"])
def root() -> dict:
    """Root endpoint providing platform information and documentation links."""
    return {
        "name": settings.PROJECT_NAME,
        "description": "Intelligent Coding Learning and Practical Assessment Platform",
        "version": "1.0.0",
        "status": "operational",
        "documentation": "/docs",
        "api_v1": settings.API_V1_STR,
    }
