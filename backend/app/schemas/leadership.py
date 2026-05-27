"""
Nam Nadu — Leadership Schemas
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

from app.models.enums import Severity


class StatCard(BaseModel):
    value: str
    subtitle: str
    trend: Optional[str] = None
    trendValue: Optional[str] = None


class GovernanceAnalyticsResponse(BaseModel):
    overallDevelopmentIndex: float
    publicTrustScore: float
    budgetHealth: str
    wardRankings: List[Dict[str, Any]]
    complaintHeatmapData: List[Dict[str, Any]]
    wardAllocations: List[Dict[str, Any]]


class EmergencyAlertResponse(BaseModel):
    id: int
    title: str
    description: str
    severity: Severity
    area: Optional[str]
    is_active: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}


class EmergencyAlertCreate(BaseModel):
    title: str
    description: str
    severity: Severity
    area: Optional[str] = None
    expires_at: Optional[datetime] = None


class MlaLoginRequest(BaseModel):
    mla_id: str
    password: str


class MlaRegisterRequest(BaseModel):
    name: str
    district: str
    ward: str
    party: str
    password: str
    email: Optional[str] = None
    phone: Optional[str] = None


class MlaRegisterResponse(BaseModel):
    message: str
    mla_id: str


class MlaLoginResponse(BaseModel):
    access_token: str
    token_type: str
    mla_id: str
    name: str
    ward_id: int
    district_id: int


class MlaProfileResponse(BaseModel):
    mla_id: str
    name: str
    political_party: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    ward_id: int
    district_id: int

    model_config = {"from_attributes": True}


class MlaPerformanceResponse(BaseModel):
    complaint_resolution_percent: float
    project_completion_percent: float
    citizen_satisfaction_score: float
    escalation_count: int
    delayed_issues_count: int
    overall_score: float
    performance_label: str

    model_config = {"from_attributes": True}
