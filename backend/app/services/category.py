from sqlalchemy.orm import Session
from typing import Optional, List, Tuple
from backend.app.repositories.category import CategoryRepository
from backend.app.models.category import Category
from backend.app.schemas.category import CategoryCreate, CategoryUpdate
from backend.app.exceptions.exceptions import AppValidationError, NotFoundException

class CategoryService:
    def __init__(self, db: Session):
        self.repo = CategoryRepository(db)

    def get_by_id(self, id: int) -> Category:
        category = self.repo.get_by_id(id)
        if not category:
            raise NotFoundException("Category not found.")
        return category

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Category]:
        return self.repo.get_all(skip, limit)

    def search_and_filter(
        self,
        search_query: Optional[str] = None,
        type: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_desc: bool = False,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[Category], int]:
        filters = {}
        if type:
            filters["type"] = type
        if status:
            filters["status"] = status
        search_fields = ["name", "description"]
        return self.repo.query_advanced(
            search_query=search_query,
            search_fields=search_fields,
            filters=filters,
            sort_by=sort_by,
            sort_desc=sort_desc,
            skip=skip,
            limit=limit
        )

    def create(self, obj_in: CategoryCreate) -> Category:
        existing, _ = self.repo.query_advanced(filters={"name": obj_in.name})
        if existing:
            raise AppValidationError(f"Category with name '{obj_in.name}' already exists.")
        return self.repo.create(obj_in)

    def update(self, id: int, obj_in: CategoryUpdate) -> Category:
        category = self.get_by_id(id)
        if obj_in.name and obj_in.name != category.name:
            existing, _ = self.repo.query_advanced(filters={"name": obj_in.name})
            if existing:
                raise AppValidationError(f"Category with name '{obj_in.name}' already exists.")
        return self.repo.update(category, obj_in)

    def delete(self, id: int) -> Category:
        category = self.get_by_id(id)
        return self.repo.delete(id)
