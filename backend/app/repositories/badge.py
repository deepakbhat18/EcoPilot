from sqlalchemy.orm import Session
from backend.app.repositories.base import BaseRepository
from backend.app.models.badge import Badge

class BadgeRepository(BaseRepository[Badge]):
    def __init__(self, db: Session):
        super().__init__(Badge, db)
