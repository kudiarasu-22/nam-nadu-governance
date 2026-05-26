"""
Nam Nadu — Notifications Router
Endpoints for real-time citizen notification updates.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.connection import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.schemas.common import MessageResponse
# A quick schema for notifications
from pydantic import BaseModel
from datetime import datetime

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    link: str | None
    created_at: datetime
    
    model_config = {"from_attributes": True}

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get latest notifications for the logged-in user."""
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(desc(Notification.created_at)).limit(limit).all()
    
    return notifs

@router.patch("/{notification_id}/read", response_model=MessageResponse)
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a notification as read."""
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif or notif.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read."}
