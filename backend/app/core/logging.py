"""Structured logging configuration for CodeIntellect."""

import logging
import sys

from app.core.config import settings


class StructuredFormatter(logging.Formatter):
    """Clean, structured log formatter suitable for both console and log aggregators."""

    def format(self, record: logging.LogRecord) -> str:
        # Standard format with ISO-like timestamp and aligned levels
        timestamp = self.formatTime(record, "%Y-%m-%d %H:%M:%S")
        log_msg = (
            f"[{timestamp}] [{record.levelname:<7}] "
            f"[{record.name}:{record.funcName}:{record.lineno}] - {record.getMessage()}"
        )
        if record.exc_info:
            log_msg += f"\n{self.formatException(record.exc_info)}"
        return log_msg


def setup_logging(level: str | None = None) -> None:
    """Configures application-wide logging with structured output."""
    log_level = level or settings.LOG_LEVEL
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredFormatter())

    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)

    # Avoid duplicate handlers on re-init
    if not any(isinstance(h, logging.StreamHandler) for h in root_logger.handlers):
        root_logger.addHandler(handler)
    else:
        # Replace formatters
        for h in root_logger.handlers:
            h.setFormatter(StructuredFormatter())

    # Quiet noisy external libraries in debug mode
    logging.getLogger("uvicorn.access").setLevel(
        logging.WARNING if not settings.DEBUG else logging.INFO
    )
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.WARNING if not settings.DEBUG else logging.INFO
    )


# Application root logger
logger = logging.getLogger("codeintellect")
