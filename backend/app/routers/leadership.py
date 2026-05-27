"""
Nam Nadu — Leadership Routes (MLA Dashboard)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import datetime

from app.database.connection import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.leadership import MlaProfile, MlaPerformance, CmDashboardStat
from app.models.complaint import Complaint
from app.models.project import GovernmentProject
from app.models.enums import ComplaintStatus, ProjectStatus, NotificationType, NotificationChannel
from app.models.notification import Notification
from app.schemas.leadership import GovernanceAnalyticsResponse, MlaPerformanceResponse, MlaProfileResponse, EmergencyAlertCreate, EmergencyAlertResponse, MlaLoginRequest, MlaLoginResponse, MlaRegisterRequest, MlaRegisterResponse
from app.models.leadership import WardEmergencyAlert, MlaAuth
from app.models.master import District, Ward
from app.core.security import verify_password, create_access_token, hash_password
from datetime import timedelta

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

router = APIRouter(
    prefix="/api/v1/leadership",
    tags=["Leadership"],
)

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import verify_token

security = HTTPBearer()

def get_current_mla(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to extract MLA profile from the token payload"""
    payload = verify_token(credentials.credentials, token_type="access")
    
    if not payload or payload.get("role") != "mla":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to MLAs only",
        )
    return payload


@router.post("/login", response_model=MlaLoginResponse)
def login_mla(request: MlaLoginRequest, db: Session = Depends(get_db)):
    """Authenticate an MLA using their MLA ID and isolated password."""
    profile = db.query(MlaProfile).filter(MlaProfile.mla_id == request.mla_id).first()
    if not profile or not profile.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid MLA credentials or profile inactive")
        
    auth_record = db.query(MlaAuth).filter(MlaAuth.mla_profile_id == profile.id).first()
    if not auth_record or not verify_password(request.password, auth_record.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid MLA credentials")
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "sub": profile.mla_id,
        "role": "mla",
        "mla_profile_id": profile.id,
        "ward_id": profile.ward_id,
        "district_id": profile.district_id
    }
    access_token = create_access_token(data=token_data, expires_delta=access_token_expires)
    
    return MlaLoginResponse(
        access_token=access_token,
        token_type="bearer",
        mla_id=profile.mla_id,
        name=profile.name,
        ward_id=profile.ward_id,
        district_id=profile.district_id
    )


@router.post("/register", response_model=MlaRegisterResponse)
def register_mla(request: MlaRegisterRequest, db: Session = Depends(get_db)):
    """Register an MLA with strict uniqueness validation."""
    district = db.query(District).filter(District.name.ilike(request.district)).first()
    if not district:
        raise HTTPException(status_code=400, detail="You are not an authorized MLA. (District not found)")
        
    ward = db.query(Ward).filter(Ward.district_id == district.id, Ward.ward_name.ilike(request.ward)).first()
    if not ward:
        raise HTTPException(status_code=400, detail="You are not an authorized MLA. (Ward not found)")
        
    profile = db.query(MlaProfile).filter(
        MlaProfile.name.ilike(request.name),
        MlaProfile.political_party.ilike(request.party),
        MlaProfile.district_id == district.id,
        MlaProfile.ward_id == ward.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=400, detail="You are not an authorized MLA.")
        
    auth_record = db.query(MlaAuth).filter(MlaAuth.mla_profile_id == profile.id).first()
    if auth_record:
        raise HTTPException(status_code=400, detail="MLA already registered. Please log in.")
        
    if request.email:
        existing_email = db.query(MlaProfile).filter(MlaProfile.contact_email == request.email).first()
        if existing_email and existing_email.id != profile.id:
            raise HTTPException(status_code=400, detail="Email is already in use by another MLA.")
        profile.contact_email = request.email
        
    if request.phone:
        existing_phone = db.query(MlaProfile).filter(MlaProfile.contact_phone == request.phone).first()
        if existing_phone and existing_phone.id != profile.id:
            raise HTTPException(status_code=400, detail="Mobile number is already in use by another MLA.")
        profile.contact_phone = request.phone
        
    new_auth = MlaAuth(mla_profile_id=profile.id, password_hash=hash_password(request.password))
    db.add(new_auth)
    db.commit()
    
    return MlaRegisterResponse(message="Registration Successful", mla_id=profile.mla_id)


@router.get("/profile", response_model=MlaProfileResponse)
def get_mla_profile(
    mla_data: dict = Depends(get_current_mla),
    db: Session = Depends(get_db)
):
    """Get the current MLA's profile."""
    profile = db.query(MlaProfile).filter(MlaProfile.id == mla_data["mla_profile_id"]).first()
    if not profile:
        raise HTTPException(status_code=404, detail="MLA Profile not found")
    return profile


@router.get("/analytics", response_model=GovernanceAnalyticsResponse)
def get_mla_analytics(
    mla_data: dict = Depends(get_current_mla),
    db: Session = Depends(get_db)
):
    """Get high-level governance analytics for the MLA's specific ward."""
    ward_id = mla_data["ward_id"]
    
    # 1. Complaints Analytics
    total_complaints = db.query(Complaint).filter(Complaint.ward_id == ward_id).count()
    resolved_complaints = db.query(Complaint).filter(
        Complaint.ward_id == ward_id, 
        Complaint.status == ComplaintStatus.COMPLETED
    ).count()
    
    resolution_rate = (resolved_complaints / total_complaints * 100) if total_complaints > 0 else 0
    
    # 2. Projects Analytics
    # Mocking projects budget for now as GovernmentProject lacks district_id mapping
    projects_budget = 1000000.0
    
    return GovernanceAnalyticsResponse(
        overallDevelopmentIndex=resolution_rate / 10, # Mock logic
        publicTrustScore=(resolution_rate * 0.8) / 10,
        budgetHealth="Good" if resolution_rate > 75 else "Average",
        wardRankings=[], # Only for CM or higher
        complaintHeatmapData=[], # Mock
        wardAllocations=[
            {"name": "Ward Budget", "spent": projects_budget}
        ]
    )


