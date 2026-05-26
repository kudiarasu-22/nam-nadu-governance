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
