from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from backend.app.schemas.department import DepartmentOut
from backend.app.schemas.emission_factor import EmissionFactorOut

class CarbonTransactionBase(BaseModel):
    department_id: int
    emission_factor_id: int
    quantity: float = Field(..., gt=0.0)
    source: str = Field(..., min_length=2, max_length=100)
    reference: str = Field(..., min_length=2, max_length=100)
    transaction_date: datetime
    status: str = Field(default="pending")
    notes: Optional[str] = None

class CarbonTransactionCreate(CarbonTransactionBase):
    pass

class CarbonTransactionUpdate(BaseModel):
    department_id: Optional[int] = None
    emission_factor_id: Optional[int] = None
    quantity: Optional[float] = None
    source: Optional[str] = None
    reference: Optional[str] = None
    transaction_date: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class CarbonTransactionOut(CarbonTransactionBase):
    id: int
    calculated_carbon: float
    created_at: datetime
    updated_at: datetime
    department: Optional[DepartmentOut] = None
    emission_factor: Optional[EmissionFactorOut] = None

    model_config = {"from_attributes": True}
