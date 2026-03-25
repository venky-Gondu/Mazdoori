from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import date
from typing import List, Optional

class JobCreateSchema(BaseModel):
    work_types: List[str]
    location: str
    required_workers: int = Field(..., ge=1)
    start_date: date
    duration_days: int = Field(..., ge=1)
    wage_per_day: Optional[float] = Field(None, ge=0)
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class JobSchema(BaseModel):
    id: UUID
    farmer_id: UUID
    work_types: List[str]
    location: str
    required_workers: int
    start_date: date
    duration_days: int
    wage_per_day: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
