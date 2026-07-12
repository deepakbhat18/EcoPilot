from pydantic import BaseModel, ConfigDict
from typing import Optional
import datetime

class SettingBase(BaseModel):
    key: str
    value: str

class SettingCreate(SettingBase):
    pass

class SettingUpdate(BaseModel):
    value: str

class SettingOut(SettingBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class NotificationBase(BaseModel):
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool = False

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    is_read: bool

class NotificationOut(NotificationBase):
    id: int
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)
