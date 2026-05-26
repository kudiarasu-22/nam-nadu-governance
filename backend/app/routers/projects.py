"""
Nam Nadu — Citizen Projects Router
Endpoints for citizens to view and verify government projects.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
import os
from datetime import datetime

from app.database.connection import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.project import GovernmentProject, ProjectProgress
from app.models.enums import RoleName
from app.schemas.project import ProjectDetailResponse, CitizenProjectListResponse
from app.schemas.common import MessageResponse

router = APIRouter(prefix="/api/v1/projects", tags=["Projects"])

UPLOAD_DIR = "uploads/projects"

@router.get("", response_model=CitizenProjectListResponse)
def get_projects(db: Session = Depends(get_db)):
    """Get all active government projects."""
    projects = db.query(GovernmentProject).all()
    # Populate extra fields for response
    for proj in projects:
        proj.department_name = proj.department.name if proj.department else "General"
        proj.contractor_name = proj.contractor.name if proj.contractor else "Unassigned"
        # Calculate progress
        latest_progress = db.query(ProjectProgress).filter(ProjectProgress.project_id == proj.id).order_by(ProjectProgress.created_at.desc()).first()
        proj.progress_percentage = latest_progress.percentage if latest_progress else 0.0
    return {
        "items": projects,
        "total": len(projects),
        "page": 1,
        "page_size": 10
    }

@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get detailed view of a project."""
    proj = db.query(GovernmentProject).filter(GovernmentProject.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    proj.department_name = proj.department.name if proj.department else "General"
    proj.contractor_name = proj.contractor.name if proj.contractor else "Unassigned"
    
    progress_updates = db.query(ProjectProgress).filter(ProjectProgress.project_id == project_id).order_by(ProjectProgress.created_at.desc()).all()
    for update in progress_updates:
        # Avoid resolving related models if unnecessary, but we need updated_by_name
        # Actually user relation is not explicitly set in the model, let's fetch manually
        user = db.query(User).filter(User.id == update.updated_by).first()
        update.updated_by_name = user.full_name if user else "System"
        
    proj.progress_updates = progress_updates
    proj.progress_percentage = progress_updates[0].percentage if progress_updates else 0.0
    
    return proj

@router.post("/{project_id}/verify", response_model=MessageResponse)
async def verify_project(
    project_id: int,
    feedback: str = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit citizen field verification for a project."""
    if current_user.role.name != RoleName.CITIZEN:
        raise HTTPException(status_code=403, detail="Only citizens can verify projects.")
        
    proj = db.query(GovernmentProject).filter(GovernmentProject.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    file_url = None
    if file:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        ext = file.filename.split(".")[-1].lower()
        safe_filename = f"verify_{project_id}_{int(datetime.now().timestamp())}_{os.urandom(4).hex()}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)
        
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        file_url = f"/{file_path.replace(chr(92), '/')}"
        
    # Get current progress percentage to maintain it
    latest = db.query(ProjectProgress).filter(ProjectProgress.project_id == project_id).order_by(ProjectProgress.created_at.desc()).first()
    current_pct = latest.percentage if latest else 0.0

    progress = ProjectProgress(
        project_id=project_id,
        percentage=current_pct,
        milestone="CITIZEN_VERIFICATION",
        description=feedback,
        updated_by=current_user.id,
        attachment_url=file_url
    )
    db.add(progress)
    db.commit()
    
    return {"message": "Verification submitted successfully."}
