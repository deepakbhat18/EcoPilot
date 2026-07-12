from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from backend.app.schemas.category import CategoryOut

class EmissionFactorBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    source: str = Field(..., min_length=2, max_length=100)
    category_id: int
    factor: float = Field(..., ge=0.0)
    unit: str = Field(..., min_length=1, max_length=50)
    status: str = Field(default="active")
    description: Optional[str] = None

class EmissionFactorCreate(EmissionFactorBase):
    pass

class EmissionFactorUpdate(BaseModel):
    name: Optional[str] = None
    source: Optional[str] = None
    category_id: Optional[int] = None
    factor: Optional[float] = None
    unit: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None

class EmissionFactorOut(EmissionFactorBase):
    id: int
    category: Optional[CategoryOut] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
