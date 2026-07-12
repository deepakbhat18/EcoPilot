from sqlalchemy.orm import Session
from typing import Optional, List, Tuple
from backend.app.repositories.policy import PolicyRepository
from backend.app.models.policy import Policy
from backend.app.schemas.policy import PolicyCreate, PolicyUpdate
from backend.app.exceptions.exceptions import AppValidationError, NotFoundException

class PolicyService:
    def __init__(self, db: Session):
        self.repo = PolicyRepository(db)

    def get_by_id(self, id: int) -> Policy:
        policy = self.repo.get_by_id(id)
        if not policy:
            raise NotFoundException("Policy not found.")
        return policy

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Policy]:
        return self.repo.get_all(skip, limit)

    def search_and_filter(
        self,
        search_query: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_desc: bool = False,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[Policy], int]:
        filters = {}
        if status:
            filters["status"] = status
        search_fields = ["title", "description"]
        return self.repo.query_advanced(
            search_query=search_query,
            search_fields=search_fields,
            filters=filters,
            sort_by=sort_by,
            sort_desc=sort_desc,
            skip=skip,
            limit=limit
        )

    def create(self, obj_in: PolicyCreate) -> Policy:
        existing, _ = self.repo.query_advanced(filters={"title": obj_in.title})
        if existing:
            raise AppValidationError(f"Policy with title '{obj_in.title}' already exists.")
        return self.repo.create(obj_in)

    def update(self, id: int, obj_in: PolicyUpdate) -> Policy:
        policy = self.get_by_id(id)
        if obj_in.title and obj_in.title != policy.title:
            existing, _ = self.repo.query_advanced(filters={"title": obj_in.title})
            if existing:
                raise AppValidationError(f"Policy with title '{obj_in.title}' already exists.")
        return self.repo.update(policy, obj_in)

    def delete(self, id: int) -> Policy:
        policy = self.get_by_id(id)
        return self.repo.delete(id)
