from sqlalchemy.orm import Session
from typing import Optional, List, Tuple
from backend.app.repositories.badge import BadgeRepository
from backend.app.models.badge import Badge
from backend.app.schemas.badge import BadgeCreate, BadgeUpdate
from backend.app.exceptions.exceptions import AppValidationError, NotFoundException

class BadgeService:
    def __init__(self, db: Session):
        self.repo = BadgeRepository(db)

    def get_by_id(self, id: int) -> Badge:
        badge = self.repo.get_by_id(id)
        if not badge:
            raise NotFoundException("Badge not found.")
        return badge

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Badge]:
        return self.repo.get_all(skip, limit)

    def search_and_filter(
        self,
        search_query: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_desc: bool = False,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[Badge], int]:
        filters = {}
        if status:
            filters["status"] = status
        search_fields = ["name", "description", "unlock_rule"]
        return self.repo.query_advanced(
            search_query=search_query,
            search_fields=search_fields,
            filters=filters,
            sort_by=sort_by,
            sort_desc=sort_desc,
            skip=skip,
            limit=limit
        )

    def create(self, obj_in: BadgeCreate) -> Badge:
        existing, _ = self.repo.query_advanced(filters={"name": obj_in.name})
        if existing:
            raise AppValidationError(f"Badge with name '{obj_in.name}' already exists.")
        return self.repo.create(obj_in)

    def update(self, id: int, obj_in: BadgeUpdate) -> Badge:
        badge = self.get_by_id(id)
        if obj_in.name and obj_in.name != badge.name:
            existing, _ = self.repo.query_advanced(filters={"name": obj_in.name})
            if existing:
                raise AppValidationError(f"Badge with name '{obj_in.name}' already exists.")
        return self.repo.update(badge, obj_in)

    def delete(self, id: int) -> Badge:
        badge = self.get_by_id(id)
        return self.repo.delete(id)
