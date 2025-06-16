from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
import jwt
import os
from database import insert_report, get_all_reports, get_report_by_id
from chat_utils import verify_api_key
from notifications import create_report_confirmation_notification
from subscriptions import create_targeted_disaster_notification

router = APIRouter()

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret")
JWT_ALGORITHM = "HS256"

class ReportRequest(BaseModel):
    user_id: int
    title: str
    location: str
    disaster_type: str
    description: str
    timestamp: str  # ISO format string for date and time

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

@router.post("/report")
def submit_report(report: ReportRequest, x_api_key: str = Header(None)):
    """Submit disaster report with notification"""
    from main import API_KEY_CREDITS  # Import from main to avoid circular imports
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        result = insert_report(report)
        
        # Create confirmation notification for the reporter
        create_report_confirmation_notification(report.user_id, report.title)
        
        # Create targeted notifications for subscribed users
        try:
            create_targeted_disaster_notification(
                disaster_type=report.disaster_type,
                location=report.location,
                title=f"Disaster Report: {report.disaster_type}",
                message=f"A {report.disaster_type} has been reported in {report.location}. {report.title}",
                notification_type="warning"
            )
        except Exception as e:
            print(f"Failed to send targeted notifications: {e}")
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/reports")
def get_reports(x_api_key: str = Header(None)):
    """Get all disaster reports for admin dashboard"""
    from main import API_KEY_CREDITS  # Import from main to avoid circular imports
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        result = get_all_reports()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/reports/{report_id}")
def get_report(report_id: int, x_api_key: str = Header(None)):
    """Get specific disaster report by ID"""
    from main import API_KEY_CREDITS  # Import from main to avoid circular imports
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        report = get_report_by_id(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
