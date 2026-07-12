from typing import Optional
from sqlalchemy.orm import Session
from backend.app.repositories.base import BaseRepository
from backend.app.models.role import Role

class RoleRepository(BaseRepository[Role]):
    def __init__(self, db: Session):
        super().__init__(Role, db)

    def get_by_name(self, name: str) -> Optional[Role]:
        return self.db.query(self.model).filter(self.model.name == name).first()
