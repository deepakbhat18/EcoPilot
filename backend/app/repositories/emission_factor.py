from sqlalchemy.orm import Session
from backend.app.repositories.base import BaseRepository
from backend.app.models.emission_factor import EmissionFactor

class EmissionFactorRepository(BaseRepository[EmissionFactor]):
    def __init__(self, db: Session):
        super().__init__(EmissionFactor, db)
