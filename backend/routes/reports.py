from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
import jwt
import os
from database import insert_report, get_all_reports, get_report_by_id, get_db_conn, insert_system_report, migrate_reports_tables, get_all_system_reports
from utils.chat import verify_api_key
from services.notification_service import create_report_confirmation_notification
from services.subscription_service import create_targeted_disaster_notification

router = APIRouter()

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret")
JWT_ALGORITHM = "HS256"

class ReportRequest(BaseModel):
    title: str
    location: str
    disaster_type: str
    description: str
    timestamp: str  # ISO format string for date and time

class SystemReportRequest(BaseModel):
    subject: str
    message: str

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
def submit_report(report: ReportRequest, authorization: str = Header(None)):
    """Submit disaster report with notification"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        # Create a complete report object with the authenticated user_id
        from types import SimpleNamespace
        complete_report = SimpleNamespace(
            user_id=user_id,
            title=report.title,
            location=report.location,
            disaster_type=report.disaster_type,
            description=report.description,
            created_at=report.timestamp
        )
        
        result = insert_report(complete_report)
        
        # Create confirmation notification for the reporter
        create_report_confirmation_notification(user_id, report.title)
        
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

@router.post("/system-report")
def submit_system_report(report: SystemReportRequest, authorization: str = Header(None)):
    """Submit system issue/bug report"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        result = insert_system_report(user_id, report.subject, report.message)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/reports")
def get_reports(x_api_key: str = Header(None)):
    """Get all disaster reports for admin dashboard"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        result = get_all_reports()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/reports/{report_id}")
def get_report(report_id: int, x_api_key: str = Header(None)):
    """Get specific disaster report by ID"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        report = get_report_by_id(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/migrate-database")
def migrate_database(x_api_key: str = Header(None)):
    """Migrate database tables - rename reports to disaster_reports and create system_reports"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        success = migrate_reports_tables()
        if success:
            return {"message": "Database migration completed successfully", "status": "success"}
        else:
            raise HTTPException(status_code=500, detail="Migration failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/system-reports")
def get_system_reports(x_api_key: str = Header(None)):
    """Get all system reports for admin dashboard"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        result = get_all_system_reports()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
