"""
Nam Nadu — Complaint Schemas
Pydantic models for citizen complaint management APIs.
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.enums import ComplaintStatus, Priority, Severity

# ── Media ─────────────────────────────────────────────────────────

class ComplaintMediaResponse(BaseModel):
    id: int
    media_type: str
    file_url: str
    file_name: str
    file_size: Optional[int]
    created_at: datetime
    
    model_config = {"from_attributes": True}


# ── Audit Log ──────────────────────────────────────────────────────

class ComplaintAuditLogResponse(BaseModel):
    id: int
    action_type: str
    details: Optional[str]
    created_at: datetime
    user_name: Optional[str] = None # We will populate this from user relationship
    
    model_config = {"from_attributes": True}


# ── Create & Update ────────────────────────────────────────────────

class ComplaintCreate(BaseModel):
    category_id: int
    district_id: int
    ward_id: int
    area_id: int
    location_detail_id: Optional[int] = None
    fallback_landmark: Optional[str] = None
    
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    priority: Optional[Priority] = Priority.MEDIUM
    severity: Optional[Severity] = Severity.MEDIUM


class ComplaintReopen(BaseModel):
    reason: str = Field(..., min_length=10)


# ── Responses ──────────────────────────────────────────────────────

class ComplaintDetailResponse(BaseModel):
    id: int
    complaint_number: Optional[str] = None
    title: str
    description: str
    status: ComplaintStatus
    priority: Priority
    is_draft: bool
    reopen_count: int
    
    category_id: Optional[int] = None
    district_id: Optional[int] = None
    ward_id: Optional[int] = None
    area_id: Optional[int] = None
    location_detail_id: Optional[int] = None
    
    category_name: Optional[str] = None
    location_string: Optional[str] = None
    
    created_at: datetime
    updated_at: datetime
    
    media: List[ComplaintMediaResponse] = []
    
    model_config = {"from_attributes": True}


class ComplaintListResponse(BaseModel):
    data: List[ComplaintDetailResponse]
    total: int
