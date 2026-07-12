from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.services.user import UserService
from backend.app.dependencies.auth import get_current_user, RoleChecker
from backend.app.schemas.user import UserOut
from backend.app.models.user import User
from typing import List

router = APIRouter()

@router.get("/me", response_model=UserOut)
async def get_my_profile(
    current_user: User = Depends(get_current_user)
) -> UserOut:
    return UserOut.model_validate(current_user)

@router.get(
    "",
    response_model=List[UserOut],
    dependencies=[Depends(RoleChecker(["admin", "manager", "esg manager"]))]
)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[UserOut]:
    user_service = UserService(db)
    return user_service.list_users(skip=skip, limit=limit)

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
