from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session

from app.core.db_config import get_db
from app.utils.otp_service import sendotp,verify
from app.utils.jwt_Handler import create_access_token
from app.schemas.user import PhoneRequest, UserRole, OTPRegisterRequest, UserOut, UserLoginResponse
from app.models.user import User

router=APIRouter(prefix='/userauth',tags=['userauth'])

def get_redirect_path(role: UserRole) -> str:
    """Helper function to determine redirect path based on user role."""
    return "farmer_home" if role == UserRole.FARMER else "worker_home"

@router.post("/check_phone", response_model=UserLoginResponse | dict)
def check_phone(req: PhoneRequest, db: Session = Depends(get_db)):
    """
    Step 1: Check if phone exists in database.
    - If exists: Return login token with redirect info
    - If new: Send OTP for registration
    """
    print(f"Checking phone: {req.phone}")
    user = db.query(User).filter(User.phone == req.phone).first()
    
    if user:
        # Existing user - return login token with redirect info
        print(f"Existing user found for {req.phone} (Role: {user.role.value})")
        token = create_access_token({"sub": str(user.id), "role": user.role.value})
        return {
            "message": "Existing user login",
            "access_token": token,
            "redirect_to": get_redirect_path(user.role),
            "user": UserOut.model_validate(user)
        }
    
    # New user - send OTP
    print(f"New user detected for {req.phone}, sending OTP...")
    result = sendotp(req.phone)
    print(f"OTP send result: {result}")
    
    if result == "success":
        return {"message": "OTP sent for verification", "phone": req.phone}
    
    raise HTTPException(status_code=500, detail="Failed to send OTP")

@router.post("/verify-register", response_model=UserLoginResponse)
def verify_register(req: OTPRegisterRequest, db: Session = Depends(get_db)):
    """
    Step 2: Verify OTP and register new user.
    - Verifies OTP first (rejects if invalid)
    - Creates user only after successful OTP verification
    - Requires latitude and longitude (captured automatically by frontend)
    - Returns token with redirect info
    """
    print(f"Verifying OTP for {req.phone}...")
    
    # Step 1: Verify OTP FIRST (before creating user)
    otp_status = verify(req.phone, req.otp)
    if otp_status != "otp valid":
        print(f"OTP verification failed: {otp_status}")
        raise HTTPException(status_code=400, detail=otp_status)
    
    print(f"OTP verified successfully for {req.phone}")
    
    # Step 2: Check if user already exists (edge case)
    existing_user = db.query(User).filter(User.phone == req.phone).first()
    if existing_user:
        print(f"User already exists for {req.phone}, returning existing user")
        token = create_access_token({"sub": str(existing_user.id), "role": existing_user.role.value})
        return {
            "message": "User already exists",
            "access_token": token,
            "redirect_to": get_redirect_path(existing_user.role),
            "user": UserOut.model_validate(existing_user)
        }
    
    # Step 3: Create new user with required location
    print(f"Creating new user: {req.phone} (Role: {req.role.value}, Location: {req.latitude}, {req.longitude})")
    new_user = User(
        phone=req.phone, 
        role=req.role, 
        latitude=req.latitude, 
        longitude=req.longitude
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    print(f"User created successfully: {new_user.id}")
    
    # Step 4: Generate token and return with redirect info
    token = create_access_token({"sub": str(new_user.id), "role": new_user.role.value})
    return {
        "message": "User registered successfully",
        "access_token": token,
        "redirect_to": get_redirect_path(new_user.role),
        "user": UserOut.model_validate(new_user)
    }

