from sqlalchemy.orm import Session
from backend.app.repositories.base import BaseRepository
from backend.app.models.environmental_goal import EnvironmentalGoal

class EnvironmentalGoalRepository(BaseRepository[EnvironmentalGoal]):
    def __init__(self, db: Session):
        super().__init__(EnvironmentalGoal, db)
