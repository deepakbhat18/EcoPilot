from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date

class PolicyBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    effective_date: date
    status: str = Field(default="active")

class PolicyCreate(PolicyBase):
    pass

class PolicyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    effective_date: Optional[date] = None
    status: Optional[str] = None

class PolicyOut(PolicyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
