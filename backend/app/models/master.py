"""
Nam Nadu — Master Governance Data Models
"""
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, ForeignKey, Index
)
from sqlalchemy.orm import relationship

from app.database.connection import Base
from app.models.mixins import TimestampMixin


class District(Base, TimestampMixin):
    """Tamil Nadu Districts."""

    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    state = Column(String(100), default="Tamil Nadu", nullable=False)
    district_code = Column(String(20), nullable=True, unique=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Relationships
    wards = relationship("Ward", back_populates="district", cascade="all, delete-orphan")


class Ward(Base, TimestampMixin):
    """Wards within a district."""

    __tablename__ = "wards"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ward_number = Column(String(50), nullable=False)
    ward_name = Column(String(150), nullable=True)
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=False, index=True)
    zone = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Relationships
    district = relationship("District", back_populates="wards")
    areas = relationship("Area", back_populates="ward", cascade="all, delete-orphan")


class Area(Base, TimestampMixin):
    """Areas within a ward."""

    __tablename__ = "areas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False, index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False, index=True)
    pincode = Column(String(20), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Relationships
    ward = relationship("Ward", back_populates="areas")
    location_details = relationship("LocationDetail", back_populates="area", cascade="all, delete-orphan")


class LocationDetail(Base, TimestampMixin):
    """Specific streets or landmarks within an area."""

    __tablename__ = "location_details"

    id = Column(Integer, primary_key=True, autoincrement=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=False, index=True)
    street_name = Column(String(200), nullable=True, index=True)
    landmark = Column(String(200), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    pincode = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Relationships
    area = relationship("Area", back_populates="location_details")


class ComplaintCategory(Base, TimestampMixin):
    """Master list of complaint categories with smart metadata."""

    __tablename__ = "complaint_categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False, unique=True, index=True)
    icon = Column(String(100), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False, index=True)
    
    # Existing settings
    priority_default = Column(String(50), nullable=True)
    sla_hours = Column(Integer, nullable=True)
    
    # Smart Category Metadata
    severity_level = Column(String(50), nullable=True)
    requires_photo = Column(Boolean, default=False, nullable=False)
    citizen_visibility = Column(Boolean, default=True, nullable=False)
    estimated_resolution_hours = Column(Integer, nullable=True)
    auto_assign_enabled = Column(Boolean, default=False, nullable=False)
    
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Relationships
    department = relationship("Department")
