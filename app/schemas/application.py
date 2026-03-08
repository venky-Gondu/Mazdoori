from pydantic import BaseModel, ConfigDict
from uuid import UUID
from enum import Enum
from datetime import date

class ApplicationStatusEnum(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class JobApplicationSchema(BaseModel):
    id: UUID
    job_id: UUID
    worker_id: UUID
    status: ApplicationStatusEnum

    model_config = ConfigDict(from_attributes=True)

class WorkerAvailabilitySchema(BaseModel):
    id: UUID
    worker_id: UUID
    start_date: date
    end_date: date
    job_id: UUID | None = None

    model_config = ConfigDict(from_attributes=True)
