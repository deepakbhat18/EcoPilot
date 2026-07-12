import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class PolicyAcknowledgement(Base):
    __tablename__ = "policy_acknowledgements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    acknowledged_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")
    policy = relationship("Policy")

class Audit(Base):
    __tablename__ = "audits"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    auditor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scope = Column(String, nullable=True)
    findings = Column(String, nullable=True)
    status = Column(String(20), nullable=False, default="draft")
    audit_date = Column(DateTime, nullable=False)
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    auditor = relationship("User")

class ComplianceIssue(Base):
    __tablename__ = "compliance_issues"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    due_date = Column(DateTime, nullable=False)
    status = Column(String(20), nullable=False, default="open")
    severity = Column(String(20), nullable=False, default="medium")
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    owner = relationship("User")