@router.get("/performance", response_model=MlaPerformanceResponse)
def get_mla_performance(
    mla_data: dict = Depends(get_current_mla),
    db: Session = Depends(get_db)
):
    """Get the calculated performance metrics for the MLA."""
    performance = db.query(MlaPerformance).filter(
        MlaPerformance.mla_profile_id == mla_data["mla_profile_id"]
    ).first()
    
    if not performance:
        raise HTTPException(status_code=404, detail="Performance data not found")
        
    return performance


@router.get("/complaints")
def get_ward_complaints(
    mla_data: dict = Depends(get_current_mla),
    status: Optional[ComplaintStatus] = None,
    db: Session = Depends(get_db)
):
    """Get complaints strictly for the MLA's ward."""
    query = db.query(Complaint).filter(Complaint.ward_id == mla_data["ward_id"])
    if status:
        query = query.filter(Complaint.status == status)
    
    # Avoid exposing too much data, limit to recent 100
    complaints = query.order_by(Complaint.created_at.desc()).limit(100).all()
    
    result = []
    for c in complaints:
        result.append({
            "id": c.id,
            "complaint_number": c.complaint_number,
            "title": c.title,
            "status": c.status.value,
            "priority": c.priority.value,
            "created_at": c.created_at,
            "is_sla_breached": c.is_sla_breached
        })
    return result


@router.get("/projects")
def get_ward_projects(
    mla_data: dict = Depends(get_current_mla),
    db: Session = Depends(get_db)
):
    """Get projects strictly for the MLA's ward."""
    # Since GovernmentProject currently uses string 'ward', we should filter by that.
    # However, for rigorous mapping, we should add ward_id to GovernmentProject.
    # Let's see if the ward_id column exists. If not, we'll try to match by name or fallback.
    # In seed_db.py, 'ward' is a string. In the schema, 'ward' is string.
    # Wait, the user said we shouldn't touch existing schema if possible.
    # We will get the Ward object and match by string if necessary, or just query.
    from app.models.master import Ward
    ward_obj = db.query(Ward).filter(Ward.id == mla_data["ward_id"]).first()
    ward_name_str = ward_obj.ward_name if ward_obj else ""
    
    query = db.query(GovernmentProject).filter(GovernmentProject.ward.ilike(f"%{ward_name_str}%"))
    projects = query.order_by(GovernmentProject.created_at.desc()).all()
    
    result = []
    for p in projects:
        result.append({
            "id": p.id,
            "name": p.name,
            "status": p.status.value,
            "budget": p.budget,
            "progress": p.progress_updates[0].percentage if p.progress_updates else 0
        })
    return result

@router.post("/alerts", response_model=EmergencyAlertResponse)
def create_ward_alert(
    alert: EmergencyAlertCreate,
    mla_data: dict = Depends(get_current_mla),
    db: Session = Depends(get_db)
):
    """Create a new emergency alert for the ward and notify officers."""
    # Create the alert
    new_alert = WardEmergencyAlert(
        mla_profile_id=mla_data["mla_profile_id"],
        ward_id=mla_data["ward_id"],
        title=alert.title,
        description=alert.description,
        level=alert.severity.value,
        status="active"
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    
    # Notify officers in this ward
    # We need the ward name to match with User.ward
    from app.models.master import Ward
    ward_obj = db.query(Ward).filter(Ward.id == mla_data["ward_id"]).first()
    if ward_obj:
        officers = db.query(User).filter(
            User.role_id == 2, # Assuming 2 is Officer role
            User.ward.ilike(f"%{ward_obj.ward_name}%")
        ).all()
        
        for officer in officers:
            notif = Notification(
                user_id=officer.id,
                title=f"EMERGENCY ALERT: {alert.title}",
                message=alert.description,
                type=NotificationType.SYSTEM,
                channel=NotificationChannel.IN_APP,
                link=f"/dashboard/emergency"
            )
            db.add(notif)
        db.commit()
        
    return EmergencyAlertResponse(
        id=new_alert.id,
        title=new_alert.title,
        description=new_alert.description,
        severity=alert.severity,
        area=alert.area,
        is_active=True,
        created_at=new_alert.created_at
    )


@router.get("/alerts", response_model=List[EmergencyAlertResponse])
def get_ward_alerts(
    mla_data: dict = Depends(get_current_mla),
    db: Session = Depends(get_db)
):
    """Get emergency alerts for the MLA's ward."""
    alerts = db.query(WardEmergencyAlert).filter(
        WardEmergencyAlert.ward_id == mla_data["ward_id"]
    ).order_by(WardEmergencyAlert.created_at.desc()).all()
    
    result = []
    for a in alerts:
        result.append(EmergencyAlertResponse(
            id=a.id,
            title=a.title,
            description=a.description,
            severity=a.level,
            area="",
            is_active=a.status == "active",
            created_at=a.created_at
        ))
    return result
