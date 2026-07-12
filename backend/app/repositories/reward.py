from sqlalchemy.orm import Session
from backend.app.repositories.base import BaseRepository
from backend.app.models.reward import Reward

class RewardRepository(BaseRepository[Reward]):
    def __init__(self, db: Session):
        super().__init__(Reward, db)
