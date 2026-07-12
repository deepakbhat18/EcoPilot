from typing import Optional
from sqlalchemy.orm import Session
from backend.app.repositories.base import BaseRepository
from backend.app.models.refresh_token import RefreshToken

class RefreshTokenRepository(BaseRepository[RefreshToken]):
    def __init__(self, db: Session):
        super().__init__(RefreshToken, db)

    def get_by_token(self, token: str) -> Optional[RefreshToken]:
        return self.db.query(self.model).filter(
            self.model.token == token,
            self.model.is_revoked == False
        ).first()
