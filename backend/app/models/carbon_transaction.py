import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class CarbonTransaction(Base):
    __tablename__ = "carbon_transactions"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    emission_factor_id = Column(Integer, ForeignKey("emission_factors.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    calculated_carbon = Column(Float, nullable=False)
    source = Column(String, nullable=False)
    reference = Column(String, nullable=False)
    transaction_date = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    status = Column(String, default="pending", nullable=False)
    notes = Column(String, nullable=True)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    department = relationship("Department", backref="carbon_transactions")
    emission_factor = relationship("EmissionFactor", backref="carbon_transactions")
