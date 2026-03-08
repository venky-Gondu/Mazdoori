from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import date
from typing import List, Optional

class JobSchema(BaseModel):
    id: UUID
    farmer_id: UUID
    work_types: List[str]
    location: str
    required_workers: int
    start_date: date
    duration_days: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
