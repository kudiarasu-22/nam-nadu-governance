"""
Nam Nadu — Leadership Models
"""
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime,
    ForeignKey, Text, Index
)
from sqlalchemy.orm import relationship

from app.database.connection import Base
from app.models.mixins import TimestampMixin

class MlaProfile(Base, TimestampMixin):
    """Profiles for Members of Legislative Assembly."""

    __tablename__ = "mla_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mla_id = Column(String(50), unique=True, index=True, nullable=False) # TN-MLA-DISTRICT-NUMBER
    name = Column(String(150), nullable=False)
    political_party = Column(String(100), nullable=False)
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=False)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(15), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    district = relationship("District")
    ward = relationship("Ward")
    auth = relationship("MlaAuth", back_populates="profile", uselist=False, cascade="all, delete-orphan")
    performance = relationship("MlaPerformance", back_populates="profile", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("MlaNotification", back_populates="profile", cascade="all, delete-orphan")
    login_audits = relationship("MlaLoginAudit", back_populates="profile", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_mla_district", "district_id"),
        Index("idx_mla_ward", "ward_id"),
    )


class MlaAuth(Base, TimestampMixin):
    """Authentication details strictly for MLAs to keep them isolated."""

    __tablename__ = "mla_auth"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mla_profile_id = Column(Integer, ForeignKey("mla_profiles.id"), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    profile = relationship("MlaProfile", back_populates="auth")


class MlaPerformance(Base, TimestampMixin):
    """Performance metrics for MLAs calculated automatically."""

    __tablename__ = "mla_performance"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mla_profile_id = Column(Integer, ForeignKey("mla_profiles.id"), unique=True, nullable=False)
    complaint_resolution_percent = Column(Float, default=0.0)
    project_completion_percent = Column(Float, default=0.0)
    citizen_satisfaction_score = Column(Float, default=0.0)
    escalation_count = Column(Integer, default=0)
    delayed_issues_count = Column(Integer, default=0)
    overall_score = Column(Float, default=0.0)
    performance_label = Column(String(50), default="Average") # Excellent, Good, Average, Poor

    # Relationships
    profile = relationship("MlaProfile", back_populates="performance")


class MlaNotification(Base, TimestampMixin):
    """Notifications specific to MLAs."""

    __tablename__ = "mla_notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mla_profile_id = Column(Integer, ForeignKey("mla_profiles.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    notification_type = Column(String(50), nullable=True) # e.g., 'escalated_complaint', 'project_delay'

    # Relationships
    profile = relationship("MlaProfile", back_populates="notifications")


class MlaLoginAudit(Base, TimestampMixin):
    """Audit logs for MLA logins."""

    __tablename__ = "mla_login_audit"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mla_profile_id = Column(Integer, ForeignKey("mla_profiles.id"), nullable=False)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)

    # Relationships
    profile = relationship("MlaProfile", back_populates="login_audits")


class CmDashboardStat(Base, TimestampMixin):
    """Cache/Snapshot table for CM Dashboard state-wide stats."""

    __tablename__ = "cm_dashboard_stats"

    id = Column(Integer, primary_key=True, autoincrement=True)
    total_complaints = Column(Integer, default=0)
    resolved_complaints = Column(Integer, default=0)
    total_projects = Column(Integer, default=0)
    completed_projects = Column(Integer, default=0)
    avg_citizen_satisfaction = Column(Float, default=0.0)
    total_escalations = Column(Integer, default=0)
    top_performing_mlas = Column(Text, nullable=True) # Could be JSON string
    bottom_performing_mlas = Column(Text, nullable=True) # Could be JSON string
    stat_date = Column(DateTime, nullable=False) # The date this snapshot represents


class WardEmergencyAlert(Base, TimestampMixin):
    """Emergency alerts raised by MLAs for their wards."""

    __tablename__ = "ward_emergency_alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mla_profile_id = Column(Integer, ForeignKey("mla_profiles.id"), nullable=False)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    level = Column(String(50), nullable=False) # Low, Medium, High, Emergency
    status = Column(String(50), default="active") # active, resolved
    
    # Relationships
    profile = relationship("MlaProfile")
    ward = relationship("Ward")
