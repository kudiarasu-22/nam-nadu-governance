"""
Nam Nadu — Master Data Schemas
"""
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class MasterBase(BaseModel):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DistrictSchema(MasterBase):
    name: str
    state: str
    district_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class WardSchema(MasterBase):
    ward_number: str
    ward_name: Optional[str] = None
    district_id: int
    zone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AreaSchema(MasterBase):
    name: str
    ward_id: int
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class LocationDetailSchema(MasterBase):
    area_id: int
    street_name: Optional[str] = None
    landmark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    pincode: Optional[str] = None


class ComplaintCategorySchema(MasterBase):
    name: str
    icon: Optional[str] = None
    department_id: int
    priority_default: Optional[str] = None
    sla_hours: Optional[int] = None
    severity_level: Optional[str] = None
    requires_photo: bool
    citizen_visibility: bool
    estimated_resolution_hours: Optional[int] = None
    auto_assign_enabled: bool


class DetectedLocationSchema(BaseModel):
    district: Optional[DistrictSchema] = None
    ward: Optional[WardSchema] = None
    area: Optional[AreaSchema] = None
    location_detail: Optional[LocationDetailSchema] = None
    distance_km: float
