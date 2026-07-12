from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.user import User
from backend.app.models.badge import Badge
from backend.app.models.reward import Reward
from backend.app.models.gamification import Challenge, ChallengeParticipation, RewardRedemption, UserBadge
from backend.app.models.social import CSRParticipation, TrainingCompletion
from backend.app.services.settings_notifications import NotificationService
from typing import List, Optional

class GamificationService:
    def __init__(self, db: Session):
        self.db = db
        self.notification_service = NotificationService(db)

    def check_and_award_badges(self, user_id: int):
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return

        badges = self.db.query(Badge).filter(Badge.status == "active", Badge.is_deleted == False).all()
        user_badges_set = set(
            row.badge_id for row in self.db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
        )

        for badge in badges:
            if badge.id in user_badges_set:
                continue

            rule = badge.unlock_rule.lower().strip()
            satisfied = False

            if "xp >=" in rule:
                try:
                    target_xp = int(rule.split(">=")[1].strip())
                    if user.xp_points >= target_xp:
                        satisfied = True
                except:
                    pass
            elif "points >=" in rule:
                try:
                    target_pts = int(rule.split(">=")[1].strip())
                    if user.points_balance >= target_pts:
                        satisfied = True
                except:
                    pass
            elif "csr_hours >=" in rule:
                try:
                    target_hrs = float(rule.split(">=")[1].strip())
                    total_hrs = self.db.query(func.sum(CSRParticipation.hours_spent))\
                        .filter(CSRParticipation.user_id == user_id, CSRParticipation.status == "approved")\
                        .scalar() or 0.0
                    if total_hrs >= target_hrs:
                        satisfied = True
                except:
                    pass
            elif "training >=" in rule:
                try:
                    target_cnt = int(rule.split(">=")[1].strip())
                    total_cnt = self.db.query(func.count(TrainingCompletion.id))\
                        .filter(TrainingCompletion.user_id == user_id)\
                        .count()
                    if total_cnt >= target_cnt:
                        satisfied = True
                except:
                    pass

            if satisfied:
                new_ub = UserBadge(user_id=user_id, badge_id=badge.id)
                self.db.add(new_ub)
                self.db.commit()
                self.notification_service.send_notification(
                    user_id=user_id,
                    title="Badge Unlocked!",
                    message=f"Congratulations! You unlocked the '{badge.name}' badge.",
                    n_type="badge"
                )

    def create_challenge(self, payload) -> Challenge:
        ch = Challenge(
            title=payload.title,
            description=payload.description,
            xp_reward=payload.xp_reward,
            start_date=payload.start_date,
            end_date=payload.end_date,
            status=payload.status
        )
        self.db.add(ch)
        self.db.commit()
        self.db.refresh(ch)
        return ch

    def get_challenge_by_id(self, id: int) -> Optional[Challenge]:
        return self.db.query(Challenge).filter(Challenge.id == id, Challenge.is_deleted == False).first()

    def update_challenge(self, id: int, payload) -> Optional[Challenge]:
        ch = self.get_challenge_by_id(id)
        if ch:
            for k, v in payload.model_dump(exclude_unset=True).items():
                setattr(ch, k, v)
            self.db.commit()
            self.db.refresh(ch)
        return ch

    def delete_challenge(self, id: int) -> Optional[Challenge]:
        ch = self.get_challenge_by_id(id)
        if ch:
            ch.is_deleted = True
            self.db.commit()
            self.db.refresh(ch)
        return ch

    def list_challenges(self) -> List[Challenge]:
        return self.db.query(Challenge).filter(Challenge.is_deleted == False).all()

    def participate_in_challenge(self, user_id: int, challenge_id: int) -> ChallengeParticipation:
        p = self.db.query(ChallengeParticipation).filter(
            ChallengeParticipation.user_id == user_id,
            ChallengeParticipation.challenge_id == challenge_id
        ).first()

        if not p:
            p = ChallengeParticipation(user_id=user_id, challenge_id=challenge_id, progress=0.0, status="active")
            self.db.add(p)
            self.db.commit()
            self.db.refresh(p)
        return p

    def update_challenge_progress(self, user_id: int, challenge_id: int, progress: float) -> ChallengeParticipation:
        p = self.participate_in_challenge(user_id, challenge_id)
        old_status = p.status
        p.progress = min(progress, 100.0)

        if p.progress >= 100.0 and old_status != "completed":
            p.status = "completed"
            ch = self.get_challenge_by_id(challenge_id)
            if ch:
                user = self.db.query(User).filter(User.id == user_id).first()
                if user:
                    user.xp_points += ch.xp_reward
                    user.points_balance += ch.xp_reward
                    self.db.commit()
                    self.notification_service.send_notification(
                        user_id=user_id,
                        title="Challenge Completed!",
                        message=f"You completed challenge '{ch.title}' and earned {ch.xp_reward} XP!",
                        n_type="challenge"
                    )
                    self.check_and_award_badges(user_id)

        self.db.commit()
        self.db.refresh(p)
        return p

    def redeem_reward(self, user_id: int, reward_id: int) -> RewardRedemption:
        user = self.db.query(User).filter(User.id == user_id).first()
        reward = self.db.query(Reward).filter(Reward.id == reward_id).first()

        if not user or not reward:
            raise ValueError("User or Reward not found")

        if user.points_balance < reward.points_required:
            raise ValueError("Insufficient points balance")

        if reward.stock <= 0:
            raise ValueError("Reward is out of stock")

        user.points_balance -= reward.points_required
        reward.stock -= 1

        red = RewardRedemption(
            user_id=user_id,
            reward_id=reward_id,
            points_deducted=reward.points_required,
            status="approved"
        )
        self.db.add(red)
        self.db.commit()
        self.db.refresh(red)

        self.notification_service.send_notification(
            user_id=user_id,
            title="Reward Redeemed!",
            message=f"You redeemed '{reward.name}' for {reward.points_required} points.",
            n_type="reward"
        )
        return red

    def get_leaderboard(self, limit: int = 10) -> List[dict]:
        users = self.db.query(User).filter(User.is_deleted == False).order_by(User.xp_points.desc()).limit(limit).all()
        return [{"id": u.id, "first_name": u.first_name, "last_name": u.last_name, "xp_points": u.xp_points, "points_balance": u.points_balance} for u in users]
