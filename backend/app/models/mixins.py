"""
Nam Nadu — Common Mixins
Shared columns used across all models.
"""
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime


class TimestampMixin:
    """Adds created_at, updated_at, and soft-delete flag to all models."""

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
