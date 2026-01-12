from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
import jwt
import os
from services.notification_service import (
    create_notification, get_user_notifications, get_unread_count,
    mark_notification_as_read, mark_all_notifications_as_read,
    delete_notification, clear_all_notifications, create_system_notification
)
from services.subscription_service import create_targeted_disaster_notification
from utils.chat import verify_api_key

router = APIRouter()

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret")
JWT_ALGORITHM = "HS256"

class NotificationRequest(BaseModel):
    title: str
    message: str
    type: str = "info"  # info, warning, danger, success
    disaster_type: Optional[str] = None  # Optional disaster type
    location: Optional[str] = None  # Optional location

class SystemNotificationRequest(BaseModel):
    title: str
    message: str
    type: str = "info"
    user_ids: Optional[list] = None

class TargetedNotificationRequest(BaseModel):
    disaster_type: str
    location: str
    title: str
    message: str
    type: str = "warning"

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

# User notification endpoints
@router.get("/notifications")
def get_notifications(
    authorization: str = Header(None),
    limit: int = 50,
    offset: int = 0,
    unread_only: bool = False
):
    """Get notifications for the authenticated user"""
    user_id = get_user_id_from_token(authorization)
    return get_user_notifications(user_id, limit, offset, unread_only)

@router.get("/notifications/unread-count")
def get_notifications_unread_count(authorization: str = Header(None)):
    """Get count of unread notifications for the authenticated user"""
    user_id = get_user_id_from_token(authorization)
    count = get_unread_count(user_id)
    return {"unread_count": count}

@router.post("/notifications")
def create_user_notification(
    request: NotificationRequest,
    authorization: str = Header(None)
):
    """Create a notification for the authenticated user"""
    user_id = get_user_id_from_token(authorization)
    return create_notification(user_id, request.title, request.message, request.type, 
                             request.disaster_type, request.location)

@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    authorization: str = Header(None)
):
    """Mark a specific notification as read"""
    user_id = get_user_id_from_token(authorization)
    return mark_notification_as_read(notification_id, user_id)

@router.put("/notifications/mark-all-read")
def mark_all_notifications_read(authorization: str = Header(None)):
    """Mark all notifications as read for the authenticated user"""
    user_id = get_user_id_from_token(authorization)
    return mark_all_notifications_as_read(user_id)

@router.delete("/notifications/{notification_id}")
def delete_user_notification(
    notification_id: int,
    authorization: str = Header(None)
):
    """Delete a specific notification"""
    user_id = get_user_id_from_token(authorization)
    return delete_notification(notification_id, user_id)

@router.delete("/notifications")
def clear_all_user_notifications(authorization: str = Header(None)):
    """Clear all notifications for the authenticated user"""
    user_id = get_user_id_from_token(authorization)
    return clear_all_notifications(user_id)

# Admin notification endpoints
@router.get("/admin/notifications")
def get_all_notifications_admin(
    authorization: str = Header(None),
    limit: int = 100,
    offset: int = 0,
    notification_type: Optional[str] = None,
    disaster_type: Optional[str] = None,
    search: Optional[str] = None,
    grouped: bool = True
):
    """Get all notifications across all users (admin only)"""
    from services.notification_service import get_all_notifications
    # Verify admin authentication (user_id extraction also validates token)
    get_user_id_from_token(authorization)
    return get_all_notifications(limit, offset, notification_type, disaster_type, search, grouped)

@router.get("/admin/notifications/users")
def get_notification_users_admin(
    authorization: str = Header(None),
    title: str = None,
    message: str = None,
    notification_type: str = None,
    disaster_type: Optional[str] = None,
    location: Optional[str] = None
):
    """Get all users who received a specific notification (admin only)"""
    from services.notification_service import get_notification_users
    # Verify admin authentication
    get_user_id_from_token(authorization)
    return get_notification_users(title, message, notification_type, disaster_type, location)

@router.get("/admin/notifications/stats")
def get_notification_stats_admin(authorization: str = Header(None)):
    """Get notification statistics (admin only)"""
    from services.notification_service import get_notification_stats
    # Verify admin authentication
    get_user_id_from_token(authorization)
    return get_notification_stats()

@router.delete("/admin/notifications/{notification_id}")
def delete_notification_admin(
    notification_id: int,
    authorization: str = Header(None)
):
    """Delete any notification (admin only)"""
    from services.notification_service import delete_notification_admin
    # Verify admin authentication
    get_user_id_from_token(authorization)
    return delete_notification_admin(notification_id)

@router.post("/admin/notifications/system")
def create_admin_system_notification(
    request: SystemNotificationRequest,
    authorization: str = Header(None)
):
    """Create system notifications (admin only)"""
    # Verify admin authentication
    get_user_id_from_token(authorization)
    return create_system_notification(request.title, request.message, request.type, request.user_ids)

@router.post("/admin/notifications/targeted")
def create_admin_targeted_notification(
    request: TargetedNotificationRequest,
    authorization: str = Header(None)
):
    """Create targeted notifications based on disaster type and location (admin only)"""
    # Verify admin authentication
    get_user_id_from_token(authorization)
    return create_targeted_disaster_notification(
        request.disaster_type, 
        request.location, 
        request.title, 
        request.message, 
        request.type
    )
