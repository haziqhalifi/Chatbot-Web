from fastapi import APIRouter, HTTPException, Header
from notifications import create_notification
from .utils import get_user_id_from_token
import os

router = APIRouter()

@router.get("/dev/api-key")
def get_api_key_info():
    """Get API key information for development (should be removed in production)"""
    if os.getenv("ENVIRONMENT", "development") == "production":
        raise HTTPException(status_code=404, detail="Not found")
    
    return {
        "api_key": os.getenv("API_KEY", "not_set"),
        "note": "This endpoint should only be used in development mode",
        "env_file": "backend/.env",
        "usage": "Use this key in the X-API-KEY header for admin endpoints"
    }

@router.post("/dev/test-enhanced-notification")
def test_enhanced_notification(authorization: str = Header(None)):
    """Test the enhanced notification system (development only)"""
    if os.getenv("ENVIRONMENT", "development") == "production":
        raise HTTPException(status_code=404, detail="Not found")
    
    user_id = get_user_id_from_token(authorization)
    
    # Create a test notification with disaster type and location
    result = create_notification(
        user_id=user_id,
        title="Test Enhanced Notification",
        message="This is a test notification with disaster type and location information.",
        notification_type="info",
        disaster_type="Flood",
        location="Kuala Lumpur"
    )
    
    return {
        "message": "Enhanced notification created successfully",
        "notification": result,
        "note": "Check your notifications to see the disaster type and location tags"
    }
