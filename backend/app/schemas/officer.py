"""
Nam Nadu — Officer Schemas
Pydantic models for officer dashboard and management APIs.
"""
from typing import List, Optional, Dict
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.enums import ComplaintStatus, Priority, ProjectStatus


# ── Dashboard Stats ───────────────────────────────────────────────

class DashboardStatsResponse(BaseModel):
    active_complaints: int
    resolved_today: int
    avg_resolution_time: str
    escalated_complaints: int


# ── Complaints ───────────────────────────────────────────────────

class ComplaintResponse(BaseModel):
    id: int
    title: str
    category: Optional[str] = None
    description: str
    location: Optional[str] = None
    ward: Optional[str] = None
    status: ComplaintStatus
    priority: Priority
    citizen_name: str
    created_at: datetime
    
    model_config = {"from_attributes": True}


class ComplaintListResponse(BaseModel):
    data: List[ComplaintResponse]
    total: int


class ComplaintOfficerUpdate(BaseModel):
    status: Optional[ComplaintStatus] = None
    priority: Optional[Priority] = None
    assigned_officer_id: Optional[int] = None
    comment: Optional[str] = None


# ── Projects ─────────────────────────────────────────────────────

class ProjectResponse(BaseModel):
    id: int
    name: str
    ward: Optional[str] = None
    budget: float
    status: ProjectStatus
    progress_percentage: float
    contractor_name: Optional[str] = None
    
    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    data: List[ProjectResponse]
    total: int


class ProjectOfficerUpdate(BaseModel):
    status: Optional[ProjectStatus] = None
    percentage: Optional[float] = Field(None, ge=0, le=100)
    comment: Optional[str] = None
