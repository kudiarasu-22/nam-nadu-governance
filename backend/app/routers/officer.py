"""
Nam Nadu — Officer Routes
REST endpoints for officer dashboard and management.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import require_role
from app.models.enums import RoleName
from app.models.user import User

from app.schemas.officer import (
    DashboardStatsResponse,
    ComplaintListResponse,
    ComplaintResponse,
    ComplaintOfficerUpdate,
    ProjectListResponse,
    ProjectResponse,
    ProjectOfficerUpdate
)
from app.services import officer_service

router = APIRouter(
    prefix="/api/v1/officer",
    tags=["Officer"],
    dependencies=[Depends(require_role(RoleName.OFFICER.value, RoleName.LEADERSHIP_ADMIN.value))]
)


@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard(db: Session = Depends(get_db)):
    """Get dashboard stats."""
    return officer_service.get_dashboard_stats(db)


@router.get("/complaints", response_model=ComplaintListResponse)
def get_complaints(db: Session = Depends(get_db)):
    """Get all complaints."""
    return officer_service.get_complaints(db)


@router.patch("/complaints/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(
    complaint_id: int,
    update_data: ComplaintOfficerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleName.OFFICER.value, RoleName.LEADERSHIP_ADMIN.value))
):
    """Update a complaint."""
    try:
        return officer_service.update_complaint(db, complaint_id, update_data, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/projects", response_model=ProjectListResponse)
def get_projects(db: Session = Depends(get_db)):
    """Get all projects."""
    return officer_service.get_projects(db)


@router.patch("/projects/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    update_data: ProjectOfficerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleName.OFFICER.value, RoleName.LEADERSHIP_ADMIN.value))
):
    """Update a project."""
    try:
        return officer_service.update_project(db, project_id, update_data, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
