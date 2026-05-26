"""
Nam Nadu — Complaint Router
Endpoints for Citizen Complaint Management.
"""
import os
import shutil
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request

from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.connection import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.enums import RoleName, ComplaintStatus, Priority
from app.models.complaint import Complaint, ComplaintMedia, ComplaintAuditLog
from app.schemas.complaint import (
    ComplaintCreate, ComplaintDetailResponse, ComplaintListResponse as CitizenComplaintListResponse,
    ComplaintReopen, ComplaintAuditLogResponse
)
from app.schemas.common import MessageResponse

router = APIRouter(prefix="/api/v1/complaints", tags=["Complaints"])

UPLOAD_DIR = "uploads/complaints"
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "pdf", "mp4"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "application/pdf", "video/mp4"}
MAX_FILE_SIZE = 50 * 1024 * 1024 # 50 MB

def generate_complaint_number(db: Session, district_code: str = "TN") -> str:
    """Generate unique complaint number like NN-CHN-2026-000124"""
    year = datetime.now().year
    prefix = f"NN-{district_code}-{year}"
    
    # Simple sequence generator using count. In high concurrency, use a sequence table.
    count = db.query(Complaint).filter(Complaint.complaint_number.like(f"{prefix}%")).count()
    return f"{prefix}-{(count + 1):06d}"

def is_allowed_file(filename: str, content_type: str) -> bool:
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    return ext in ALLOWED_EXTENSIONS and content_type in ALLOWED_MIME_TYPES

def get_media_type(content_type: str) -> str:
    if content_type.startswith("image/"): return "image"
    if content_type.startswith("video/"): return "video"
    if content_type == "application/pdf": return "pdf"
    return "document"

