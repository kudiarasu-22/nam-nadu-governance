"""
Nam Nadu — Analytics Model
"""
from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime, Index

from app.database.connection import Base
from app.models.mixins import TimestampMixin


class Analytics(Base, TimestampMixin):
    """Analytics metrics storage."""

    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    metric_name = Column(String(200), nullable=False, index=True)
    value = Column(Float, nullable=False)
    dimension = Column(String(200), nullable=True)
    dimension_value = Column(String(200), nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_analytics_metric_date", "metric_name", "recorded_at"),
    )
