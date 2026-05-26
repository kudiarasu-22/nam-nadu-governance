"""
Nam Nadu — Volunteer Schemas
"""
from typing import List, Optional
from pydantic import BaseModel

from app.models.enums import TaskType, TaskStatus, Severity


class VolunteerTaskResponse(BaseModel):
    id: int
    title: str
    description: str
    ward: Optional[str] = None
    points: int
    hours: float
    task_type: TaskType
    status: TaskStatus
    urgency: Severity
    
    model_config = {"from_attributes": True}


class VolunteerProfileResponse(BaseModel):
    id: int
    user_id: int
    skills: Optional[str] = None
    assigned_ward: Optional[str] = None
    total_hours: float
    is_verified: bool
    score: int
    helped: int
    verifications: int
    
    model_config = {"from_attributes": True}


class LeaderboardEntry(BaseModel):
    rank: int
    name: str
    points: int
    badges: List[str]
    self: bool
