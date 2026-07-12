from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session
from typing import List

from backend.app.config.settings import settings
from backend.app.database.session import get_db
from backend.app.exceptions.exceptions import AuthenticationException, AuthorizationException
from backend.app.security.jwt import decode_token
from backend.app.repositories.user import UserRepository
from backend.app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=True
)

async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
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

    user_repo = UserRepository(db)
    user = user_repo.get_by_id(int(user_id) if str(user_id).isdigit() else 1)
    if not user:
        raise AuthenticationException("User no longer exists.")
    if not user.is_active or user.is_deleted:
        raise AuthenticationException("User account is inactive or disabled.")

    return user

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = [r.lower() for r in allowed_roles]

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        role_name = (current_user.role.name if current_user.role else "").lower()
        if role_name not in self.allowed_roles:
            raise AuthorizationException(
                message=f"Access forbidden: user role '{role_name}' is not in allowed roles {self.allowed_roles}."
            )
        return current_user

class PermissionChecker:
    def __init__(self, required_permissions: List[str]):
        self.required_permissions = required_permissions

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        user_permissions = current_user.role.permissions if current_user.role and current_user.role.permissions else []

        for perm in self.required_permissions:
            is_allowed = False
            if perm in user_permissions:
                is_allowed = True
            elif perm.startswith("read:") and "read:all" in user_permissions:
                is_allowed = True
            elif perm.startswith("write:") and "write:all" in user_permissions:
                is_allowed = True
            elif perm.startswith("delete:") and "delete:all" in user_permissions:
                is_allowed = True

            if not is_allowed:
                raise AuthorizationException(
                    message=f"Access forbidden: User is missing required permission '{perm}'."
                )

        return current_user
