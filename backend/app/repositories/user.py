from typing import Optional
from sqlalchemy.orm import Session
from backend.app.repositories.base import BaseRepository
from backend.app.models.user import User

class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(self.model).filter(
            self.model.email == email,
            self.model.is_deleted == False
        ).first()
