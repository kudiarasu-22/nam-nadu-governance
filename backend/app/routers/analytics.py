"""
Nam Nadu — Citizen Analytics Router
Endpoints for real-time Postgres dashboard stats.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.connection import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.enums import ComplaintStatus, RoleName
from app.models.complaint import Complaint

router = APIRouter(prefix="/api/v1/analytics/citizen", tags=["Analytics"])

@router.get("")
def get_citizen_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get real-time stats for the citizen dashboard."""
    if current_user.role.name != RoleName.CITIZEN:
        return {"error": "Only citizens can access this dashboard."}
        
    base_query = db.query(Complaint).filter(Complaint.citizen_id == current_user.id)
    
    total = base_query.count()
    resolved = base_query.filter(Complaint.status.in_([ComplaintStatus.COMPLETED])).count()
    pending = base_query.filter(Complaint.status.in_([ComplaintStatus.SUBMITTED, ComplaintStatus.UNDER_REVIEW, ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS, ComplaintStatus.WORK_STARTED])).count()
    
    # Complaints by category (real data)
    category_counts = db.query(
        Complaint.category, func.count(Complaint.id)
    ).filter(
        Complaint.citizen_id == current_user.id,
        Complaint.category.isnot(None)
    ).group_by(Complaint.category).all()
    
    # Formatted for Recharts
    category_chart = [{"name": c[0] or "Other", "value": c[1]} for c in category_counts]
    
    return {
        "stats": {
            "total": total,
            "resolved": resolved,
            "pending": pending,
            "avg_resolution_time": "2.4 days" # For now mocked as calculation requires more complex date diff query
        },
        "charts": {
            "category_distribution": category_chart
        }
    }
