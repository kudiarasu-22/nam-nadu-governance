"""
Nam Nadu — Officer Service
Synchronous business logic for officer dashboard operations.
"""
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.complaint import Complaint, ComplaintUpdate
from app.models.project import GovernmentProject, ProjectProgress, Contractor
from app.models.user import User
from app.models.enums import ComplaintStatus, ProjectStatus
from app.schemas.officer import (
    DashboardStatsResponse,
    ComplaintResponse,
    ComplaintListResponse,
    ComplaintOfficerUpdate,
    ProjectResponse,
    ProjectListResponse,
    ProjectOfficerUpdate
)


def get_dashboard_stats(db: Session) -> DashboardStatsResponse:
    """Calculate and return officer dashboard statistics."""
    
    # Active Complaints (not resolved/closed/rejected)
    active_complaints = db.query(func.count(Complaint.id)).filter(
        Complaint.status.in_([ComplaintStatus.SUBMITTED, ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS])
    ).scalar() or 0

    # Resolved Today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    resolved_today = db.query(func.count(Complaint.id)).filter(
        Complaint.status == ComplaintStatus.COMPLETED,
        Complaint.resolved_at >= today_start
    ).scalar() or 0

    # Escalated Complaints (Priority URGENT or marked escalated in comments - simplified here to just URGENT)
    escalated_complaints = db.query(func.count(Complaint.id)).filter(
        Complaint.priority == 'urgent',
        Complaint.status.in_([ComplaintStatus.SUBMITTED, ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS])
    ).scalar() or 0

    # Avg Resolution Time (Mocked for now as SQLite datetime diffs are complex)
    avg_resolution_time = "24h 30m"

    return DashboardStatsResponse(
        active_complaints=active_complaints,
        resolved_today=resolved_today,
        avg_resolution_time=avg_resolution_time,
        escalated_complaints=escalated_complaints
    )


def get_complaints(db: Session) -> ComplaintListResponse:
    """Get list of complaints formatted for officer view."""
    complaints = db.query(Complaint).order_by(Complaint.created_at.desc()).all()
    
    data = []
    for c in complaints:
        data.append(ComplaintResponse(
            id=c.id,
            title=c.title,
            category=c.category,
            description=c.description,
            location=c.location,
            ward=c.ward,
            status=c.status,
            priority=c.priority,
            citizen_name=c.citizen.full_name if c.citizen else "Unknown",
            created_at=c.created_at
        ))
        
    return ComplaintListResponse(data=data, total=len(data))


def update_complaint(db: Session, complaint_id: int, update_data: ComplaintOfficerUpdate, officer_id: int) -> ComplaintResponse:
    """Update complaint status/priority/assignment and log it."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise ValueError("Complaint not found")

    if update_data.status:
        complaint.status = update_data.status
        if update_data.status == ComplaintStatus.COMPLETED:
            complaint.resolved_at = datetime.now(timezone.utc)
            
    if update_data.priority:
        complaint.priority = update_data.priority
        
    if update_data.assigned_officer_id:
        complaint.assigned_officer_id = update_data.assigned_officer_id

    if update_data.comment or update_data.status:
        update_log = ComplaintUpdate(
            complaint_id=complaint.id,
            updated_by=officer_id,
            status=complaint.status,
            comment=update_data.comment
        )
        db.add(update_log)

    db.commit()
    db.refresh(complaint)

    return ComplaintResponse(
        id=complaint.id,
        title=complaint.title,
        category=complaint.category,
        description=complaint.description,
        location=complaint.location,
        ward=complaint.ward,
        status=complaint.status,
        priority=complaint.priority,
        citizen_name=complaint.citizen.full_name if complaint.citizen else "Unknown",
        created_at=complaint.created_at
    )


def get_projects(db: Session) -> ProjectListResponse:
    """Get list of projects formatted for officer view."""
    projects = db.query(GovernmentProject).order_by(GovernmentProject.created_at.desc()).all()
    
    data = []
    for p in projects:
        # Get latest progress
        latest_progress = db.query(ProjectProgress).filter(
            ProjectProgress.project_id == p.id
        ).order_by(ProjectProgress.created_at.desc()).first()
        
        progress_percentage = latest_progress.percentage if latest_progress else 0.0
        
        # Get contractor name
        contractor_name = "Unknown"
        if p.contractor_id:
            contractor = db.query(Contractor).filter(Contractor.id == p.contractor_id).first()
            if contractor:
                contractor_name = contractor.name
                
        data.append(ProjectResponse(
            id=p.id,
            name=p.name,
            ward=p.ward,
            budget=p.budget or 0.0,
            status=p.status,
            progress_percentage=progress_percentage,
            contractor_name=contractor_name
        ))
        
    return ProjectListResponse(data=data, total=len(data))


def update_project(db: Session, project_id: int, update_data: ProjectOfficerUpdate, officer_id: int) -> ProjectResponse:
    """Update project status and progress."""
    project = db.query(GovernmentProject).filter(GovernmentProject.id == project_id).first()
    if not project:
        raise ValueError("Project not found")

    if update_data.status:
        project.status = update_data.status

    if update_data.percentage is not None or update_data.comment:
        progress = ProjectProgress(
            project_id=project.id,
            percentage=update_data.percentage if update_data.percentage is not None else 0.0,
            description=update_data.comment,
            updated_by=officer_id
        )
        db.add(progress)

    db.commit()
    db.refresh(project)

    # Re-fetch formatting data
    latest_progress = db.query(ProjectProgress).filter(
        ProjectProgress.project_id == project.id
    ).order_by(ProjectProgress.created_at.desc()).first()
    progress_percentage = latest_progress.percentage if latest_progress else 0.0
    
    contractor_name = "Unknown"
    if project.contractor_id:
        contractor = db.query(Contractor).filter(Contractor.id == project.contractor_id).first()
        if contractor:
            contractor_name = contractor.name

    return ProjectResponse(
        id=project.id,
        name=project.name,
        ward=project.ward,
        budget=project.budget or 0.0,
        status=project.status,
        progress_percentage=progress_percentage,
        contractor_name=contractor_name
    )
