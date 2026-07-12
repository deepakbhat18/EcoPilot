import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
    xp_reward = Column(Integer, nullable=False, default=100)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String(20), nullable=False, default="active")
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    participations = relationship("ChallengeParticipation", back_populates="challenge")

class ChallengeParticipation(Base):
    __tablename__ = "challenge_participations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    challenge_id = Column(Integer, ForeignKey("challenges.id"), nullable=False)
    progress = Column(Float, nullable=False, default=0.0)
    status = Column(String(20), nullable=False, default="active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    challenge = relationship("Challenge", back_populates="participations")
    user = relationship("User")

class RewardRedemption(Base):
    __tablename__ = "reward_redemptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reward_id = Column(Integer, ForeignKey("rewards.id"), nullable=False)
    points_deducted = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="pending")
    redeemed_at = Column(DateTime, default=datetime.datetime.utcnow)

    reward = relationship("Reward")
    user = relationship("User")

class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id"), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.datetime.utcnow)

    badge = relationship("Badge")
    user = relationship("User")
