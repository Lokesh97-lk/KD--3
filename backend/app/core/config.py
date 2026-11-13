"""Application configuration settings using Pydantic Settings."""

import json
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Core application settings."""

    # Project metadata
    PROJECT_NAME: str = "CodeIntellect"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production-replace-with-secure-random"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520  # 8 days for development

    # Database
    DATABASE_URL: str | None = None
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "codeintellect"

    # CORS
    CORS_ORIGINS: list[str] | str = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    # Code execution runner service
    CODE_RUNNER_URL: str = "http://localhost:8001"
    CODE_RUNNER_SECRET: str = "runner-secret-key-change-in-prod"
    RUNNER_TIMEOUT_SECONDS: int = 10

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except (json.JSONDecodeError, TypeError):
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return []

    @property
    def sync_database_url(self) -> str:
        """Returns the synchronous database URL for SQLAlchemy and Alembic."""
        if self.DATABASE_URL:
            # Handle sqlite relative path resolution and auto-create directory
            if self.DATABASE_URL.startswith("sqlite:///"):
                sqlite_path = self.DATABASE_URL.replace("sqlite:///", "")
                db_file = Path(sqlite_path).resolve()
                db_file.parent.mkdir(parents=True, exist_ok=True)
                return f"sqlite:///{db_file.as_posix()}"
            return self.DATABASE_URL

        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
