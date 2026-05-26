"""
Nam Nadu — Project Models
"""
from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, Boolean,
    ForeignKey, Enum, Index,
)
from sqlalchemy.orm import relationship

from app.database.connection import Base
from app.models.mixins import TimestampMixin
from app.models.enums import ProjectStatus


class GovernmentProject(Base, TimestampMixin):
    """Government projects and schemes."""

    __tablename__ = "government_projects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    budget = Column(Float, nullable=True)
    status = Column(
        Enum(ProjectStatus), default=ProjectStatus.PROPOSED, nullable=False, index=True
    )
    ward = Column(String(100), nullable=True, index=True)
    location = Column(String(500), nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    contractor_id = Column(Integer, ForeignKey("contractors.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    department = relationship("Department", back_populates="projects")
    progress_updates = relationship("ProjectProgress", back_populates="project")
    fund_allocations = relationship("FundAllocation", back_populates="project")
    contractor = relationship("Contractor", backref="projects")

    __table_args__ = (
        Index("idx_project_dept", "department_id"),
        Index("idx_project_status", "status"),
    )


class ProjectProgress(Base, TimestampMixin):
    """Progress updates on projects."""

    __tablename__ = "project_progress"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("government_projects.id"), nullable=False)
    percentage = Column(Float, nullable=False, default=0)
    milestone = Column(String(300), nullable=True)
    description = Column(Text, nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    attachment_url = Column(String(500), nullable=True)

    # Relationships
    project = relationship("GovernmentProject", back_populates="progress_updates")


class FundAllocation(Base, TimestampMixin):
    """Fund allocations for projects."""

    __tablename__ = "fund_allocations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("government_projects.id"), nullable=False)
    amount = Column(Float, nullable=False)
    source = Column(String(200), nullable=True)
    allocated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    fiscal_year = Column(String(10), nullable=True)
    description = Column(Text, nullable=True)

    # Relationships
    project = relationship("GovernmentProject", back_populates="fund_allocations")


class Contractor(Base, TimestampMixin):
    """Government contractors."""

    __tablename__ = "contractors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    company = Column(String(300), nullable=True)
    license_no = Column(String(100), unique=True, nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(15), nullable=True)
    rating = Column(Float, default=0)
    is_blacklisted = Column(Boolean, default=False)
