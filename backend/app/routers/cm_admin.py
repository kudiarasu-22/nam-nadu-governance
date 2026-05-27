"""
Nam Nadu — CM Admin Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.database.connection import get_db
from app.auth.dependencies import require_role
from app.models.enums import RoleName
from app.models.leadership import MlaProfile, MlaPerformance, CmDashboardStat
from app.models.complaint import Complaint
from app.models.master import District, Ward

from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import authenticate_user, create_tokens, user_to_response

router = APIRouter(
    prefix="/api/v1/cm_admin",
    tags=["CM Admin"]
)

@router.get("/dashboard/stats")
def get_cm_dashboard_stats(
    db: Session = Depends(get_db),
    _=Depends(require_role(RoleName.CM_ADMIN.value))
):
    """Get state-wide statistics for the Chief Minister."""
    total_complaints = db.query(Complaint).count()
    resolved_complaints = db.query(Complaint).filter(Complaint.status == 'completed').count()
    
    # Calculate MLA average performance
    avg_mla_score = db.query(func.avg(MlaPerformance.overall_score)).scalar() or 0
    
    # Get top 5 MLAs
    top_mlas = db.query(MlaProfile, MlaPerformance).join(
        MlaPerformance, MlaProfile.id == MlaPerformance.mla_profile_id
    ).order_by(MlaPerformance.overall_score.desc()).limit(5).all()
    
    top_mlas_data = [
        {
            "mla_id": profile.mla_id,
            "name": profile.name,
            "party": profile.political_party,
            "score": performance.overall_score,
            "ward_name": db.query(Ward).filter(Ward.id == profile.ward_id).first().ward_name
        }
        for profile, performance in top_mlas
    ]
    
    return {
        "total_complaints": total_complaints,
        "resolved_complaints": resolved_complaints,
        "resolution_rate": (resolved_complaints / total_complaints * 100) if total_complaints > 0 else 0,
        "avg_mla_score": avg_mla_score,
        "top_mlas": top_mlas_data
    }


@router.get("/mlas")
def get_all_mlas(
    district_id: Optional[int] = None, 
    db: Session = Depends(get_db),
    _=Depends(require_role(RoleName.CM_ADMIN.value))
):
    """Get all MLAs, optionally filtered by district."""
    query = db.query(MlaProfile, MlaPerformance).join(
        MlaPerformance, MlaProfile.id == MlaPerformance.mla_profile_id
    )
    
    if district_id:
        query = query.filter(MlaProfile.district_id == district_id)
        
    mlas = query.all()
    
    result = []
    for profile, performance in mlas:
        district_name = db.query(District).filter(District.id == profile.district_id).first().name
        ward_name = db.query(Ward).filter(Ward.id == profile.ward_id).first().ward_name
        
        result.append({
            "mla_id": profile.mla_id,
            "name": profile.name,
            "party": profile.political_party,
            "district": district_name,
            "ward": ward_name,
            "performance_score": performance.overall_score,
            "performance_label": performance.performance_label
        })
        
    return result

@router.post("/login", response_model=TokenResponse)
def login_cm_admin(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate and return JWT tokens ONLY for CM Admin."""
    user = authenticate_user(db, request.identifier, request.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
        
    if user.role.name != RoleName.CM_ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to CM Admin only.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    tokens = create_tokens(user)
    user_data = user_to_response(user)

    return {
        **tokens,
        "token_type": "bearer",
        "user": user_data,
    }
