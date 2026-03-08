from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, ForeignKey, Enum
from uuid import uuid4
from app.core.db_config import Base
from enum import Enum as PyEnum

class ApplicationStatus(PyEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"))
    worker_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    status = Column(Enum(ApplicationStatus, name="application_status"), default=ApplicationStatus.PENDING)
