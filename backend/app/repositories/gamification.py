from sqlalchemy.orm import Session
from backend.app.repositories.base import BaseRepository
from backend.app.models.gamification import Challenge, ChallengeParticipation, RewardRedemption, UserBadge

class ChallengeRepository(BaseRepository[Challenge]):
    def __init__(self, db: Session):
        super().__init__(Challenge, db)

class ChallengeParticipationRepository(BaseRepository[ChallengeParticipation]):
    def __init__(self, db: Session):
        super().__init__(ChallengeParticipation, db)

class RewardRedemptionRepository(BaseRepository[RewardRedemption]):
    def __init__(self, db: Session):
        super().__init__(RewardRedemption, db)

class UserBadgeRepository(BaseRepository[UserBadge]):
    def __init__(self, db: Session):
        super().__init__(UserBadge, db)
