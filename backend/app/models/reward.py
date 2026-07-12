import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from backend.app.database.session import Base

class Reward(Base):
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    points_required = Column(Integer, nullable=False)
    stock = Column(Integer, default=0)
    status = Column(String, default="active")
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
