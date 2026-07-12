from typing import Generic, TypeVar, Type, Optional, List, Any
from sqlalchemy.orm import Session
from backend.app.database.session import Base


ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):

    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db

    def get_by_id(self, id: Any) -> Optional[ModelType]:

        pass

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:

        pass

    def create(self, obj_in: Any) -> ModelType:

        pass

    def update(self, db_obj: ModelType, obj_in: Any) -> ModelType:

        pass

    def delete(self, id: Any) -> Optional[ModelType]:

        pass
