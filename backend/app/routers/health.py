"""
Nam Nadu — Health Check Endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db

router = APIRouter(prefix="/api/v1", tags=["Health"])


@router.get("/health")
async def health_check():
    """Application health check."""
    return {
        "status": "healthy",
        "message": "Nam Nadu Backend API is running",
        "service": "nam-nadu-api",
    }


@router.get("/health/db")
def health_check_db(db: Session = Depends(get_db)):
    """Database connectivity check — executes a real query."""
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "connected",
            "database": "sqlite",
            "message": "Database connection successful",
        }
    except Exception as exc:
        return {
            "status": "error",
            "database": "sqlite",
            "message": str(exc),
        }
