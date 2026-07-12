from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List, Generic, TypeVar
from backend.app.database.session import get_db
from backend.app.dependencies.auth import get_current_user
from backend.app.models.user import User
from backend.app.schemas.governance import (
    PolicyAcknowledgementOut,
    AuditCreate, AuditUpdate, AuditOut,
    ComplianceIssueCreate, ComplianceIssueUpdate, ComplianceIssueOut
)
from backend.app.services.governance import GovernanceService
from pydantic import BaseModel

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int

router = APIRouter()

@router.get("/dashboard", response_model=dict)
async def get_governance_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GovernanceService(db)
    return service.get_governance_dashboard_data()

@router.post("/policies/{id}/acknowledge", response_model=PolicyAcknowledgementOut)
async def acknowledge_policy(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GovernanceService(db)
    try:
        return service.acknowledge_policy(current_user.id, id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/audits", response_model=List[AuditOut])
async def list_audits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GovernanceService(db)
    return service.list_audits()

@router.post("/audits", response_model=AuditOut, status_code=status.HTTP_201_CREATED)
async def create_audit(
    payload: AuditCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GovernanceService(db)
    return service.create_audit(current_user.id, payload)

@router.put("/audits/{id}", response_model=AuditOut)
async def update_audit(
    id: int,
    payload: AuditUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GovernanceService(db)
    res = service.update_audit(id, payload)
    if not res:
        raise HTTPException(status_code=404, detail="Audit not found")
    return res

@router.delete("/audits/{id}", response_model=AuditOut)
async def delete_audit(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GovernanceService(db)
    res = service.delete_audit(id)
    if not res:
        raise HTTPException(status_code=404, detail="Audit not found")
    return res

@router.get("/compliance-issues", response_model=PaginatedResponse[dict])
async def get_compliance_issues(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GovernanceService(db)
    items, total = service.search_compliance_issues(search=search, status=status, skip=skip, limit=limit)
    return PaginatedResponse(items=items, total=total)

@router.post("/compliance-issues", response_model=ComplianceIssueOut, status_code=status.HTTP_201_CREATED)
async def create_compliance_issue(
    payload: ComplianceIssueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GovernanceService(db)
    try:
        return service.create_compliance_issue(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/compliance-issues/{id}", response_model=ComplianceIssueOut)
async def update_compliance_issue(
    id: int,
    payload: ComplianceIssueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GovernanceService(db)
    res = service.update_compliance_issue(id, payload)
    if not res:
        raise HTTPException(status_code=404, detail="Compliance issue not found")
    return res

@router.delete("/compliance-issues/{id}", response_model=ComplianceIssueOut)
async def delete_compliance_issue(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GovernanceService(db)
    res = service.delete_compliance_issue(id)
    if not res:
        raise HTTPException(status_code=404, detail="Compliance issue not found")
    return res

@router.post("/compliance-issues/trigger-reminders", status_code=status.HTTP_200_OK)
async def trigger_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GovernanceService(db)
    service.trigger_overdue_reminders()
    return {"message": "Overdue reminders processed successfully"}
