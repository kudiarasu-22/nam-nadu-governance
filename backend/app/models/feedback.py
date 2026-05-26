"""
Nam Nadu — Feedback & Voting Models
"""
from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, Boolean,
    ForeignKey, Enum, Index, UniqueConstraint,
)

from app.database.connection import Base
from app.models.mixins import TimestampMixin
from app.models.enums import VoteType, Severity, TaskType, TaskStatus


class PublicFeedback(Base, TimestampMixin):
    """Public feedback on projects, services, departments."""

    __tablename__ = "public_feedback"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=False)
    rating = Column(Integer, nullable=True)
    comment = Column(Text, nullable=True)

    __table_args__ = (Index("idx_feedback_entity", "entity_type", "entity_id"),)


class Vote(Base, TimestampMixin):
    """Votes on entities (projects, feedback, etc.)."""

    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=False)
    vote_type = Column(Enum(VoteType), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "entity_type", "entity_id", name="uq_user_entity_vote"),
        Index("idx_vote_entity", "entity_type", "entity_id"),
    )


class Volunteer(Base, TimestampMixin):
    """Volunteer profiles."""

    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    skills = Column(String(500), nullable=True)
    availability = Column(String(100), nullable=True)
    assigned_ward = Column(String(100), nullable=True)
    total_hours = Column(Float, default=0)
    is_verified = Column(Boolean, default=False)

    # Relationships
    from sqlalchemy.orm import relationship
    user = relationship("User", back_populates="volunteer_profile")


class EmergencyAlert(Base, TimestampMixin):
    """Emergency alerts and broadcasts."""

    __tablename__ = "emergency_alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(Enum(Severity), nullable=False, index=True)
    area = Column(String(200), nullable=True)
    issued_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime, nullable=True)


class VolunteerTask(Base, TimestampMixin):
    """Gamified tasks for volunteers."""

    __tablename__ = "volunteer_tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    ward = Column(String(100), nullable=True)
    points = Column(Integer, default=0, nullable=False)
    hours = Column(Float, default=0.0, nullable=False)
    task_type = Column(Enum(TaskType), nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.OPEN, nullable=False)
    urgency = Column(Enum(Severity), default=Severity.LOW, nullable=False)
    volunteer_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    from sqlalchemy.orm import relationship
    volunteer = relationship("User", foreign_keys=[volunteer_id])
