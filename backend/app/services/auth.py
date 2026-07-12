import datetime
from sqlalchemy.orm import Session
from backend.app.repositories.user import UserRepository
from backend.app.repositories.role import RoleRepository
from backend.app.repositories.refresh_token import RefreshTokenRepository
from backend.app.security.hashing import verify_password, hash_password
from backend.app.security.jwt import create_access_token, create_refresh_token, decode_token
from backend.app.exceptions.exceptions import AuthenticationException, NotFoundException
import jwt

class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.role_repo = RoleRepository(db)
        self.token_repo = RefreshTokenRepository(db)

    def login(self, email: str, password: str) -> dict:
        user = self.user_repo.get_by_email(email)
        if not user:
            raise AuthenticationException("Invalid email or password.")
        if not user.is_active or user.is_deleted:
            raise AuthenticationException("Account is inactive or disabled.")
        if not verify_password(password, user.password):
            raise AuthenticationException("Invalid email or password.")

        access_token = create_access_token(subject=user.id)
        refresh_token_val = create_refresh_token(subject=user.id)

        payload = decode_token(refresh_token_val)
        expires_at = datetime.datetime.utcfromtimestamp(payload["exp"])

        self.token_repo.create({
            "token": refresh_token_val,
            "user_id": user.id,
            "expires_at": expires_at,
            "is_revoked": False
        })

        return {
            "access_token": access_token,
            "refresh_token": refresh_token_val,
            "token_type": "bearer"
        }

    def refresh(self, refresh_token: str) -> dict:
        db_token = self.token_repo.get_by_token(refresh_token)
        if not db_token or db_token.is_revoked or db_token.expires_at < datetime.datetime.utcnow():
            raise AuthenticationException("Invalid or expired refresh token.")

        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise AuthenticationException("Invalid token type.")
            user_id = payload.get("sub")
        except jwt.PyJWTError:
            raise AuthenticationException("Invalid refresh token.")

        user = self.user_repo.get_by_id(int(user_id))
        if not user or not user.is_active or user.is_deleted:
            raise AuthenticationException("User is inactive or deleted.")

        db_token.is_revoked = True
        self.db.add(db_token)
        self.db.commit()

        new_access_token = create_access_token(subject=user.id)
        new_refresh_token_val = create_refresh_token(subject=user.id)

        new_payload = decode_token(new_refresh_token_val)
        new_expires_at = datetime.datetime.utcfromtimestamp(new_payload["exp"])

        self.token_repo.create({
            "token": new_refresh_token_val,
            "user_id": user.id,
            "expires_at": new_expires_at,
            "is_revoked": False
        })

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token_val,
            "token_type": "bearer"
        }

    def logout(self, refresh_token: str) -> None:
        db_token = self.token_repo.get_by_token(refresh_token)
        if db_token:
            db_token.is_revoked = True
            self.db.add(db_token)
            self.db.commit()

    def change_password(self, user_id: int, old_password: str, new_password: str) -> None:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("User not found.")
        if not verify_password(old_password, user.password):
            raise AuthenticationException("Incorrect old password.")

        user.password = hash_password(new_password)
        self.db.add(user)
        self.db.commit()
