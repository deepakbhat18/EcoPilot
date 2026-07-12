from sqlalchemy.orm import Session
from typing import Optional, List, Tuple
from backend.app.repositories.reward import RewardRepository
from backend.app.models.reward import Reward
from backend.app.schemas.reward import RewardCreate, RewardUpdate
from backend.app.exceptions.exceptions import AppValidationError, NotFoundException

class RewardService:
    def __init__(self, db: Session):
        self.repo = RewardRepository(db)

    def get_by_id(self, id: int) -> Reward:
        reward = self.repo.get_by_id(id)
        if not reward:
            raise NotFoundException("Reward not found.")
        return reward

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Reward]:
        return self.repo.get_all(skip, limit)

    def search_and_filter(
        self,
        search_query: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_desc: bool = False,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[Reward], int]:
        filters = {}
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

    def create(self, obj_in: RewardCreate) -> Reward:
        existing, _ = self.repo.query_advanced(filters={"name": obj_in.name})
        if existing:
            raise AppValidationError(f"Reward with name '{obj_in.name}' already exists.")
        return self.repo.create(obj_in)

    def update(self, id: int, obj_in: RewardUpdate) -> Reward:
        reward = self.get_by_id(id)
        if obj_in.name and obj_in.name != reward.name:
            existing, _ = self.repo.query_advanced(filters={"name": obj_in.name})
            if existing:
                raise AppValidationError(f"Reward with name '{obj_in.name}' already exists.")
        return self.repo.update(reward, obj_in)

    def delete(self, id: int) -> Reward:
        reward = self.get_by_id(id)
        return self.repo.delete(id)
