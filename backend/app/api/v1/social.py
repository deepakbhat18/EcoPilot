from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List, Generic, TypeVar
from backend.app.database.session import get_db
from backend.app.dependencies.auth import get_current_user
from backend.app.models.user import User
from backend.app.schemas.social import (
    CSRActivityCreate, CSRActivityUpdate, CSRActivityOut,
    CSRParticipationCreate, CSRParticipationUpdate, CSRParticipationOut,
    TrainingCreate, TrainingUpdate, TrainingOut,
    TrainingCompletionCreate, TrainingCompletionOut,
    DiversityMetricCreate, DiversityMetricOut
)
from backend.app.services.social import SocialService
from pydantic import BaseModel

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int

router = APIRouter()

@router.get("/dashboard", response_model=dict)
async def get_social_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialService(db)
    return service.get_social_dashboard_data()

@router.get("/activities", response_model=List[CSRActivityOut])
async def list_csr_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialService(db)
    return service.list_csr_activities()

@router.post("/activities", response_model=CSRActivityOut, status_code=status.HTTP_201_CREATED)
async def create_csr_activity(
    payload: CSRActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialService(db)
    return service.create_csr_activity(payload)

@router.put("/activities/{id}", response_model=CSRActivityOut)
async def update_csr_activity(
    id: int,
    payload: CSRActivityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialService(db)
    res = service.update_csr_activity(id, payload)
    if not res:
        raise HTTPException(status_code=404, detail="Activity not found")
    return res

@router.delete("/activities/{id}", response_model=CSRActivityOut)
async def delete_csr_activity(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialService(db)
    res = service.delete_csr_activity(id)
    if not res:
        raise HTTPException(status_code=404, detail="Activity not found")
    return res

@router.get("/participations", response_model=PaginatedResponse[CSRParticipationOut])
async def get_csr_participations(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialService(db)
    items, total = service.search_csr_participations(search=search, status=status, skip=skip, limit=limit)
    return PaginatedResponse(items=items, total=total)

@router.post("/participations", response_model=CSRParticipationOut, status_code=status.HTTP_201_CREATED)
async def create_csr_participation(
    payload: CSRParticipationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialService(db)
    try:
        return service.create_csr_participation(current_user.id, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/participations/{id}/approve", response_model=CSRParticipationOut)
async def approve_csr_participation(
    id: int,
    status: str = Query(...),
    feedback: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialService(db)
    try:
        return service.approve_reject_csr_participation(id, current_user.id, status, feedback)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/trainings", response_model=List[TrainingOut])
async def list_trainings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialService(db)
    return service.list_trainings()

@router.post("/trainings", response_model=TrainingOut, status_code=status.HTTP_201_CREATED)
async def create_training(
    payload: TrainingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialService(db)
    return service.create_training(payload)

@router.put("/trainings/{id}", response_model=TrainingOut)
async def update_training(
    id: int,
    payload: TrainingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialService(db)
    res = service.update_training(id, payload)
    if not res:
        raise HTTPException(status_code=404, detail="Training course not found")
    return res

@router.delete("/trainings/{id}", response_model=TrainingOut)
async def delete_training(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialService(db)
    res = service.delete_training(id)
    if not res:
        raise HTTPException(status_code=404, detail="Training course not found")
    return res

@router.post("/trainings/complete", response_model=TrainingCompletionOut, status_code=status.HTTP_201_CREATED)
async def complete_training(
    payload: TrainingCompletionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialService(db)
    try:
        return service.complete_training(current_user.id, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/trainings/completions", response_model=List[TrainingCompletionOut])
async def list_user_completions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialService(db)
    return service.list_user_completions(current_user.id)

@router.post("/diversity-metrics", response_model=DiversityMetricOut, status_code=status.HTTP_201_CREATED)
async def record_diversity_metric(
    payload: DiversityMetricCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SocialService(db)
    return service.record_diversity_metric(payload)
