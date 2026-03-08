from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, Enum, Float
from uuid import uuid4
from app.core.db_config import Base
from enum import Enum as PyEnum

class UserRole(PyEnum):
    FARMER = "FARMER"
    WORKER = "WORKER"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    phone = Column(String, unique=True, index=True, nullable=False)
    role = Column(Enum(UserRole, name="user_role"), nullable=False)
    latitude = Column(Float, nullable=False)  # Required for location-based features
    longitude = Column(Float, nullable=False)  # Required for location-based features

