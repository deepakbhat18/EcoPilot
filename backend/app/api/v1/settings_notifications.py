from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
from backend.app.database.session import get_db
from backend.app.dependencies.auth import get_current_user
from backend.app.models.user import User
from backend.app.schemas.settings_notifications import (
    SettingCreate, SettingOut, NotificationOut
)
from backend.app.services.settings_notifications import SettingService, NotificationService

router = APIRouter()

@router.get("/settings", response_model=Dict[str, str])
async def get_all_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SettingService(db)
    return service.get_all_settings()

@router.post("/settings", response_model=SettingOut)
async def set_setting(
    payload: SettingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SettingService(db)
    return service.set_setting(payload.key, payload.value)

@router.get("/notifications", response_model=List[NotificationOut])
async def list_notifications(
    limit: int = Query(20, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NotificationService(db)
    return service.get_user_notifications(current_user.id, limit=limit)

@router.put("/notifications/{id}/read", response_model=NotificationOut)
async def mark_notification_as_read(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = NotificationService(db)
    res = service.mark_as_read(id)
    if not res:
        raise HTTPException(status_code=404, detail="Notification not found")
    return res
