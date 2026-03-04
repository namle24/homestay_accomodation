from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..db import get_db
from ..models.notification import Notification
from ..models.user import UserRoleEnum
from ..schemas.notification import NotificationOut, NotificationUpdate
from .deps import get_current_user, RoleChecker

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationOut])
def list_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker([UserRoleEnum.ADMIN, UserRoleEnum.RECEPTIONIST]))
):
    """Staff only: Get all notifications."""
    return db.query(Notification).order_by(desc(Notification.created_at)).all()

@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker([UserRoleEnum.ADMIN, UserRoleEnum.RECEPTIONIST]))
):
    """Staff only: Mark a notification as read."""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification

@router.patch("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker([UserRoleEnum.ADMIN, UserRoleEnum.RECEPTIONIST]))
):
    """Staff only: Mark all notifications as read."""
    db.query(Notification).filter(Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"status": "ok"}
