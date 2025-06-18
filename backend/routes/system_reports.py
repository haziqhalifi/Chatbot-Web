from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
import jwt
import os
from database import insert_system_report, get_all_system_reports, get_system_report_by_id, update_system_report_status
from utils.chat import verify_api_key

router = APIRouter()

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret")
JWT_ALGORITHM = "HS256"

class SystemReportRequest(BaseModel):
    issue_type: str
    subject: str
    description: str
    timestamp: str  # ISO format string for date and time

class SystemReportStatusUpdate(BaseModel):
    status: str

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

@router.post("/api/system-reports")
def submit_system_report(report: SystemReportRequest, authorization: str = Header(None)):
    """Submit system report (bug report, feature request, etc.)"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        # Create a complete report object with the authenticated user_id
        from types import SimpleNamespace
        complete_report = SimpleNamespace(
            user_id=user_id,
            issue_type=report.issue_type,
            subject=report.subject,
            description=report.description,
            timestamp=report.timestamp
        )
        
        result = insert_system_report(complete_report)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/system-reports")
def get_system_reports(authorization: str = Header(None)):
    """Get all system reports (admin only)"""
    user_id = get_user_id_from_token(authorization)
    
    # TODO: Add admin role check here
    # For now, allow any authenticated user to view reports
    
    try:
        result = get_all_system_reports()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/system-reports/{report_id}")
def get_system_report(report_id: int, authorization: str = Header(None)):
    """Get specific system report by ID"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        report = get_system_report_by_id(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="System report not found")
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/api/system-reports/{report_id}/status")
def update_system_report_status_endpoint(
    report_id: int, 
    status_update: SystemReportStatusUpdate, 
    authorization: str = Header(None)
):
    """Update the status of a system report (admin only)"""
    user_id = get_user_id_from_token(authorization)
    
    # TODO: Add admin role check here
    # For now, allow any authenticated user to update status
    
    try:
        result = update_system_report_status(report_id, status_update.status)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/system-reports")
def get_admin_system_reports(x_api_key: str = Header(None)):
    """Get all system reports for admin dashboard"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        result = get_all_system_reports()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/system-reports/{report_id}")
def get_admin_system_report(report_id: int, x_api_key: str = Header(None)):
    """Get specific system report by ID for admin"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        report = get_system_report_by_id(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="System report not found")
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/system-reports/{report_id}/status")
def update_admin_system_report_status(
    report_id: int, 
    status_update: SystemReportStatusUpdate, 
    x_api_key: str = Header(None)
):
    """Update the status of a system report (admin only)"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        result = update_system_report_status(report_id, status_update.status)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 