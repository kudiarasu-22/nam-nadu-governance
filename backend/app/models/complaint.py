"""
Nam Nadu — Complaint Models
"""
from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, Boolean,
    ForeignKey, Enum, Index,
)
from sqlalchemy.orm import relationship

from app.database.connection import Base
from app.models.mixins import TimestampMixin
from app.models.enums import ComplaintStatus, Priority


class Complaint(Base, TimestampMixin):
    """Citizen complaints."""

    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_number = Column(String(50), unique=True, index=True, nullable=True) # e.g., NN-CHN-2026-000124
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Master Data Foreign Keys
    category_id = Column(Integer, ForeignKey("complaint_categories.id"), nullable=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=True, index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=True, index=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=True, index=True)
    location_detail_id = Column(Integer, ForeignKey("location_details.id"), nullable=True, index=True)

    # Legacy / Fallback Fields
    category = Column(String(100), nullable=True, index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(500), nullable=True) # Used for manual fallback landmark
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    ward = Column(String(100), nullable=True, index=True)
    
    status = Column(
        Enum(ComplaintStatus), default=ComplaintStatus.DRAFT, nullable=False, index=True
    )
    priority = Column(
        Enum(Priority), default=Priority.MEDIUM, nullable=False, index=True
    )
    assigned_officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    attachment_url = Column(String(500), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    # Phase 2 SLA & Escalation
    is_draft = Column(Boolean, default=False, nullable=False, index=True)
    sla_deadline = Column(DateTime, nullable=True)
    is_sla_breached = Column(Boolean, default=False, nullable=False)
    escalation_level = Column(Integer, default=0, nullable=False)
    escalated_at = Column(DateTime, nullable=True)
    
    # Reopen
    reopen_count = Column(Integer, default=0, nullable=False)

    # Relationships
    citizen = relationship("User", back_populates="complaints", foreign_keys=[citizen_id])
    
    # Master Relationships
    category_rel = relationship("ComplaintCategory")
    district_rel = relationship("District")
    ward_rel = relationship("Ward")
    area_rel = relationship("Area")
    location_detail_rel = relationship("LocationDetail")
    updates = relationship(
        "ComplaintUpdate",
        back_populates="complaint",
        order_by="ComplaintUpdate.created_at.desc()",
        cascade="all, delete-orphan",
    )
    media = relationship(
        "ComplaintMedia",
        back_populates="complaint",
        cascade="all, delete-orphan",
    )
    audit_logs = relationship(
        "ComplaintAuditLog",
        back_populates="complaint",
        order_by="ComplaintAuditLog.created_at.desc()",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("idx_complaint_citizen", "citizen_id"),
        Index("idx_complaint_officer", "assigned_officer_id"),
        Index("idx_complaint_status_priority", "status", "priority"),
    )


class ComplaintMedia(Base, TimestampMixin):
    """Professional Media System for Complaints."""

    __tablename__ = "complaint_media"

    id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False, index=True)
    media_type = Column(String(50), nullable=False) # e.g. image, video, pdf
    file_url = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=True) # in bytes
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    complaint = relationship("Complaint", back_populates="media")
    uploader = relationship("User", foreign_keys=[uploaded_by])


class ComplaintAuditLog(Base, TimestampMixin):
    """Full Audit Log for Government Accountability."""

    __tablename__ = "complaint_audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action_type = Column(String(100), nullable=False) # e.g., STATUS_CHANGE, MEDIA_UPLOAD, EDITED, REOPENED, COMMENT
    details = Column(Text, nullable=True) # JSON or text string
    ip_address = Column(String(50), nullable=True)

    # Relationships
    complaint = relationship("Complaint", back_populates="audit_logs")
    user = relationship("User", foreign_keys=[user_id])


class ComplaintUpdate(Base, TimestampMixin):
    """Status updates on complaints. (Legacy / Soft Deprecated in favor of Audit Log, but keeping for compatibility)"""

    __tablename__ = "complaint_updates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(ComplaintStatus), nullable=False)
    comment = Column(Text, nullable=True)
    attachment_url = Column(String(500), nullable=True)

    # Relationships
    complaint = relationship("Complaint", back_populates="updates")
