from pydantic import BaseModel, ConfigDict
from typing import Optional, List
import datetime

class CSRActivityBase(BaseModel):
    name: str
    description: Optional[str] = None
    points_multiplier: int = 10
    start_date: datetime.datetime
    end_date: datetime.datetime
    evidence_required: bool = True
    status: str = "active"

class CSRActivityCreate(CSRActivityBase):
    pass

class CSRActivityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    points_multiplier: Optional[int] = None
    start_date: Optional[datetime.datetime] = None
    end_date: Optional[datetime.datetime] = None
    evidence_required: Optional[bool] = None
    status: Optional[str] = None

class CSRActivityOut(CSRActivityBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class CSRParticipationBase(BaseModel):
    csr_activity_id: int
    hours_spent: float
    evidence_url: Optional[str] = None

class CSRParticipationCreate(CSRParticipationBase):
    pass

class CSRParticipationUpdate(BaseModel):
    hours_spent: Optional[float] = None
    evidence_url: Optional[str] = None
    status: Optional[str] = None
    feedback: Optional[str] = None

class CSRParticipationOut(BaseModel):
    id: int
    user_id: int
    csr_activity_id: int
    hours_spent: float
    points_earned: int
    evidence_url: Optional[str] = None
    status: str
    approved_by: Optional[int] = None
    approved_at: Optional[datetime.datetime] = None
    feedback: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    activity: Optional[CSRActivityOut] = None
    model_config = ConfigDict(from_attributes=True)

class TrainingBase(BaseModel):
    title: str
    description: Optional[str] = None
    department_id: Optional[int] = None
    duration_hours: float = 1.0
    status: str = "active"

class TrainingCreate(TrainingBase):
    pass

class TrainingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    department_id: Optional[int] = None
    duration_hours: Optional[float] = None
    status: Optional[str] = None

class TrainingOut(TrainingBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class TrainingCompletionBase(BaseModel):
    training_id: int
    score: Optional[float] = None
    status: str = "completed"

class TrainingCompletionCreate(TrainingCompletionBase):
    pass

class TrainingCompletionOut(TrainingCompletionBase):
    id: int
    user_id: int
    completed_at: datetime.datetime
    training: Optional[TrainingOut] = None
    model_config = ConfigDict(from_attributes=True)

class DiversityMetricBase(BaseModel):
    department_id: Optional[int] = None
    metric_name: str
    value: float

class DiversityMetricCreate(DiversityMetricBase):
    pass

class DiversityMetricOut(DiversityMetricBase):
    id: int
    recorded_date: datetime.datetime
    model_config = ConfigDict(from_attributes=True)
