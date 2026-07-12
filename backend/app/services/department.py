from sqlalchemy.orm import Session
from typing import Optional, List, Tuple
from backend.app.repositories.department import DepartmentRepository
from backend.app.models.department import Department
from backend.app.schemas.department import DepartmentCreate, DepartmentUpdate
from backend.app.exceptions.exceptions import AppValidationError, NotFoundException

class DepartmentService:
    def __init__(self, db: Session):
        self.repo = DepartmentRepository(db)

    def get_by_id(self, id: int) -> Department:
        dept = self.repo.get_by_id(id)
        if not dept:
            raise NotFoundException("Department not found.")
        return dept

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Department]:
        return self.repo.get_all(skip, limit)

    def search_and_filter(
        self,
        search_query: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_desc: bool = False,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[Department], int]:
        filters = {}
        if status:
            filters["status"] = status
        search_fields = ["name", "code", "head", "description"]
        return self.repo.query_advanced(
            search_query=search_query,
            search_fields=search_fields,
            filters=filters,
            sort_by=sort_by,
            sort_desc=sort_desc,
            skip=skip,
            limit=limit
        )

    def create(self, obj_in: DepartmentCreate) -> Department:
        existing_name, _ = self.repo.query_advanced(filters={"name": obj_in.name})
        if existing_name:
            raise AppValidationError(f"Department with name '{obj_in.name}' already exists.")
        existing_code, _ = self.repo.query_advanced(filters={"code": obj_in.code})
        if existing_code:
            raise AppValidationError(f"Department with code '{obj_in.code}' already exists.")
        if obj_in.parent_department_id:
            parent = self.repo.get_by_id(obj_in.parent_department_id)
            if not parent:
                raise AppValidationError("Parent department does not exist.")
        return self.repo.create(obj_in)

    def update(self, id: int, obj_in: DepartmentUpdate) -> Department:
        dept = self.get_by_id(id)
        if obj_in.name and obj_in.name != dept.name:
            existing_name, _ = self.repo.query_advanced(filters={"name": obj_in.name})
            if existing_name:
                raise AppValidationError(f"Department with name '{obj_in.name}' already exists.")
        if obj_in.code and obj_in.code != dept.code:
            existing_code, _ = self.repo.query_advanced(filters={"code": obj_in.code})
            if existing_code:
                raise AppValidationError(f"Department with code '{obj_in.code}' already exists.")
        if obj_in.parent_department_id:
            if obj_in.parent_department_id == id:
                raise AppValidationError("A department cannot be its own parent.")
            parent = self.repo.get_by_id(obj_in.parent_department_id)
            if not parent:
                raise AppValidationError("Parent department does not exist.")
        return self.repo.update(dept, obj_in)

    def delete(self, id: int) -> Department:
        dept = self.get_by_id(id)
        return self.repo.delete(id)