@router.post("/create", response_model=ComplaintDetailResponse)
def create_complaint(
    complaint_in: ComplaintCreate,
    is_draft: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create or draft a new complaint."""
    if current_user.role.name != RoleName.CITIZEN:
        raise HTTPException(status_code=403, detail="Only citizens can raise complaints.")

    # Determine District Code for numbering (Placeholder mapping)
    district_code = "CHN" if complaint_in.district_id == 1 else "TN"
    
    complaint_number = generate_complaint_number(db, district_code)
    status = ComplaintStatus.DRAFT if is_draft else ComplaintStatus.SUBMITTED

    new_complaint = Complaint(
        complaint_number=complaint_number,
        citizen_id=current_user.id,
        category_id=complaint_in.category_id,
        district_id=complaint_in.district_id,
        ward_id=complaint_in.ward_id,
        area_id=complaint_in.area_id,
        location_detail_id=complaint_in.location_detail_id,
        location=complaint_in.fallback_landmark,
        title=complaint_in.title,
        description=complaint_in.description,
        latitude=complaint_in.latitude,
        longitude=complaint_in.longitude,
        priority=complaint_in.priority or Priority.MEDIUM,
        status=status,
        is_draft=is_draft
    )
    
    db.add(new_complaint)
    db.flush() # To get the ID
    
    # Audit Log
    log = ComplaintAuditLog(
        complaint_id=new_complaint.id,
        user_id=current_user.id,
        action_type="CREATED_DRAFT" if is_draft else "SUBMITTED",
        details=f"Complaint {'drafted' if is_draft else 'submitted'} via Citizen Portal."
    )
    db.add(log)
    db.commit()
    db.refresh(new_complaint)
    
    return new_complaint

@router.post("/{complaint_id}/upload-media", response_model=MessageResponse)
async def upload_media(
    complaint_id: int,
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload media for a complaint."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint or complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    if not is_allowed_file(file.filename, file.content_type):
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, PDF, and MP4 are allowed.")

    # File size checking (Reading into memory, chunking is safer but this works for FastAPI straightforwardly if limit is reasonable)
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File size exceeds {MAX_FILE_SIZE//(1024*1024)}MB limit.")
    
    now = datetime.now()
    year_month = f"{now.year}/{now.month:02d}"
    target_dir = os.path.join(UPLOAD_DIR, year_month)
    os.makedirs(target_dir, exist_ok=True)
    
    # Safe filename
    ext = file.filename.split(".")[-1].lower()
    safe_filename = f"{complaint.complaint_number}_{int(now.timestamp())}_{os.urandom(4).hex()}.{ext}"
    file_path = os.path.join(target_dir, safe_filename)
    
    with open(file_path, "wb") as f:
        f.write(contents)
        
    media_type = get_media_type(file.content_type)
    file_url = f"/{file_path.replace(chr(92), '/')}" # Ensure forward slashes for URLs
    
    media = ComplaintMedia(
        complaint_id=complaint_id,
        media_type=media_type,
        file_url=file_url,
        file_name=file.filename,
        file_size=len(contents),
        uploaded_by=current_user.id
    )
    db.add(media)
    
    # Audit Log
    log = ComplaintAuditLog(
        complaint_id=complaint_id,
        user_id=current_user.id,
        action_type="MEDIA_UPLOADED",
        details=f"Uploaded {media_type}: {file.filename}"
    )
    db.add(log)
    db.commit()
    
    return {"message": "Media uploaded successfully."}


@router.get("/my", response_model=CitizenComplaintListResponse)
def get_my_complaints(
    status: ComplaintStatus = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get citizen's complaints."""
    query = db.query(Complaint).filter(Complaint.citizen_id == current_user.id)
    if status:
        query = query.filter(Complaint.status == status)
        
    complaints = query.order_by(desc(Complaint.created_at)).all()
    
    return {"data": complaints, "total": len(complaints)}


@router.get("/track/{complaint_number}", response_model=ComplaintDetailResponse)
def track_complaint(
    complaint_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Track a complaint by its ticket number."""
    complaint = db.query(Complaint).filter(Complaint.complaint_number == complaint_number).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    # Security: If citizen, ensure it's their complaint. (Or allow public tracking? The requirements say "track using complaint ID", so public tracking is usually allowed if you have the exact number, but let's enforce ownership unless specified otherwise to be safe).
    # Wait, the prompt says "tracking using complaint ID / complaint number also fails", implying any citizen can track it if they have the ID? Let's just allow it for now or enforce ownership. The prompt doesn't specify it's public.
    if current_user.role.name == RoleName.CITIZEN and complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to track this complaint.")
        
    return complaint


@router.get("/{complaint_id}", response_model=ComplaintDetailResponse)
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    if current_user.role.name == RoleName.CITIZEN and complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this complaint.")
        
    return complaint


@router.get("/{complaint_id}/timeline", response_model=List[ComplaintAuditLogResponse])
def get_complaint_timeline(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint or (current_user.role.name == RoleName.CITIZEN and complaint.citizen_id != current_user.id):
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    logs = db.query(ComplaintAuditLog).filter(ComplaintAuditLog.complaint_id == complaint_id).order_by(ComplaintAuditLog.created_at.asc()).all()
    
    for log in logs:
        log.user_name = log.user.full_name if log.user else "System"
        
    return logs


@router.post("/{complaint_id}/reopen", response_model=MessageResponse)
def reopen_complaint(
    complaint_id: int,
    payload: ComplaintReopen,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint or complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    if complaint.status != ComplaintStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Only completed complaints can be reopened.")
        
    # Check if within 7 days
    if complaint.resolved_at:
        days_since_resolved = (datetime.now() - complaint.resolved_at).days
        if days_since_resolved > 7:
            raise HTTPException(status_code=400, detail="Cannot reopen complaints closed for more than 7 days.")
            
    complaint.status = ComplaintStatus.REOPENED
    complaint.reopen_count += 1
    
    log = ComplaintAuditLog(
        complaint_id=complaint_id,
        user_id=current_user.id,
        action_type="REOPENED",
        details=f"Citizen reopened complaint. Reason: {payload.reason}"
    )
    db.add(log)
    db.commit()
    
    return {"message": "Complaint reopened successfully."}
