import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class CSRActivity(Base):
    __tablename__ = "csr_activities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
    points_multiplier = Column(Integer, nullable=False, default=10)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    evidence_required = Column(Boolean, nullable=False, default=True)
    status = Column(String(20), nullable=False, default="active")
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    participations = relationship("CSRParticipation", back_populates="activity")

class CSRParticipation(Base):
    __tablename__ = "csr_participations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    csr_activity_id = Column(Integer, ForeignKey("csr_activities.id"), nullable=False)
    hours_spent = Column(Float, nullable=False, default=0.0)
    points_earned = Column(Integer, nullable=False, default=0)
    evidence_url = Column(String, nullable=True)
    status = Column(String(20), nullable=False, default="pending")
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    feedback = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    activity = relationship("CSRActivity", back_populates="participations")
    user = relationship("User", foreign_keys=[user_id])
    approver = relationship("User", foreign_keys=[approved_by])

class Training(Base):
    __tablename__ = "trainings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    duration_hours = Column(Float, nullable=False, default=1.0)
    status = Column(String(20), nullable=False, default="active")
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    completions = relationship("TrainingCompletion", back_populates="training")
    department = relationship("Department")

class TrainingCompletion(Base):
    __tablename__ = "training_completions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    training_id = Column(Integer, ForeignKey("trainings.id"), nullable=False)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)
    score = Column(Float, nullable=True)
    status = Column(String(20), nullable=False, default="completed")

    training = relationship("Training", back_populates="completions")
    user = relationship("User")

class DiversityMetric(Base):
    __tablename__ = "diversity_metrics"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    metric_name = Column(String(50), nullable=False)
    value = Column(Float, nullable=False)
    recorded_date = Column(DateTime, default=datetime.datetime.utcnow)

    department = relationship("Department")
