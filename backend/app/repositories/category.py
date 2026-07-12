from sqlalchemy.orm import Session
from backend.app.repositories.base import BaseRepository
from backend.app.models.category import Category

class CategoryRepository(BaseRepository[Category]):
    def __init__(self, db: Session):
        super().__init__(Category, db)
