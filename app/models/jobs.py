from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, ForeignKey, Integer, Date, ARRAY, Float
from uuid import uuid4
from app.core.db_config import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)  # ✅ FIXED
    work_types = Column(ARRAY(String), nullable=False)
    location = Column(String, nullable=False)
    required_workers = Column(Integer, nullable=False)
    start_date = Column(Date, nullable=False)
    duration_days = Column(Integer, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
