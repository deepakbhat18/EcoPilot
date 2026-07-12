from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from backend.app.schemas.department import DepartmentOut

class EnvironmentalGoalBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    department_id: Optional[int] = None
    target: float = Field(..., ge=0.0)
    current_progress: float = Field(default=0.0, ge=0.0)
    deadline: date
    status: str = Field(default="active")

class EnvironmentalGoalCreate(EnvironmentalGoalBase):
    pass

class EnvironmentalGoalUpdate(BaseModel):
    title: Optional[str] = None
    department_id: Optional[int] = None
    target: Optional[float] = None
    current_progress: Optional[float] = None
    deadline: Optional[date] = None
    status: Optional[str] = None

class EnvironmentalGoalOut(EnvironmentalGoalBase):
    id: int
    department: Optional[DepartmentOut] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
