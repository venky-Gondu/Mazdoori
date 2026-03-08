from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, Date, ForeignKey
from uuid import uuid4
from app.core.db_config import Base

class WorkerAvailability(Base):
    __tablename__ = "worker_availability"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"))
