"""
Nam Nadu — Database Connection & Session Management
Supports SQLite (demo) and MySQL/PostgreSQL (production).
"""
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase
from sqlalchemy.pool import StaticPool

from app.core.config import settings


# ── Declarative Base ─────────────────────────────────────────────
class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


# ── Engine ───────────────────────────────────────────────────────
def _create_engine():
    """Build the correct engine based on DATABASE_URL dialect."""
    if settings.DATABASE_URL.startswith("sqlite"):
        return create_engine(
            settings.DATABASE_URL,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=False,
        )
    # MySQL / PostgreSQL
    return create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        echo=False,
    )


engine = _create_engine()

# ── Session Factory ──────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ── Dependency ───────────────────────────────────────────────────
def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency — yields a DB session and ensures cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Init ─────────────────────────────────────────────────────────
def init_db() -> None:
    """Create all tables from the ORM metadata.

    NOTE: Import all model modules here so their tables are registered
    on ``Base.metadata`` before ``create_all`` runs.
    """
    import app.models.user  # noqa: F401
    import app.models.department  # noqa: F401
    import app.models.master  # noqa: F401
    import app.models.complaint  # noqa: F401
    import app.models.project  # noqa: F401
    import app.models.notification  # noqa: F401
    import app.models.feedback  # noqa: F401
    import app.models.analytics  # noqa: F401
    import app.models.leadership  # noqa: F401 — ensures leadership tables are created

    Base.metadata.create_all(bind=engine)
