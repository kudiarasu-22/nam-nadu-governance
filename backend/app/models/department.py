"""
Nam Nadu — Department & Officer Models
"""
from sqlalchemy import (
    Column, Integer, String, Text, ForeignKey, Index,
)
from sqlalchemy.orm import relationship

from app.database.connection import Base
from app.models.mixins import TimestampMixin


class Department(Base, TimestampMixin):
    """Government departments."""

    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    head_officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(15), nullable=True)

    # Relationships
    officers = relationship("Officer", back_populates="department")
    projects = relationship("GovernmentProject", back_populates="department")


class Officer(Base, TimestampMixin):
    """Officer profiles linked to users."""

    __tablename__ = "officers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    designation = Column(String(200), nullable=False)
    jurisdiction = Column(String(200), nullable=True)
    employee_id = Column(String(50), unique=True, nullable=True)

    # Relationships
    user = relationship("User", back_populates="officer_profile")
    department = relationship("Department", back_populates="officers")

    __table_args__ = (Index("idx_officer_dept", "department_id"),)
