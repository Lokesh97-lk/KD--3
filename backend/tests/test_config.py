"""Unit tests for application configuration settings."""

from app.core.config import Settings


def test_settings_default_values():
    """Verify that default settings instantiate with expected properties."""
    settings = Settings()
    assert settings.PROJECT_NAME == "CodeIntellect"
    assert settings.API_V1_STR == "/api/v1"
    assert settings.ALGORITHM == "HS256"
    assert settings.ACCESS_TOKEN_EXPIRE_MINUTES > 0
    assert len(settings.CORS_ORIGINS) >= 1


def test_cors_origins_string_parsing():
    """Verify that CORS origins string representation parses to list."""
    settings = Settings(CORS_ORIGINS="http://localhost:3000, http://example.com")
    assert "http://localhost:3000" in settings.CORS_ORIGINS
    assert "http://example.com" in settings.CORS_ORIGINS


def test_sync_database_url():
    """Verify sync database url calculation."""
    settings = Settings(DATABASE_URL="sqlite:///./test.db")
    assert settings.sync_database_url.startswith("sqlite:///")
