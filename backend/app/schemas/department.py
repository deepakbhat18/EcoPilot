from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DepartmentBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=2, max_length=20)
    head: Optional[str] = None
    parent_department_id: Optional[int] = None
    employee_count: int = Field(default=0, ge=0)
    status: str = Field(default="active")
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    head: Optional[str] = None
    parent_department_id: Optional[int] = None
    employee_count: Optional[int] = None
    status: Optional[str] = None
    description: Optional[str] = None

class DepartmentOut(DepartmentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
