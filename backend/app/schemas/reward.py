from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class RewardBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = None
    points_required: int = Field(..., ge=0)
    stock: int = Field(default=0, ge=0)
    status: str = Field(default="active")

class RewardCreate(RewardBase):
    pass

class RewardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    points_required: Optional[int] = None
    stock: Optional[int] = None
    status: Optional[str] = None

class RewardOut(RewardBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
