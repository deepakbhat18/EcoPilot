from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from backend.app.database.session import get_db
from backend.app.dependencies.auth import get_current_user
from backend.app.models.user import User
from backend.app.schemas.gamification import (
    ChallengeCreate, ChallengeUpdate, ChallengeOut,
    ChallengeParticipationOut, RewardRedemptionOut
)
from backend.app.services.gamification import GamificationService

router = APIRouter()

@router.get("/leaderboard", response_model=List[dict])
async def get_leaderboard(
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GamificationService(db)
    return service.get_leaderboard(limit=limit)

@router.get("/challenges", response_model=List[ChallengeOut])
async def list_challenges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GamificationService(db)
    return service.list_challenges()

@router.post("/challenges", response_model=ChallengeOut, status_code=status.HTTP_201_CREATED)
async def create_challenge(
    payload: ChallengeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GamificationService(db)
    return service.create_challenge(payload)

@router.put("/challenges/{id}", response_model=ChallengeOut)
async def update_challenge(
    id: int,
    payload: ChallengeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GamificationService(db)
    res = service.update_challenge(id, payload)
    if not res:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return res

@router.delete("/challenges/{id}", response_model=ChallengeOut)
async def delete_challenge(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GamificationService(db)
    res = service.delete_challenge(id)
    if not res:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return res

@router.post("/challenges/{id}/participate", response_model=ChallengeParticipationOut)
async def participate_in_challenge(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GamificationService(db)
    return service.participate_in_challenge(current_user.id, id)

@router.put("/challenges/{id}/progress", response_model=ChallengeParticipationOut)
async def update_challenge_progress(
    id: int,
    progress: float = Query(..., ge=0.0, le=100.0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GamificationService(db)
    return service.update_challenge_progress(current_user.id, id, progress)

@router.post("/rewards/{id}/redeem", response_model=RewardRedemptionOut)
async def redeem_reward(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = GamificationService(db)
    try:
        return service.redeem_reward(current_user.id, id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
