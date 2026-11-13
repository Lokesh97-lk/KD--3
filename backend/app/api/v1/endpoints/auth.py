"""Authentication endpoints for login, registration, and user session management."""

from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.analytics.event_tracker import EventTracker
from app.api.dependencies import get_current_user, get_db
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User, UserRole

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: str
    password: str = Field(..., min_length=6)
    role: Optional[str] = "student"


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    timezone: str
    is_active: bool
    created_at: str


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


def user_to_dict(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role.value if hasattr(user.role, "value") else str(user.role),
        "timezone": user.timezone,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat(),
    }


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email and password, returning JWT access token."""
    user = db.execute(select(User).where(User.email == req.email.lower())).scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )

    token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        extra_claims={"email": user.email, "role": user.role.value if hasattr(user.role, "value") else str(user.role)},
    )

    EventTracker.log_audit(
        db=db,
        action="USER_LOGIN",
        resource_type="user",
        resource_id=user.id,
        user_id=user.id,
        details={"email": user.email},
    )

    return {"token": token, "user": user_to_dict(user)}


@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new student, instructor, or administrator account."""
    existing = db.execute(select(User).where(User.email == req.email.lower())).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Determine role
    role_str = (req.role or "student").lower()
    if role_str == "admin":
        assigned_role = UserRole.ADMIN
    elif role_str == "instructor":
        assigned_role = UserRole.INSTRUCTOR
    else:
        assigned_role = UserRole.STUDENT

    user = User(
        email=req.email.lower(),
        full_name=req.full_name,
        hashed_password=get_password_hash(req.password),
        role=assigned_role,
        is_active=True,
        is_verified=True,
        timezone="UTC",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        extra_claims={"email": user.email, "role": user.role.value if hasattr(user.role, "value") else str(user.role)},
    )

    EventTracker.log_audit(
        db=db,
        action="USER_REGISTERED",
        resource_type="user",
        resource_id=user.id,
        user_id=user.id,
        details={"email": user.email, "role": user.role.value if hasattr(user.role, "value") else str(user.role)},
    )

    return {"token": token, "user": user_to_dict(user)}


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user)):
    """Returns the authenticated user's current identity profile."""
    return user_to_dict(user)
