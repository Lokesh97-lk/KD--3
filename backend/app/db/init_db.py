"""Database initialization and initial seeding script."""

from app.core.logging import logger
from app.db.base import Base
from app.db.session import engine
from sqlalchemy.orm import Session


def init_db(db: Session = None) -> None:
    """Initializes the database schema."""
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified successfully.")


if __name__ == "__main__":
    init_db()
