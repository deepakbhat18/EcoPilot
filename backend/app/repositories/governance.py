from sqlalchemy.orm import Session
from backend.app.repositories.base import BaseRepository
from backend.app.models.governance import PolicyAcknowledgement, Audit, ComplianceIssue

class PolicyAcknowledgementRepository(BaseRepository[PolicyAcknowledgement]):
    def __init__(self, db: Session):
        super().__init__(PolicyAcknowledgement, db)

class AuditRepository(BaseRepository[Audit]):
    def __init__(self, db: Session):
        super().__init__(Audit, db)

class ComplianceIssueRepository(BaseRepository[ComplianceIssue]):
    def __init__(self, db: Session):
        super().__init__(ComplianceIssue, db)
