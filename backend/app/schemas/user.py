from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    role: str = "user" 

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="User password")

class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None

class UserOut(UserBase):
    id: int
    created_at: datetime


    model_config = ConfigDict(from_attributes=True)
