"""Script to create a superadmin user in the database."""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User, UserRole


def create_admin(email: str = "admin.lead@codeintellect.io", password: str = "Secr3t!P@ssword2026", name: str = "Administrator"):
    db = SessionLocal()
    try:
        user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        if user:
            user.role = UserRole.ADMIN
            user.hashed_password = get_password_hash(password)
            user.is_active = True
            db.commit()
            print(f"Admin user '{email}' updated successfully.")
        else:
            user = User(
                email=email,
                full_name=name,
                hashed_password=get_password_hash(password),
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            db.commit()
            print(f"Admin user '{email}' created successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
