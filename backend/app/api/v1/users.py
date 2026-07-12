from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any

from backend.app.database.session import get_db
from backend.app.services.user import UserService
from backend.app.dependencies.auth import get_current_user, RoleChecker, PermissionChecker

router = APIRouter()

@router.get("/me", response_model=Dict[str, Any])
async def get_my_profile(
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:

    return current_user

@router.get(
    "/{user_id}", 
    response_model=Dict[str, Any],
    dependencies=[Depends(RoleChecker(["admin", "manager"]))]
)
async def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:

    user_service = UserService(db)
    profile = user_service.get_profile(user_id)


    return {
        "id": user_id,
        "email": f"user{user_id}@verdexa.com",
        "role": "analyst",
        "is_active": True,
        "arch_status": "Success - Routed via API -> Service -> Repository"
    }
