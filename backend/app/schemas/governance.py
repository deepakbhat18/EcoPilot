from pydantic import BaseModel, ConfigDict
from typing import Optional
import datetime

class PolicyAcknowledgementBase(BaseModel):
    policy_id: int

class PolicyAcknowledgementCreate(PolicyAcknowledgementBase):
    pass

class PolicyAcknowledgementOut(PolicyAcknowledgementBase):
    id: int
    user_id: int
    acknowledged_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class AuditBase(BaseModel):
    title: str
    scope: Optional[str] = None
    findings: Optional[str] = None
    status: str = "draft"
    audit_date: datetime.datetime

class AuditCreate(AuditBase):
    pass

class AuditUpdate(BaseModel):
    title: Optional[str] = None
    scope: Optional[str] = None
    findings: Optional[str] = None
    status: Optional[str] = None
    audit_date: Optional[datetime.datetime] = None

class AuditOut(AuditBase):
    id: int
    auditor_id: int
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class ComplianceIssueBase(BaseModel):
    title: str
    description: Optional[str] = None
    owner_id: int
    due_date: datetime.datetime
    status: str = "open"
    severity: str = "medium"

class ComplianceIssueCreate(ComplianceIssueBase):
    pass

class ComplianceIssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    owner_id: Optional[int] = None
    due_date: Optional[datetime.datetime] = None
    status: Optional[str] = None
    severity: Optional[str] = None

class ComplianceIssueOut(ComplianceIssueBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)
