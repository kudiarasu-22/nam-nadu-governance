"""
Nam Nadu — Authentication Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import (
    LoginRequest, RegisterRequest, TokenResponse, UserResponse, RefreshRequest,
)
from app.schemas.common import MessageResponse
from app.services.auth_service import (
    authenticate_user, register_user, create_tokens, user_to_response,
)
from app.auth.dependencies import get_current_user
from app.auth.jwt_handler import verify_token, create_access_token, create_refresh_token
from app.models.user import User

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register", response_model=MessageResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new citizen account."""
    try:
        register_user(db, request)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    return {"message": "User registered successfully", "success": True}


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate and return JWT tokens."""
    user = authenticate_user(db, request.identifier, request.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    tokens = create_tokens(user)
    user_data = user_to_response(user)

    return {
        **tokens,
        "token_type": "bearer",
        "user": user_data,
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return user_to_response(current_user)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(request: RefreshRequest, db: Session = Depends(get_db)):
    """Refresh access token."""
    payload = verify_token(request.refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
        
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id), User.is_deleted == False).first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
        
    tokens = create_tokens(user)
    return {
        **tokens,
        "token_type": "bearer",
        "user": user_to_response(user),
    }

@router.post("/logout", response_model=MessageResponse)
def logout():
    """Dummy logout endpoint. JWTs are stateless, client clears token."""
    return {"message": "Logged out successfully", "success": True}

