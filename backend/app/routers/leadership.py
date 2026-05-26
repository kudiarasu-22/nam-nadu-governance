"""
Nam Nadu — Leadership Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.auth.dependencies import require_role
from app.models.enums import RoleName
from app.models.user import User
from app.models.feedback import EmergencyAlert
from app.schemas.leadership import GovernanceAnalyticsResponse, EmergencyAlertResponse, EmergencyAlertCreate

router = APIRouter(
    prefix="/api/v1/leadership",
    tags=["Leadership"],
    dependencies=[Depends(require_role(RoleName.LEADERSHIP_ADMIN.value))]
)


@router.get("/analytics", response_model=GovernanceAnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    """Get high-level governance analytics for the leadership dashboard."""
    # We will mock the complex stats here as requested for stability, but we use real endpoints
    # Ideally, these would run heavy SQL aggregate queries over complaints, projects, and feedback tables.
    
    return GovernanceAnalyticsResponse(
        overallDevelopmentIndex=8.2,
        publicTrustScore=7.9,
        budgetHealth="Excellent",
        wardRankings=[
            {"rank": 1, "ward": "Anna Nagar", "councillor": "Karthik", "score": 9.2},
            {"rank": 2, "ward": "T Nagar", "councillor": "Ramesh", "score": 8.5},
            {"rank": 3, "ward": "Velachery", "councillor": "Sujatha", "score": 7.8}
        ],
        complaintHeatmapData=[
            {"lat": 13.0827, "lng": 80.2707, "weight": 0.8},
            {"lat": 13.0418, "lng": 80.2341, "weight": 0.5}
        ],
        wardAllocations=[
            {"name": "Ward 1", "spent": 120000000},
            {"name": "Ward 2", "spent": 90000000},
            {"name": "Ward 3", "spent": 150000000}
        ]
    )


@router.get("/alerts", response_model=List[EmergencyAlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    """Get active emergency alerts."""
    alerts = db.query(EmergencyAlert).filter(EmergencyAlert.is_active == True).all()
    return alerts


@router.post("/alerts", response_model=EmergencyAlertResponse)
def create_alert(
    alert_in: EmergencyAlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleName.LEADERSHIP_ADMIN.value))
):
    """Broadcast a new emergency alert."""
    new_alert = EmergencyAlert(
        title=alert_in.title,
        description=alert_in.description,
        severity=alert_in.severity,
        area=alert_in.area,
        expires_at=alert_in.expires_at,
        issued_by=current_user.id
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return new_alert
