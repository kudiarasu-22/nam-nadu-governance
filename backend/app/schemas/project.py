"""
Nam Nadu — Project Schemas
Pydantic models for public projects and citizen verification.
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.models.enums import ProjectStatus

class ProjectProgressResponse(BaseModel):
    id: int
    percentage: float
    milestone: Optional[str] = None
    description: Optional[str] = None
    updated_by_name: str
    attachment_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class ProjectDetailResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    department_name: str
    budget: Optional[float] = None
    status: ProjectStatus
    ward: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    contractor_name: Optional[str] = None
    progress_percentage: float
    progress_updates: List[ProjectProgressResponse] = []

    model_config = {"from_attributes": True}

class ProjectSummaryResponse(BaseModel):
    id: int
    name: str
    department_name: str
    status: ProjectStatus
    progress_percentage: float
    
    model_config = {"from_attributes": True}

class CitizenProjectListResponse(BaseModel):
    items: List[ProjectDetailResponse]
    total: int
    page: int = 1
    page_size: int = 10

class ProjectVerifyRequest(BaseModel):
    feedback: str
