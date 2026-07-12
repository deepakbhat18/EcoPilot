from sqlalchemy.orm import Session
from backend.app.repositories.base import BaseRepository
from backend.app.models.policy import Policy

class PolicyRepository(BaseRepository[Policy]):
    def __init__(self, db: Session):
        super().__init__(Policy, db)
