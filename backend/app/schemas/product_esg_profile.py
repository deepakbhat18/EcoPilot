from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from backend.app.schemas.category import CategoryOut
from backend.app.schemas.emission_factor import EmissionFactorOut

class ProductESGProfileBase(BaseModel):
    product_name: str = Field(..., min_length=2, max_length=200)
    category_id: int
    emission_factor_id: int
    carbon_rating: str = Field(..., min_length=1, max_length=5)
    description: Optional[str] = None

class ProductESGProfileCreate(ProductESGProfileBase):
    pass

class ProductESGProfileUpdate(BaseModel):
    product_name: Optional[str] = None
    category_id: Optional[int] = None
    emission_factor_id: Optional[int] = None
    carbon_rating: Optional[str] = None
    description: Optional[str] = None

class ProductESGProfileOut(ProductESGProfileBase):
    id: int
    category: Optional[CategoryOut] = None
    emission_factor: Optional[EmissionFactorOut] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
