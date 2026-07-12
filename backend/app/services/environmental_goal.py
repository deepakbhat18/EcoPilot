from sqlalchemy.orm import Session
from typing import Optional, List, Tuple
from backend.app.repositories.environmental_goal import EnvironmentalGoalRepository
from backend.app.repositories.department import DepartmentRepository
from backend.app.models.environmental_goal import EnvironmentalGoal
from backend.app.schemas.environmental_goal import EnvironmentalGoalCreate, EnvironmentalGoalUpdate
from backend.app.exceptions.exceptions import AppValidationError, NotFoundException

class EnvironmentalGoalService:
    def __init__(self, db: Session):
        self.repo = EnvironmentalGoalRepository(db)
        self.dept_repo = DepartmentRepository(db)

    def get_by_id(self, id: int) -> EnvironmentalGoal:
        goal = self.repo.get_by_id(id)
        if not goal:
            raise NotFoundException("Environmental Goal not found.")
        return goal

    def get_all(self, skip: int = 0, limit: int = 100) -> List[EnvironmentalGoal]:
        return self.repo.get_all(skip, limit)

    def search_and_filter(
        self,
        search_query: Optional[str] = None,
        department_id: Optional[int] = None,
        status: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_desc: bool = False,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[EnvironmentalGoal], int]:
        filters = {}
        if department_id:
            filters["department_id"] = department_id
        if status:
            filters["status"] = status
        search_fields = ["title", "status"]
        return self.repo.query_advanced(
            search_query=search_query,
            search_fields=search_fields,
            filters=filters,
            sort_by=sort_by,
            sort_desc=sort_desc,
            skip=skip,
            limit=limit
        )

    def create(self, obj_in: EnvironmentalGoalCreate) -> EnvironmentalGoal:
        if obj_in.department_id:
            dept = self.dept_repo.get_by_id(obj_in.department_id)
            if not dept:
                raise AppValidationError("Department does not exist.")
        return self.repo.create(obj_in)

    def update(self, id: int, obj_in: EnvironmentalGoalUpdate) -> EnvironmentalGoal:
        goal = self.get_by_id(id)
        if obj_in.department_id:
            dept = self.dept_repo.get_by_id(obj_in.department_id)
            if not dept:
                raise AppValidationError("Department does not exist.")
        return self.repo.update(goal, obj_in)

    def delete(self, id: int) -> EnvironmentalGoal:
        goal = self.get_by_id(id)
        return self.repo.delete(id)
