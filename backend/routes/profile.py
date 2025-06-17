from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
import jwt
import os
from services.user_service import get_user_profile, update_user_profile

router = APIRouter()

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret")
JWT_ALGORITHM = "HS256"

class UserProfileRequest(BaseModel):
    name: str
    language: str = "English"
    phone: str = ""
    address: str = ""
    city: str = ""
    country: str = ""
    timezone: str = ""

def get_user_id_from_token(authorization: str):
    """Helper function to extract user_id from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/profile")
def get_profile(authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)
    return get_user_profile(user_id)

@router.put("/profile")
def update_profile(request: UserProfileRequest, authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)
    return update_user_profile(
        user_id, request.name, request.language, request.phone, 
        request.address, request.city, request.country, request.timezone
    )
