from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.services.user import UserService
from backend.app.dependencies.auth import get_current_user, RoleChecker
from backend.app.schemas.user import UserOut
from backend.app.models.user import User

router = APIRouter()

@router.get("/me", response_model=UserOut)
async def get_my_profile(
    current_user: User = Depends(get_current_user)
) -> UserOut:
    return current_user

@router.get(
    "/{user_id}", 
    response_model=UserOut,
    dependencies=[Depends(RoleChecker(["admin", "manager"]))]
)
async def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> UserOut:
    user_service = UserService(db)
    user = user_service.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
