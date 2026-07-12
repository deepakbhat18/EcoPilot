from sqlalchemy.orm import Session
from typing import Optional, List, Tuple
from backend.app.repositories.emission_factor import EmissionFactorRepository
from backend.app.repositories.category import CategoryRepository
from backend.app.models.emission_factor import EmissionFactor
from backend.app.schemas.emission_factor import EmissionFactorCreate, EmissionFactorUpdate
from backend.app.exceptions.exceptions import AppValidationError, NotFoundException

class EmissionFactorService:
    def __init__(self, db: Session):
        self.repo = EmissionFactorRepository(db)
        self.category_repo = CategoryRepository(db)

    def get_by_id(self, id: int) -> EmissionFactor:
        factor = self.repo.get_by_id(id)
        if not factor:
            raise NotFoundException("Emission Factor not found.")
        return factor

    def get_all(self, skip: int = 0, limit: int = 100) -> List[EmissionFactor]:
        return self.repo.get_all(skip, limit)

    def search_and_filter(
        self,
        search_query: Optional[str] = None,
        category_id: Optional[int] = None,
        status: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_desc: bool = False,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[EmissionFactor], int]:
        filters = {}
        if category_id:
            filters["category_id"] = category_id
        if status:
            filters["status"] = status
        search_fields = ["name", "source", "unit", "description"]
        return self.repo.query_advanced(
            search_query=search_query,
            search_fields=search_fields,
            filters=filters,
            sort_by=sort_by,
            sort_desc=sort_desc,
            skip=skip,
            limit=limit
        )

    def create(self, obj_in: EmissionFactorCreate) -> EmissionFactor:
        existing, _ = self.repo.query_advanced(filters={"name": obj_in.name})
        if existing:
            raise AppValidationError(f"Emission Factor with name '{obj_in.name}' already exists.")
        category = self.category_repo.get_by_id(obj_in.category_id)
        if not category:
            raise AppValidationError("Category does not exist.")
        return self.repo.create(obj_in)

    def update(self, id: int, obj_in: EmissionFactorUpdate) -> EmissionFactor:
        factor = self.get_by_id(id)
        if obj_in.name and obj_in.name != factor.name:
            existing, _ = self.repo.query_advanced(filters={"name": obj_in.name})
            if existing:
                raise AppValidationError(f"Emission Factor with name '{obj_in.name}' already exists.")
        if obj_in.category_id:
            category = self.category_repo.get_by_id(obj_in.category_id)
            if not category:
                raise AppValidationError("Category does not exist.")
        return self.repo.update(factor, obj_in)

    def delete(self, id: int) -> EmissionFactor:
        factor = self.get_by_id(id)
        return self.repo.delete(id)
