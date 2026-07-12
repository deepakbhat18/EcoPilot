from sqlalchemy.orm import Session
from backend.app.repositories.base import BaseRepository
from backend.app.models.product_esg_profile import ProductESGProfile

class ProductESGProfileRepository(BaseRepository[ProductESGProfile]):
    def __init__(self, db: Session):
        super().__init__(ProductESGProfile, db)
