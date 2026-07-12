from typing import Generic, TypeVar, Type, Optional, List, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.database.session import Base
import datetime

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db

    def get_by_id(self, id: Any) -> Optional[ModelType]:
        query = self.db.query(self.model).filter(self.model.id == id)
        if hasattr(self.model, "is_deleted"):
            query = query.filter(self.model.is_deleted == False)
        return query.first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        query = self.db.query(self.model)
        if hasattr(self.model, "is_deleted"):
            query = query.filter(self.model.is_deleted == False)
        return query.offset(skip).limit(limit).all()

    def create(self, obj_in: Any) -> ModelType:
        if isinstance(obj_in, dict):
            db_obj = self.model(**obj_in)
        else:
            db_obj = self.model(**obj_in.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: ModelType, obj_in: Any) -> ModelType:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: Any) -> Optional[ModelType]:
        db_obj = self.db.query(self.model).filter(self.model.id == id).first()
        if not db_obj:
            return None
        if hasattr(db_obj, "is_deleted"):
            db_obj.is_deleted = True
            db_obj.deleted_at = datetime.datetime.utcnow()
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
        else:
            self.db.delete(db_obj)
            self.db.commit()
        return db_obj

    def query_advanced(
        self,
        search_query: Optional[str] = None,
        search_fields: Optional[List[str]] = None,
        filters: Optional[dict] = None,
        sort_by: Optional[str] = None,
        sort_desc: bool = False,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[ModelType], int]:
        query = self.db.query(self.model)
        if hasattr(self.model, "is_deleted"):
            query = query.filter(self.model.is_deleted == False)
        if filters:
            for field, value in filters.items():
                if value is not None and hasattr(self.model, field):
                    attr = getattr(self.model, field)
                    if isinstance(value, list):
                        query = query.filter(attr.in_(value))
                    else:
                        query = query.filter(attr == value)
        if search_query and search_fields:
            search_filters = []
            for field in search_fields:
                if hasattr(self.model, field):
                    attr = getattr(self.model, field)
                    search_filters.append(attr.ilike(f"%{search_query}%"))
            if search_filters:
                query = query.filter(or_(*search_filters))
        total_count = query.count()
        if sort_by and hasattr(self.model, sort_by):
            sort_attr = getattr(self.model, sort_by)
            if sort_desc:
                query = query.order_by(sort_attr.desc())
            else:
                query = query.order_by(sort_attr.asc())
        else:
            if hasattr(self.model, "id"):
                query = query.order_by(self.model.id.asc())
        results = query.offset(skip).limit(limit).all()
        return results, total_count
