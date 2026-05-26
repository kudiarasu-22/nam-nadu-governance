"""
Nam Nadu — User & Role Models
"""
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey,
    Enum, JSON, Index,
)
from sqlalchemy.orm import relationship

from app.database.connection import Base
from app.models.mixins import TimestampMixin
from app.models.enums import RoleName


class Role(Base, TimestampMixin):
    """User roles with permissions."""

    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Enum(RoleName), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)
    permissions = Column(JSON, nullable=True)

    # Relationships
    users = relationship("User", back_populates="role")


class User(Base, TimestampMixin):
    """Platform users — citizens, officers, admins, volunteers."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(15), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    ward = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    role = relationship("Role", back_populates="users")
    complaints = relationship(
        "Complaint", back_populates="citizen", foreign_keys="Complaint.citizen_id"
    )
    officer_profile = relationship("Officer", back_populates="user", uselist=False)
    volunteer_profile = relationship("Volunteer", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")

    __table_args__ = (
        Index("idx_user_role", "role_id"),
        Index("idx_user_ward", "ward"),
    )
