from sqlalchemy import Column, Integer, String, JSON
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)
    permissions = Column(JSON, nullable=False, default=list)

    users = relationship("User", back_populates="role")
