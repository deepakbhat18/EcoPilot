from sqlalchemy.orm import Session
from backend.app.repositories.base import BaseRepository
from backend.app.models.social import CSRActivity, CSRParticipation, Training, TrainingCompletion, DiversityMetric

class CSRActivityRepository(BaseRepository[CSRActivity]):
    def __init__(self, db: Session):
        super().__init__(CSRActivity, db)

class CSRParticipationRepository(BaseRepository[CSRParticipation]):
    def __init__(self, db: Session):
        super().__init__(CSRParticipation, db)

class TrainingRepository(BaseRepository[Training]):
    def __init__(self, db: Session):
        super().__init__(Training, db)

class TrainingCompletionRepository(BaseRepository[TrainingCompletion]):
    def __init__(self, db: Session):
        super().__init__(TrainingCompletion, db)

class DiversityMetricRepository(BaseRepository[DiversityMetric]):
    def __init__(self, db: Session):
        super().__init__(DiversityMetric, db)
