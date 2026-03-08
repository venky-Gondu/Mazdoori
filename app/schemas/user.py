from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from enum import Enum

class UserRole(str, Enum):
    FARMER = "FARMER"
    WORKER = "WORKER"

# Step 1: Send OTP
class PhoneRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)

# Step 2: Verify OTP
class OTPVerify(BaseModel):
    phone: str
    otp: str

# Step 3: Register with location
class OTPRegisterRequest(BaseModel):
    phone: str
    otp: str
    role: UserRole
    latitude: float = Field(..., description="User's latitude (required)")
    longitude: float = Field(..., description="User's longitude (required)")

# User output schema
class UserOut(BaseModel):
    id: UUID
    phone: str
    name: str | None = None
    role: UserRole | None
    latitude: float  # Required field
    longitude: float  # Required field

    model_config = {
        "from_attributes": True
    }

# Login/Register response with redirect info
class UserLoginResponse(BaseModel):
    message: str
    access_token: str
    redirect_to: str  # "farmer_home" or "worker_home"
    user: UserOut

