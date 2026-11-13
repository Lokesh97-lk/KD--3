"""Tests for cryptographic security functions and JWT tokens."""

from datetime import timedelta

import pytest
from app.core.exceptions import AuthenticationError
from app.core.security import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)


def test_password_hashing_and_verification():
    """Verify password hashing creates verifiable bcrypt hashes."""
    password = "StrongPassword#2026"
    hashed = get_password_hash(password)

    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_roundtrip():
    """Verify JWT access tokens can be issued and decoded."""
    user_id = "test-user-uuid-1234"
    token = create_access_token(subject=user_id, extra_claims={"role": "student"})

    payload = decode_access_token(token)
    assert payload["sub"] == user_id
    assert payload["role"] == "student"
    assert "exp" in payload
    assert "iat" in payload


def test_jwt_token_expiration():
    """Verify expired JWT tokens raise AuthenticationError."""
    user_id = "expired-user"
    expired_token = create_access_token(
        subject=user_id,
        expires_delta=timedelta(seconds=-10),  # expired 10s ago
    )

    with pytest.raises(AuthenticationError):
        decode_access_token(expired_token)


def test_invalid_jwt_token():
    """Verify tampered JWT tokens raise AuthenticationError."""
    with pytest.raises(AuthenticationError):
        decode_access_token("not.a.valid.jwt.token")
