from pydantic import BaseModel, ConfigDict
from typing import Optional
import datetime

class ChallengeBase(BaseModel):
    title: str
    description: Optional[str] = None
    xp_reward: int = 100
    start_date: datetime.datetime
    end_date: datetime.datetime
    status: str = "active"

class ChallengeCreate(ChallengeBase):
    pass

class ChallengeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    xp_reward: Optional[int] = None
    start_date: Optional[datetime.datetime] = None
    end_date: Optional[datetime.datetime] = None
    status: Optional[str] = None

class ChallengeOut(ChallengeBase):
    id: int
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class ChallengeParticipationBase(BaseModel):
    challenge_id: int
    progress: float = 0.0

class ChallengeParticipationCreate(ChallengeParticipationBase):
    pass

class ChallengeParticipationUpdate(BaseModel):
    progress: Optional[float] = None
    status: Optional[str] = None

class ChallengeParticipationOut(ChallengeParticipationBase):
    id: int
    user_id: int
    status: str
    created_at: datetime.datetime
    challenge: Optional[ChallengeOut] = None
    model_config = ConfigDict(from_attributes=True)

class RewardRedemptionBase(BaseModel):
    reward_id: int

class RewardRedemptionCreate(RewardRedemptionBase):
    pass

class RewardRedemptionUpdate(BaseModel):
    status: str

class RewardRedemptionOut(RewardRedemptionBase):
    id: int
    user_id: int
    points_deducted: int
    status: str
    redeemed_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class UserBadgeBase(BaseModel):
    badge_id: int

class UserBadgeCreate(UserBadgeBase):
    pass

class UserBadgeOut(UserBadgeBase):
    id: int
    user_id: int
    unlocked_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)
