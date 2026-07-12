from sqlalchemy.orm import Session
from sqlalchemy import func
import datetime
from backend.app.models.user import User
from backend.app.models.policy import Policy
from backend.app.models.governance import PolicyAcknowledgement, Audit, ComplianceIssue
from backend.app.services.settings_notifications import NotificationService
from backend.app.services.gamification import GamificationService
from typing import List, Optional, Tuple

class GovernanceService:
    def __init__(self, db: Session):
        self.db = db
        self.notification_service = NotificationService(db)
        self.gamification_service = GamificationService(db)

    def acknowledge_policy(self, user_id: int, policy_id: int) -> PolicyAcknowledgement:
        pol = self.db.query(Policy).filter(Policy.id == policy_id).first()
        if not pol:
            raise ValueError("Policy not found")

        ack = self.db.query(PolicyAcknowledgement).filter(
            PolicyAcknowledgement.user_id == user_id,
            PolicyAcknowledgement.policy_id == policy_id
        ).first()

        if not ack:
            ack = PolicyAcknowledgement(user_id=user_id, policy_id=policy_id)
            self.db.add(ack)

            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                user.xp_points += 10
                user.points_balance += 10
                self.db.commit()
                self.notification_service.send_notification(
                    user_id=user_id,
                    title="Policy Acknowledged",
                    message=f"You successfully acknowledged the policy '{pol.title}'. Earned 10 XP!",
                    n_type="policy"
                )
                self.gamification_service.check_and_award_badges(user_id)

        self.db.commit()
        self.db.refresh(ack)
        return ack

    def create_audit(self, auditor_id: int, payload) -> Audit:
        audit = Audit(
            title=payload.title,
            auditor_id=auditor_id,
            scope=payload.scope,
            findings=payload.findings,
            status=payload.status,
            audit_date=payload.audit_date
        )
        self.db.add(audit)
        self.db.commit()
        self.db.refresh(audit)
        return audit

    def get_audit_by_id(self, id: int) -> Optional[Audit]:
        return self.db.query(Audit).filter(Audit.id == id, Audit.is_deleted == False).first()

    def update_audit(self, id: int, payload) -> Optional[Audit]:
        audit = self.get_audit_by_id(id)
        if audit:
            for k, v in payload.model_dump(exclude_unset=True).items():
                setattr(audit, k, v)
            self.db.commit()
            self.db.refresh(audit)
        return audit

    def delete_audit(self, id: int) -> Optional[Audit]:
        audit = self.get_audit_by_id(id)
        if audit:
            audit.is_deleted = True
            self.db.commit()
            self.db.refresh(audit)
        return audit

    def list_audits(self) -> List[Audit]:
        return self.db.query(Audit).filter(Audit.is_deleted == False).all()

    def create_compliance_issue(self, payload) -> ComplianceIssue:
        if not payload.owner_id or not payload.due_date:
            raise ValueError("Owner and Due Date are mandatory for compliance issues")

        issue = ComplianceIssue(
            title=payload.title,
            description=payload.description,
            owner_id=payload.owner_id,
            due_date=payload.due_date,
            status=payload.status,
            severity=payload.severity
        )
        self.db.add(issue)
        self.db.commit()
        self.db.refresh(issue)

        self.notification_service.send_notification(
            user_id=payload.owner_id,
            title="New Compliance Issue",
            message=f"You have been assigned compliance issue '{payload.title}'. Due by {payload.due_date.date()}.",
            n_type="compliance"
        )
        return issue

    def get_compliance_issue_by_id(self, id: int) -> Optional[ComplianceIssue]:
        return self.db.query(ComplianceIssue).filter(ComplianceIssue.id == id, ComplianceIssue.is_deleted == False).first()

    def update_compliance_issue(self, id: int, payload) -> Optional[ComplianceIssue]:
        issue = self.get_compliance_issue_by_id(id)
        if issue:
            for k, v in payload.model_dump(exclude_unset=True).items():
                setattr(issue, k, v)
            self.db.commit()
            self.db.refresh(issue)
        return issue

    def delete_compliance_issue(self, id: int) -> Optional[ComplianceIssue]:
        issue = self.get_compliance_issue_by_id(id)
        if issue:
            issue.is_deleted = True
            self.db.commit()
            self.db.refresh(issue)
        return issue

    def search_compliance_issues(self, search: Optional[str] = None, status: Optional[str] = None, skip: int = 0, limit: int = 10) -> Tuple[List[dict], int]:
        q = self.db.query(ComplianceIssue).filter(ComplianceIssue.is_deleted == False)
        if status:
            q = q.filter(ComplianceIssue.status == status)
        if search:
            q = q.filter(ComplianceIssue.title.ilike(f"%{search}%"))

        total = q.count()
        items = q.offset(skip).limit(limit).all()

        now = datetime.datetime.utcnow()
        results = []
        for issue in items:
            is_overdue = issue.status == "open" and issue.due_date < now
            issue_dict = {
                "id": issue.id,
                "title": issue.title,
                "description": issue.description,
                "owner_id": issue.owner_id,
                "due_date": issue.due_date,
                "status": issue.status,
                "severity": issue.severity,
                "is_overdue": is_overdue,
                "created_at": issue.created_at,
                "updated_at": issue.updated_at,
                "owner": issue.owner
            }
            results.append(issue_dict)
        return results, total

    def trigger_overdue_reminders(self):
        now = datetime.datetime.utcnow()
        overdue_issues = self.db.query(ComplianceIssue).filter(
            ComplianceIssue.is_deleted == False,
            ComplianceIssue.status == "open",
            ComplianceIssue.due_date < now
        ).all()

        for issue in overdue_issues:
            self.notification_service.send_notification(
                user_id=issue.owner_id,
                title="URGENT: Compliance Issue Overdue!",
                message=f"Compliance issue '{issue.title}' was due on {issue.due_date.date()} and is currently overdue.",
                n_type="compliance_alert"
            )

    def get_governance_dashboard_data(self) -> dict:
        total_policies = self.db.query(func.count(Policy.id)).filter(Policy.status == "active").scalar() or 0
        total_acknowledgements = self.db.query(func.count(PolicyAcknowledgement.id)).scalar() or 0
        open_issues = self.db.query(func.count(ComplianceIssue.id)).filter(ComplianceIssue.is_deleted == False, ComplianceIssue.status == "open").scalar() or 0

        now = datetime.datetime.utcnow()
        overdue_issues = self.db.query(func.count(ComplianceIssue.id)).filter(
            ComplianceIssue.is_deleted == False,
            ComplianceIssue.status == "open",
            ComplianceIssue.due_date < now
        ).scalar() or 0

        total_audits = self.db.query(func.count(Audit.id)).filter(Audit.is_deleted == False).scalar() or 0

        severity_counts = self.db.query(
            ComplianceIssue.severity,
            func.count(ComplianceIssue.id)
        ).filter(ComplianceIssue.is_deleted == False, ComplianceIssue.status == "open").group_by(ComplianceIssue.severity).all()

        pie_chart = [{"name": r[0], "value": r[1]} for r in severity_counts]

        return {
            "total_policies": total_policies,
            "total_acknowledgements": total_acknowledgements,
            "open_issues": open_issues,
            "overdue_issues": overdue_issues,
            "total_audits": total_audits,
            "pie_chart": pie_chart
        }
