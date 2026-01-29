from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List
import jwt
from services.user_service import JWT_SECRET, JWT_ALGORITHM
from services.subscription_service import (
    get_user_subscription, create_or_update_subscription,
    delete_subscription, get_available_disaster_types, get_popular_locations,
    create_subscription_confirmation_notification
)

router = APIRouter()

class SubscriptionRequest(BaseModel):
    disaster_types: List[str] = []  # List of disaster types to subscribe to
    locations: List[str] = []  # List of locations to subscribe to
    notification_methods: List[str] = ["web"]  # web, email, sms (future)
    radius_km: int = 10  # Alert radius in kilometers
    is_active: bool = True  # Enable or disable notifications

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

@router.get("/subscriptions")
def get_user_subscription_preferences(authorization: str = Header(None)):
    """Get user's notification subscription preferences"""
    user_id = get_user_id_from_token(authorization)
    return get_user_subscription(user_id)

@router.post("/subscriptions")
def create_or_update_user_subscription(
    request: SubscriptionRequest,
    authorization: str = Header(None)
):
    """Create or update user's notification subscription preferences"""
    user_id = get_user_id_from_token(authorization)
    result = create_or_update_subscription(
        user_id, 
        request.disaster_types, 
        request.locations, 
        request.notification_methods, 
        request.radius_km,
        request.is_active
    )
    
    # Create confirmation notification
    create_subscription_confirmation_notification(
        user_id, 
        request.disaster_types, 
        request.locations
    )
    
    return result

@router.delete("/subscriptions")
def delete_user_subscription(authorization: str = Header(None)):
    """Delete user's notification subscription"""
    user_id = get_user_id_from_token(authorization)
    return delete_subscription(user_id)

@router.get("/subscriptions/disaster-types")
def get_disaster_types():
    """Get available disaster types for subscription"""
    return {"disaster_types": get_available_disaster_types()}

@router.get("/subscriptions/locations")
def get_locations():
    """Get popular locations for subscription"""
    return {"locations": get_popular_locations()}
