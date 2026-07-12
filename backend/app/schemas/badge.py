from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BadgeBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    icon: str = Field(..., min_length=1, max_length=50)
    unlock_rule: str = Field(..., min_length=2)
    status: str = Field(default="active")

class BadgeCreate(BadgeBase):
    pass

class BadgeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    unlock_rule: Optional[str] = None
    status: Optional[str] = None

class BadgeOut(BadgeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
