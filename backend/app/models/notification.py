"""
Nam Nadu — Notification Model
"""
from sqlalchemy import (
    Column, Integer, String, Text, Boolean,
    ForeignKey, Enum, Index,
)
from sqlalchemy.orm import relationship

from app.database.connection import Base
from app.models.mixins import TimestampMixin
from app.models.enums import NotificationType, NotificationChannel


class Notification(Base, TimestampMixin):
    """User notifications."""

    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(300), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(
        Enum(NotificationType), default=NotificationType.INFO, nullable=False
    )
    channel = Column(
        Enum(NotificationChannel), default=NotificationChannel.IN_APP, nullable=False
    )
    is_read = Column(Boolean, default=False, nullable=False)
    link = Column(String(500), nullable=True)

    # Relationships
    user = relationship("User", back_populates="notifications")

    __table_args__ = (Index("idx_notif_user_read", "user_id", "is_read"),)
