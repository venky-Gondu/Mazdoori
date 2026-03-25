import random
import time
import os
import requests
from dotenv import load_dotenv

load_dotenv()

TEXTBEE_API_KEY = os.getenv("TEXTBEE_API_KEY")
TEXTBEE_DEVICE_ID = os.getenv("TEXTBEE_DEVICE_ID")

# OTP store (in-memory)
OTP_STORE = {}
OTP_LENGTH = 6
OTP_EXPIRY_SECONDS = 300  # 5 minutes

def generateotp() -> str: 
    """Generate a random 6-digit OTP."""
    return str(random.randint(100000, 999999))

def sendotp(phonenumber: str) -> str:
    """Generate and send OTP to phone using TextBee Android Gateway."""
    otp = generateotp()
    expire = time.time() + OTP_EXPIRY_SECONDS
    OTP_STORE[phonenumber] = (otp, expire)

    if not TEXTBEE_API_KEY or not TEXTBEE_DEVICE_ID:
        print("TextBee credentials missing in .env")
        return "failed"


    formatted_phone = phonenumber.strip()

    BASE_URL = 'https://api.textbee.dev/api/v1'
    url = f"{BASE_URL}/gateway/devices/{TEXTBEE_DEVICE_ID}/send-sms"
    
    payload = {
        "recipients": [formatted_phone],
        "message": f"Your OTP is {otp}. It is valid for 5 minutes."
    }
    
    headers = {
        "x-api-key": TEXTBEE_API_KEY
    }

    try:
        print(f"Sending OTP to {formatted_phone} via TextBee...")
        response = requests.post(url, json=payload, headers=headers)
        
        # TextBee returns 201 Created for successfully queued messages
        if response.status_code not in [200, 201]:
            print(f"TextBee Error {response.status_code}: {response.text}")
            return "failed"
        
        response_data = response.json()
        # Check success in payload as well
        if response_data.get("data", {}).get("success") or response_data.get("success"):
            print(f"TextBee Response: {response_data}")
            print(f"OTP sent via TextBee to {formatted_phone}")
            return "success"
        else:
            print(f"TextBee Queue Failure: {response_data}")
            return "failed"
            
    except Exception as e:
        print(f"Failed to send OTP via TextBee: {e}")
        return "failed"

def verify(phone: str, otp: str) -> str:
    """Verify if OTP is correct and not expired."""
    if phone not in OTP_STORE:
        return "otp not found"
    
    stored_otp, expiry = OTP_STORE[phone]
    
    if time.time() > expiry:
        del OTP_STORE[phone]
        return "otp expired"
    
    if stored_otp != otp:
        return "otp incorrect"
    
    del OTP_STORE[phone]
    return "otp valid"
