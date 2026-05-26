"""
Nam Nadu — Session Utilities
Standalone session helpers for scripts and background tasks.
"""
from app.database.connection import SessionLocal


def get_session():
    """Get a standalone session (not a FastAPI dependency)."""
    return SessionLocal()
