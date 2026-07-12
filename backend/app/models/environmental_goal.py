import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class EnvironmentalGoal(Base):
    __tablename__ = "environmental_goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    target = Column(Float, nullable=False)
    current_progress = Column(Float, default=0.0)
    deadline = Column(Date, nullable=False)
    status = Column(String, default="active")
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    department = relationship("Department")
