from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List, Generic, TypeVar
from backend.app.database.session import get_db
from backend.app.dependencies.auth import get_current_user
from backend.app.models.user import User
from backend.app.schemas.carbon_transaction import CarbonTransactionCreate, CarbonTransactionUpdate, CarbonTransactionOut
from backend.app.services.carbon_transaction import CarbonTransactionService
from pydantic import BaseModel

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int

router = APIRouter()

@router.get("/dashboard", response_model=dict)
async def get_environmental_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CarbonTransactionService(db)
    return service.get_dashboard_data()

@router.get("/transactions", response_model=PaginatedResponse[CarbonTransactionOut])
async def get_carbon_transactions(
    search: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_desc: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CarbonTransactionService(db)
    items, total = service.search_and_filter(
        search_query=search,
        department_id=department_id,
        status=status,
        sort_by=sort_by,
        sort_desc=sort_desc,
        skip=skip,
        limit=limit
    )
    return PaginatedResponse(items=items, total=total)

@router.get("/transactions/{id}", response_model=CarbonTransactionOut)
async def get_carbon_transaction_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CarbonTransactionService(db)
    return service.get_by_id(id)

@router.post("/transactions", response_model=CarbonTransactionOut, status_code=status.HTTP_201_CREATED)
async def create_carbon_transaction(
    payload: CarbonTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CarbonTransactionService(db)
    return service.create(payload)

@router.put("/transactions/{id}", response_model=CarbonTransactionOut)
async def update_carbon_transaction(
    id: int,
    payload: CarbonTransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CarbonTransactionService(db)
    return service.update(id, payload)

@router.delete("/transactions/{id}", response_model=CarbonTransactionOut)
async def delete_carbon_transaction(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CarbonTransactionService(db)
    return service.delete(id)

@router.get("/tracking/department/{id}", response_model=dict)
async def get_department_carbon_tracking(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CarbonTransactionService(db)
    return service.get_department_carbon_tracking(id)
