from sqlalchemy.orm import Session
from backend.app.repositories.base import BaseRepository
from backend.app.models.carbon_transaction import CarbonTransaction

class CarbonTransactionRepository(BaseRepository[CarbonTransaction]):
    def __init__(self, db: Session):
        super().__init__(CarbonTransaction, db)
