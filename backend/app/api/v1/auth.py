from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.auth import LoginRequest, Token, RefreshTokenRequest, ChangePasswordRequest
from backend.app.schemas.user import UserOut
from backend.app.services.auth import AuthService
from backend.app.dependencies.auth import get_current_user
from backend.app.models.user import User
from pydantic import BaseModel

router = APIRouter()

class ForgotPasswordRequest(BaseModel):
    email: str

@router.post("/login", response_model=Token)
async def login(payload: LoginRequest, db: Session = Depends(get_db)) -> Token:
    auth_service = AuthService(db)
    tokens = auth_service.login(payload.email, payload.password)
    return Token(**tokens)

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    auth_service.logout(payload.refresh_token)

@router.post("/refresh", response_model=Token)
async def refresh(payload: RefreshTokenRequest, db: Session = Depends(get_db)) -> Token:
    auth_service = AuthService(db)
    tokens = auth_service.refresh(payload.refresh_token)
    return Token(**tokens)

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(current_user)

@router.put("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    auth_service = AuthService(db)
    auth_service.change_password(current_user.id, payload.old_password, payload.new_password)

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(payload: ForgotPasswordRequest):
    return {"message": f"Password reset email sent to {payload.email} if it exists."}
