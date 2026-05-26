"""
Nam Nadu — Volunteer Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.auth.dependencies import require_role
from app.models.enums import RoleName, TaskStatus
from app.models.user import User
from app.models.feedback import VolunteerTask, Volunteer
from app.schemas.volunteer import VolunteerTaskResponse, VolunteerProfileResponse, LeaderboardEntry

router = APIRouter(
    prefix="/api/v1/volunteer",
    tags=["Volunteer"],
    dependencies=[Depends(require_role(RoleName.VOLUNTEER.value))]
)


@router.get("/profile", response_model=VolunteerProfileResponse)
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(require_role(RoleName.VOLUNTEER.value))):
    """Get current volunteer profile stats."""
    profile = db.query(Volunteer).filter(Volunteer.user_id == current_user.id).first()
    if not profile:
        # Auto-create profile if missing
        profile = Volunteer(user_id=current_user.id, total_hours=0)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    return VolunteerProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        skills=profile.skills,
        assigned_ward=profile.assigned_ward,
        total_hours=profile.total_hours,
        is_verified=profile.is_verified,
        score=int(profile.total_hours * 10),  # simple point system based on hours
        helped=int(profile.total_hours * 2),
        verifications=int(profile.total_hours / 2)
    )


@router.post("/check-in", response_model=VolunteerProfileResponse)
def daily_check_in(db: Session = Depends(get_db), current_user: User = Depends(require_role(RoleName.VOLUNTEER.value))):
    """Perform a daily standby check-in."""
    profile = db.query(Volunteer).filter(Volunteer.user_id == current_user.id).first()
    if profile:
        profile.total_hours += 1.5 # Grant 1.5 hours equivalent for standby
        db.commit()
        db.refresh(profile)
    return get_profile(db, current_user)


@router.get("/tasks", response_model=List[VolunteerTaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    """Get all open or claimed volunteer tasks."""
    return db.query(VolunteerTask).filter(VolunteerTask.status != TaskStatus.COMPLETED).all()


@router.post("/tasks/{task_id}/claim", response_model=VolunteerTaskResponse)
def claim_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role(RoleName.VOLUNTEER.value))):
    """Claim a task."""
    task = db.query(VolunteerTask).filter(VolunteerTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.status != TaskStatus.OPEN:
        raise HTTPException(status_code=400, detail="Task is not open")
        
    task.status = TaskStatus.CLAIMED
    task.volunteer_id = current_user.id
    db.commit()
    db.refresh(task)
    return task


@router.post("/tasks/{task_id}/complete", response_model=VolunteerTaskResponse)
def complete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role(RoleName.VOLUNTEER.value))):
    """Complete a task and earn points."""
    task = db.query(VolunteerTask).filter(VolunteerTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.status != TaskStatus.CLAIMED or task.volunteer_id != current_user.id:
        raise HTTPException(status_code=400, detail="Task not claimed by you")
        
    task.status = TaskStatus.COMPLETED
    
    # Update profile
    profile = db.query(Volunteer).filter(Volunteer.user_id == current_user.id).first()
    if profile:
        profile.total_hours += task.hours
        
    db.commit()
    db.refresh(task)
    return task


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db), current_user: User = Depends(require_role(RoleName.VOLUNTEER.value))):
    """Get volunteer leaderboard."""
    volunteers = db.query(Volunteer, User).join(User, Volunteer.user_id == User.id).order_by(Volunteer.total_hours.desc()).limit(10).all()
    
    leaderboard = []
    for idx, (vol, user) in enumerate(volunteers):
        points = int(vol.total_hours * 10)
        badges = ["Hero"] if points > 500 else ["Verifier"] if points > 100 else ["Active"]
        leaderboard.append(LeaderboardEntry(
            rank=idx + 1,
            name=user.full_name,
            points=points,
            badges=badges,
            self=(user.id == current_user.id)
        ))
        
    return leaderboard
