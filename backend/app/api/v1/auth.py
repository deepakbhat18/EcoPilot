from fastapi import APIRouter, Depends
from backend.app.schemas.auth import LoginRequest, Token
from backend.app.exceptions.exceptions import AuthenticationException
from backend.app.security.jwt import create_access_token, create_refresh_token

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(payload: LoginRequest) -> Token:


    if payload.email == "analyst@verdexa.com" and payload.password == "password123":
        access = create_access_token(subject="123")
        refresh = create_refresh_token(subject="123")
        return Token(access_token=access, refresh_token=refresh)

    raise AuthenticationException("Invalid email address or password combination.")
