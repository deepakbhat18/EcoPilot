from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.user import User
from backend.app.models.department import Department
from backend.app.models.social import CSRActivity, CSRParticipation, Training, TrainingCompletion, DiversityMetric
from backend.app.services.settings_notifications import SettingService, NotificationService
from backend.app.services.gamification import GamificationService
from typing import List, Optional, Tuple

class SocialService:
    def __init__(self, db: Session):
        self.db = db
        self.setting_service = SettingService(db)
        self.notification_service = NotificationService(db)
        self.gamification_service = GamificationService(db)

    def create_csr_activity(self, payload) -> CSRActivity:
        act = CSRActivity(
            name=payload.name,
            description=payload.description,
            points_multiplier=payload.points_multiplier,
            start_date=payload.start_date,
            end_date=payload.end_date,
            evidence_required=payload.evidence_required,
            status=payload.status
        )
        self.db.add(act)
        self.db.commit()
        self.db.refresh(act)
        return act

    def get_csr_activity_by_id(self, id: int) -> Optional[CSRActivity]:
        return self.db.query(CSRActivity).filter(CSRActivity.id == id, CSRActivity.is_deleted == False).first()

    def update_csr_activity(self, id: int, payload) -> Optional[CSRActivity]:
        act = self.get_csr_activity_by_id(id)
        if act:
            for k, v in payload.model_dump(exclude_unset=True).items():
                setattr(act, k, v)
            self.db.commit()
            self.db.refresh(act)
        return act

    def delete_csr_activity(self, id: int) -> Optional[CSRActivity]:
        act = self.get_csr_activity_by_id(id)
        if act:
            act.is_deleted = True
            self.db.commit()
            self.db.refresh(act)
        return act

    def list_csr_activities(self) -> List[CSRActivity]:
        return self.db.query(CSRActivity).filter(CSRActivity.is_deleted == False).all()

    def create_csr_participation(self, user_id: int, payload) -> CSRParticipation:
        activity = self.get_csr_activity_by_id(payload.csr_activity_id)
        if not activity:
            raise ValueError("CSR Activity not found")

        evidence_toggle = self.setting_service.get_setting_bool("evidence_required", True)
        if evidence_toggle and activity.evidence_required and not payload.evidence_url:
            raise ValueError("Evidence upload is required for this activity.")

        part = CSRParticipation(
            user_id=user_id,
            csr_activity_id=payload.csr_activity_id,
            hours_spent=payload.hours_spent,
            evidence_url=payload.evidence_url,
            status="pending"
        )
        self.db.add(part)
        self.db.commit()
        self.db.refresh(part)
        return part

    def approve_reject_csr_participation(self, part_id: int, approver_id: int, status: str, feedback: Optional[str] = None) -> CSRParticipation:
        part = self.db.query(CSRParticipation).filter(CSRParticipation.id == part_id).first()
        if not part:
            raise ValueError("Participation record not found")

        if part.status != "pending":
            raise ValueError("Participation record is already processed")

        part.status = status
        part.feedback = feedback
        part.approved_by = approver_id
        import datetime
        part.approved_at = datetime.datetime.utcnow()

        if status == "approved":
            pts = int(part.hours_spent * part.activity.points_multiplier)
            part.points_earned = pts
            user = self.db.query(User).filter(User.id == part.user_id).first()
            if user:
                user.xp_points += pts
                user.points_balance += pts
                self.db.commit()
                self.notification_service.send_notification(
                    user_id=part.user_id,
                    title="CSR Log Approved!",
                    message=f"Your participation in '{part.activity.name}' was approved. Earned {pts} points!",
                    n_type="csr"
                )
                self.gamification_service.check_and_award_badges(part.user_id)

        self.db.commit()
        self.db.refresh(part)
        return part

    def search_csr_participations(self, search: Optional[str] = None, status: Optional[str] = None, skip: int = 0, limit: int = 10) -> Tuple[List[CSRParticipation], int]:
        q = self.db.query(CSRParticipation)
        if status:
            q = q.filter(CSRParticipation.status == status)
        if search:
            q = q.join(CSRActivity).filter(CSRActivity.name.ilike(f"%{search}%"))
        total = q.count()
        items = q.offset(skip).limit(limit).all()
        return items, total

    def create_training(self, payload) -> Training:
        tr = Training(
            title=payload.title,
            description=payload.description,
            department_id=payload.department_id,
            duration_hours=payload.duration_hours,
            status=payload.status
        )
        self.db.add(tr)
        self.db.commit()
        self.db.refresh(tr)
        return tr

    def get_training_by_id(self, id: int) -> Optional[Training]:
        return self.db.query(Training).filter(Training.id == id, Training.is_deleted == False).first()

    def update_training(self, id: int, payload) -> Optional[Training]:
        tr = self.get_training_by_id(id)
        if tr:
            for k, v in payload.model_dump(exclude_unset=True).items():
                setattr(tr, k, v)
            self.db.commit()
            self.db.refresh(tr)
        return tr

    def delete_training(self, id: int) -> Optional[Training]:
        tr = self.get_training_by_id(id)
        if tr:
            tr.is_deleted = True
            self.db.commit()
            self.db.refresh(tr)
        return tr

    def list_trainings(self) -> List[Training]:
        return self.db.query(Training).filter(Training.is_deleted == False).all()

    def complete_training(self, user_id: int, payload) -> TrainingCompletion:
        tr = self.get_training_by_id(payload.training_id)
        if not tr:
            raise ValueError("Training course not found")

        comp = TrainingCompletion(
            user_id=user_id,
            training_id=payload.training_id,
            score=payload.score,
            status="completed"
        )
        self.db.add(comp)

        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            user.xp_points += 50
            user.points_balance += 50
            self.db.commit()
            self.notification_service.send_notification(
                user_id=user_id,
                title="Training Completed!",
                message=f"You completed '{tr.title}'! 50 XP awarded.",
                n_type="training"
            )
            self.gamification_service.check_and_award_badges(user_id)

        self.db.commit()
        self.db.refresh(comp)
        return comp

    def list_user_completions(self, user_id: int) -> List[TrainingCompletion]:
        return self.db.query(TrainingCompletion).filter(TrainingCompletion.user_id == user_id).all()

    def get_social_dashboard_data(self) -> dict:
        total_hours = self.db.query(func.sum(CSRParticipation.hours_spent)).filter(CSRParticipation.status == "approved").scalar() or 0.0
        total_participations = self.db.query(func.count(CSRParticipation.id)).filter(CSRParticipation.status == "approved").scalar() or 0
        total_completions = self.db.query(func.count(TrainingCompletion.id)).scalar() or 0
        active_activities = self.db.query(func.count(CSRActivity.id)).filter(CSRActivity.status == "active", CSRActivity.is_deleted == False).scalar() or 0

        dept_parts = self.db.query(
            Department.name,
            func.count(CSRParticipation.id)
        ).select_from(CSRParticipation).join(User, User.id == CSRParticipation.user_id).join(Department, Department.id == User.department_id).filter(CSRParticipation.status == "approved").group_by(Department.name).all()

        bar_chart = [{"name": r[0], "value": r[1]} for r in dept_parts]

        diversity_metrics = self.db.query(DiversityMetric).all()
        pie_chart = [{"name": m.metric_name, "value": m.value} for m in diversity_metrics]

        return {
            "total_hours": total_hours,
            "total_participations": total_participations,
            "total_completions": total_completions,
            "active_activities": active_activities,
            "bar_chart": bar_chart,
            "pie_chart": pie_chart
        }

    def record_diversity_metric(self, payload) -> DiversityMetric:
        dm = DiversityMetric(
            department_id=payload.department_id,
            metric_name=payload.metric_name,
            value=payload.value
        )
        self.db.add(dm)
        self.db.commit()
        self.db.refresh(dm)
        return dm
