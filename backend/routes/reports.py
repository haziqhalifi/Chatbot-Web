from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
import jwt
import os
from database import insert_report, get_all_reports, get_report_by_id, get_db_conn, insert_system_report, migrate_reports_tables, get_all_system_reports
from utils.chat import verify_api_key
from services.notification_service import create_report_confirmation_notification
from services.subscription_service import create_targeted_disaster_notification
from datetime import datetime
import json

from services.nadma_service import nadma_service

router = APIRouter()

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret")
JWT_ALGORITHM = "HS256"

class ReportRequest(BaseModel):
    title: str
    location: str
    disaster_type: str
    description: str
    created_at: Optional[str] = None

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
            created_at=report.created_at if report.created_at else datetime.now().strftime('%Y-%m-%d %H:%M:%S')
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
def get_reports(
    source: str = "all",
    q: Optional[str] = None,
    nadma_limit: int = 200,
    x_api_key: str = Header(None),
):
    """Get disaster reports for admin dashboard.

    Supports user-submitted disaster reports and NADMA realtime disasters.

    Query params:
      - source: all | disaster | nadma
      - q: free-text search across title/location/type/description/reporter
      - nadma_limit: max NADMA records to include
    """
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        normalized_source = (source or "all").strip().lower()
        if normalized_source not in {"all", "disaster", "nadma"}:
            raise HTTPException(status_code=400, detail="Invalid source. Use: all, disaster, nadma")

        reports: List[dict] = []

        if normalized_source in {"all", "disaster"}:
            user_reports = get_all_reports().get("reports", [])
            for report in user_reports:
                report["source"] = "Disaster Report"
            reports.extend(user_reports)

        if normalized_source in {"all", "nadma"}:
            nadma_disasters = nadma_service.get_disasters(status=None, limit=nadma_limit, from_database=True)
            reports.extend([_nadma_disaster_to_admin_report(d) for d in nadma_disasters])

        if q:
            needle = q.strip().lower()
            if needle:
                reports = [r for r in reports if _matches_report_query(r, needle)]

        # Keep newest first if timestamps are present
        def _sort_key(r: dict):
            return r.get("timestamp") or ""

        reports.sort(key=_sort_key, reverse=True)

        return {"reports": reports}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _matches_report_query(report: dict, needle: str) -> bool:
    haystacks = [
        str(report.get("title", "")),
        str(report.get("location", "")),
        str(report.get("type", "")),
        str(report.get("description", "")),
        str(report.get("reportedBy", "")),
        str(report.get("source", "")),
    ]
    combined = " ".join(haystacks).lower()
    return needle in combined


def _nadma_disaster_to_admin_report(disaster: dict) -> dict:
    raw = {}
    raw_data = disaster.get("raw_data")
    if raw_data:
        try:
            raw = json.loads(raw_data) if isinstance(raw_data, str) else (raw_data or {})
        except Exception:
            raw = {}

    kategori_name = None
    try:
        kategori_name = (raw.get("kategori") or {}).get("name")
    except Exception:
        kategori_name = None

    district_name = None
    state_name = None
    try:
        district_name = (raw.get("district") or {}).get("name")
        state_name = (raw.get("state") or {}).get("name")
    except Exception:
        district_name = None
        state_name = None

    location_parts = [p for p in [district_name, state_name] if p]
    location = ", ".join(location_parts) if location_parts else "Unknown"

    nadma_status = disaster.get("status")
    status_map = {
        "aktif": "Active",
        "selesai": "Resolved",
    }
    status_normalized = status_map.get(str(nadma_status or "").strip().lower(), "Active")

    bencana_khas = str(disaster.get("bencana_khas") or "").strip().lower()
    severity = "High" if bencana_khas == "ya" else "Medium"

    latitude = disaster.get("latitude")
    longitude = disaster.get("longitude")
    coordinates = ""
    if latitude is not None and longitude is not None:
        coordinates = f"{latitude}, {longitude}"

    title = disaster.get("name") or (f"NADMA Realtime: {kategori_name}" if kategori_name else None) or "NADMA Realtime Disaster"

    description = (
        disaster.get("description")
        or disaster.get("special_report")
        or ""
    )

    timestamp = disaster.get("datetime_start") or disaster.get("created_at") or disaster.get("last_synced_at")

    return {
        "id": f"nadma:{disaster.get('id')}",
        "title": title,
        "location": location,
        "type": kategori_name or "NADMA",
        "description": description,
        "timestamp": timestamp,
        "user_id": None,
        "reportedBy": "NADMA MyDIMS",
        "reporterEmail": "",
        "reporterPhone": "",
        "severity": severity,
        "status": status_normalized,
        "coordinates": coordinates,
        "affectedPeople": 0,
        "estimatedDamage": "Unknown",
        "responseTeam": "NADMA",
        "images": [],
        "updates": [],
        "source": "NADMA Realtime",
        "nadma_id": disaster.get("id"),
    }

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
