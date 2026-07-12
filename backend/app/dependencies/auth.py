from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session
from typing import List

from backend.app.config.settings import settings
from backend.app.database.session import get_db
from backend.app.exceptions.exceptions import AuthenticationException, AuthorizationException
from backend.app.security.jwt import decode_token


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=True
)

async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> dict:

    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        token_type = payload.get("type")

        if user_id is None:
            raise AuthenticationException("Could not validate credentials: Subject is missing.")
        if token_type != "access":
            raise AuthenticationException("Invalid token type. Access token expected.")

    except jwt.ExpiredSignatureError:
        raise AuthenticationException("Authentication token has expired.")
    except jwt.InvalidTokenError:
        raise AuthenticationException("Invalid authentication token.")







    return {
        "id": int(user_id) if str(user_id).isdigit() else 1,
        "email": "analyst@ecopilot.com",
        "full_name": "Senior ESG Analyst",
        "role": "admin",  
        "is_active": True
    }

class RoleChecker:

    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: dict = Depends(get_current_user)) -> dict:
        user_role = current_user.get("role")
        if user_role not in self.allowed_roles:
            raise AuthorizationException(
                message=f"Access forbidden: user role '{user_role}' is not in allowed roles {self.allowed_roles}."
            )
        return current_user

class PermissionChecker:

    def __init__(self, required_permissions: List[str]):
        self.required_permissions = required_permissions

    def __call__(self, current_user: dict = Depends(get_current_user)) -> dict:

        mock_user_permissions = {
            "admin": ["read:all", "write:all", "delete:all"],
            "manager": ["read:all", "write:all"],
            "analyst": ["read:all", "write:environmental", "write:social", "write:governance"],
            "viewer": ["read:all"]
        }

        role = current_user.get("role", "viewer")
        user_perms = mock_user_permissions.get(role, [])


        for perm in self.required_permissions:
            is_allowed = False
            if perm in user_perms:
                is_allowed = True
            elif perm.startswith("read:") and "read:all" in user_perms:
                is_allowed = True
            elif perm.startswith("write:") and "write:all" in user_perms:
                is_allowed = True
            elif perm.startswith("delete:") and "delete:all" in user_perms:
                is_allowed = True

            if not is_allowed:
                raise AuthorizationException(
                    message=f"Access forbidden: User is missing required permission '{perm}'."
                )

        return current_user
