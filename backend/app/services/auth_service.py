"""
Nam Nadu — Auth Service
Synchronous business logic for authentication operations.
"""
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.user import User, Role
from app.models.enums import RoleName
from app.core.security import hash_password, verify_password
from app.auth.jwt_handler import create_access_token, create_refresh_token
from app.schemas.auth import RegisterRequest


def authenticate_user(db: Session, identifier: str, password: str) -> User | None:
    """
    Verify user credentials.
    Returns the User if valid, None otherwise.
    """
    identifier = identifier.strip()

    user = (
        db.query(User)
        .filter(
            or_(User.email == identifier, User.phone == identifier),
            User.is_deleted == False,  # noqa: E712
        )
        .first()
    )

    if not user or not verify_password(password, user.password_hash):
        return None

    # Update last login timestamp
    user.last_login = datetime.now(timezone.utc)
    db.commit()

    return user


def register_user(db: Session, data: RegisterRequest) -> User:
    """
    Register a new user.
    Raises ValueError if the email is already in use.
    """
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise ValueError("Email already registered")

    # Resolve role
    role_name = (
        RoleName(data.role)
        if data.role in [r.value for r in RoleName]
        else RoleName.CITIZEN
    )
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        role = Role(name=role_name, description=f"{role_name.value} role")
        db.add(role)
        db.flush()

    user = User(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role_id=role.id,
        ward=data.ward,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def create_tokens(user: User) -> dict:
    """Generate access + refresh token pair for a user."""
    token_data = {"sub": str(user.id)}
    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
    }


def user_to_response(user: User) -> dict:
    """Convert User ORM model to a plain dict matching UserResponse schema."""
    role_name = (
        user.role.name.value
        if user.role and isinstance(user.role.name, RoleName)
        else (user.role.name if user.role else "citizen")
    )
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role": role_name,
        "ward": user.ward,
        "is_active": user.is_active,
    }
