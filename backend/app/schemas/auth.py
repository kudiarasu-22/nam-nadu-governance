"""
Nam Nadu — Auth Schemas
Pydantic models for authentication request/response.
"""
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Login with email/phone + password."""
    identifier: str
    password: str = Field(..., min_length=6)


class RegisterRequest(BaseModel):
    """New user registration."""
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    phone: Optional[str] = Field(None, pattern=r"^[6-9]\d{9}$")
    password: str = Field(..., min_length=8)
    role: str = "citizen"
    ward: Optional[str] = None


class UserResponse(BaseModel):
    """Public user info returned from auth endpoints."""
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    ward: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """JWT token pair + user info."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshRequest(BaseModel):
    """Token refresh request."""
    refresh_token: str
