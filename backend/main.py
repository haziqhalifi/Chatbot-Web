from fastapi import FastAPI, HTTPException, Depends, Header, UploadFile, File
from typing import Annotated, Optional, List, List
from fastapi.middleware.cors import CORSMiddleware
import ollama
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
import jwt
from datetime import datetime, timedelta
import openai
import whisper
from database import get_db_conn, update_database_schema, get_all_reports, get_report_by_id, get_admin_dashboard_stats, get_system_status  # Import the database connection helper
from users import create_user, verify_user, get_or_create_google_user, get_user_profile, update_user_profile
from chat_utils import verify_api_key, generate_response, transcribe_audio_file
from auth_utils import google_authenticate  # Import the Google authentication logic
from rag_utils import initialize_rag
from performance_utils import get_performance_stats
from notifications import (
    create_notification, get_user_notifications, get_unread_count,
    mark_notification_as_read, mark_all_notifications_as_read,
    delete_notification, clear_all_notifications, create_system_notification,
    create_welcome_notification, create_report_confirmation_notification
)
from subscriptions import (
    create_subscriptions_table, get_user_subscription, create_or_update_subscription,
    delete_subscription, get_available_disaster_types, get_popular_locations,
    create_targeted_disaster_notification, create_subscription_confirmation_notification
)

# --- RECOMMENDED MODELS FOR MALAY LANGUAGE ---
# For better Malay language support, consider using these models with Ollama:
# 1. qwen2.5:7b (Currently configured - Excellent for Malay and English)
# 2. ollama pull aya:8b or aya:35b (Multilingual, excellent for Malay)
# 3. ollama pull gemma2:9b (Better multilingual capabilities)
# 
# Current model: "qwen2.5:7b" (Excellent Malay and English support)
# To change the model, update the model name in chat_utils.py generate_response function

load_dotenv()

API_KEY_CREDITS = {os.getenv("API_KEY"): 100}
print(API_KEY_CREDITS)

# Initialize database updates
update_database_schema()

# Initialize subscription tables
from subscriptions import create_subscriptions_table
create_subscriptions_table()

# Initialize RAG system
print("Initializing RAG system...")
try:
    initialize_rag()
    print("RAG system initialized successfully!")
except Exception as e:
    print(f"Warning: RAG system initialization failed: {str(e)}")
    print("The application will continue without RAG functionality.")

app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:4028",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic models for request bodies ---
class AuthRequest(BaseModel):
    email: str
    password: str

class AdminAuthRequest(BaseModel):
    email: str
    password: str
    adminCode: str

class PromptRequest(BaseModel):
    prompt: str
    rag_enabled: bool = True  # Default to True for backward compatibility

class GoogleAuthRequest(BaseModel):
    credential: str

class ReportRequest(BaseModel):
    user_id: int
    title: str
    location: str
    disaster_type: str
    description: str
    timestamp: str  # ISO format string for date and time

class UserProfileRequest(BaseModel):
    name: str
    language: str = "English"
    phone: str = ""
    address: str = ""
    city: str = ""
    country: str = ""
    timezone: str = ""

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

class SubscriptionRequest(BaseModel):
    disaster_types: List[str] = []  # List of disaster types to subscribe to
    locations: List[str] = []  # List of locations to subscribe to
    notification_methods: List[str] = ["web"]  # web, email, sms (future)
    radius_km: int = 10  # Alert radius in kilometers

class TargetedNotificationRequest(BaseModel):
    disaster_type: str
    location: str
    title: str
    message: str
    type: str = "warning"

# --- SIGN UP ---
@app.post("/signup")
def signup(request: AuthRequest):
    result = create_user(request.email, request.password)
    
    # Get the user ID to create welcome notification
    try:
        from database import get_db_conn
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (request.email,))
        user_row = cursor.fetchone()
        if user_row:
            create_welcome_notification(user_row[0])
        conn.close()
    except Exception as e:
        print(f"Failed to create welcome notification: {e}")
    
    return result

# --- SIGN IN ---
@app.post("/signin")
def signin(request: AuthRequest):
    return verify_user(request.email, request.password)

# --- ADMIN SIGN IN ---
@app.post("/admin/signin")
def admin_signin(request: AdminAuthRequest):
    # Validate admin code (in production, this should be stored securely)
    valid_admin_codes = ["ADMIN123", "EMRG2024", "DSTWCH01"]  # Example admin codes
    
    if request.adminCode not in valid_admin_codes:
        raise HTTPException(status_code=401, detail="Invalid admin verification code")
      # Validate admin email domain - allow government, education, or personal emails
    email_domain = request.email.split("@")[1].lower() if "@" in request.email else ""
    
    # Check for government domains
    is_government = (
        email_domain.endswith('.gov') or 
        email_domain.endswith('.gov.my') or
        email_domain.endswith('.mil') or
        'government' in email_domain or
        'emergency' in email_domain or
        'disaster' in email_domain
    )
    
    # Check for education domains
    is_education = (
        email_domain.endswith('.edu') or
        email_domain.endswith('.edu.my') or
        email_domain.endswith('.ac.my') or
        'university' in email_domain or
        'college' in email_domain
    )
    
    # Check for common personal email domains
    personal_domains = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
        'live.com', 'icloud.com', 'protonmail.com', 'tutanota.com'
    ]
    is_personal = email_domain in personal_domains
    
    if not (is_government or is_education or is_personal):
        raise HTTPException(
            status_code=401, 
            detail="Admin access requires government, education, or personal email address"
        )
      # Verify user credentials (this will raise HTTPException if invalid)
    try:
        user_result = verify_user(request.email, request.password)
    except HTTPException as e:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    # Add admin role to user data
    user_result["user"]["role"] = "admin"
    
    return user_result

# --- GOOGLE AUTHENTICATION ---
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret")
JWT_ALGORITHM = "HS256"
GOOGLE_CLIENT_ID = "845615957730-ldlb837mjkqtvigr8d6pt8ruq1qab2jo.apps.googleusercontent.com"

@app.post("/google-auth")
def google_auth(data: GoogleAuthRequest):
    return google_authenticate(
        credential=data.credential,
        client_id=GOOGLE_CLIENT_ID,
        jwt_secret=JWT_SECRET,
        jwt_algorithm=JWT_ALGORITHM
    )

# --- API KEY & OLLAMA ENDPOINTS (unchanged) ---
@app.post("/generate")
def generate(request: PromptRequest, x_api_key: str = Header(None)):
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    return generate_response(request, x_api_key, API_KEY_CREDITS)

@app.post("/transcribe")
def transcribe_audio(file: UploadFile = File(...)):
    return transcribe_audio_file(file)

@app.post("/report")
def submit_report(report: ReportRequest, x_api_key: str = Header(None)):
    """Submit disaster report with notification"""
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        from database import insert_report
        result = insert_report(report)
        
        # Create confirmation notification for the reporter
        create_report_confirmation_notification(report.user_id, report.title)
        
        # Create targeted notifications for subscribed users
        try:
            from subscriptions import create_targeted_disaster_notification
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

# --- GET REPORTS ---
@app.get("/admin/reports")
def get_reports(x_api_key: str = Header(None)):
    """Get all disaster reports for admin dashboard"""
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        result = get_all_reports()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/reports/{report_id}")
def get_report(report_id: int, x_api_key: str = Header(None)):
    """Get specific disaster report by ID"""
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        report = get_report_by_id(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- USER PROFILE ENDPOINTS ---
@app.get("/profile")
def get_profile(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return get_user_profile(user_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.put("/profile")
def update_profile(request: UserProfileRequest, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return update_user_profile(user_id, request.name, request.language, request.phone, request.address, request.city, request.country, request.timezone)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- RAG MANAGEMENT ENDPOINTS ---
@app.post("/rebuild-rag")
def rebuild_rag(x_api_key: str = Header(None)):
    """Rebuild RAG embeddings (requires API key)"""
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        from rag_utils import get_rag_system
        rag = get_rag_system()
        rag.initialize_or_update(force_rebuild=True)
        return {"message": "RAG embeddings rebuilt successfully", "documents_count": len(rag.documents)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to rebuild RAG: {str(e)}")

@app.get("/rag-status")
def get_rag_status(x_api_key: str = Header(None)):
    """Get RAG system status (requires API key)"""
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        from rag_utils import get_rag_system
        rag = get_rag_system()
        
        return {
            "documents_count": len(rag.documents) if rag.documents else 0,
            "embeddings_loaded": rag.embeddings is not None,
            "documents_path": rag.documents_path,
            "available_files": [f for f in os.listdir(rag.documents_path) if f.endswith('.pdf')] if os.path.exists(rag.documents_path) else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get RAG status: {str(e)}")

@app.get("/performance")
def get_performance_metrics(x_api_key: str = Header(None)):
    """Get performance metrics (requires API key)"""
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    return get_performance_stats()

# --- NOTIFICATION ENDPOINTS ---

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

@app.get("/notifications")
def get_notifications(
    authorization: str = Header(None),
    limit: int = 50,
    offset: int = 0,
    unread_only: bool = False
):
    """Get notifications for the authenticated user"""
    user_id = get_user_id_from_token(authorization)
    return get_user_notifications(user_id, limit, offset, unread_only)

@app.get("/notifications/unread-count")
def get_notifications_unread_count(authorization: str = Header(None)):
    """Get count of unread notifications for the authenticated user"""
    user_id = get_user_id_from_token(authorization)
    count = get_unread_count(user_id)
    return {"unread_count": count}

@app.post("/notifications")
def create_user_notification(
    request: NotificationRequest,
    authorization: str = Header(None)
):
    """Create a notification for the authenticated user"""
    user_id = get_user_id_from_token(authorization)
    return create_notification(user_id, request.title, request.message, request.type, 
                             request.disaster_type, request.location)

@app.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    authorization: str = Header(None)
):
    """Mark a specific notification as read"""
    user_id = get_user_id_from_token(authorization)
    return mark_notification_as_read(notification_id, user_id)

@app.put("/notifications/mark-all-read")
def mark_all_notifications_read(authorization: str = Header(None)):
    """Mark all notifications as read for the authenticated user"""
    user_id = get_user_id_from_token(authorization)
    return mark_all_notifications_as_read(user_id)

@app.delete("/notifications/{notification_id}")
def delete_user_notification(
    notification_id: int,
    authorization: str = Header(None)
):
    """Delete a specific notification"""
    user_id = get_user_id_from_token(authorization)
    return delete_notification(notification_id, user_id)

@app.delete("/notifications")
def clear_all_user_notifications(authorization: str = Header(None)):
    """Clear all notifications for the authenticated user"""
    user_id = get_user_id_from_token(authorization)
    return clear_all_notifications(user_id)

# --- ADMIN NOTIFICATION ENDPOINTS ---
@app.post("/admin/notifications/system")
def create_admin_system_notification(
    request: SystemNotificationRequest,
    x_api_key: str = Header(None)
):
    """Create system notifications (admin only - requires API key)"""
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    return create_system_notification(request.title, request.message, request.type, request.user_ids)

@app.post("/admin/notifications/targeted")
def create_admin_targeted_notification(
    request: TargetedNotificationRequest,
    x_api_key: str = Header(None)
):
    """Create targeted notifications based on disaster type and location (admin only)"""
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    return create_targeted_disaster_notification(
        request.disaster_type, 
        request.location, 
        request.title, 
        request.message, 
        request.type
    )

# --- SUBSCRIPTION ENDPOINTS ---
@app.get("/subscriptions")
def get_user_subscription_preferences(authorization: str = Header(None)):
    """Get user's notification subscription preferences"""
    user_id = get_user_id_from_token(authorization)
    return get_user_subscription(user_id)

@app.post("/subscriptions")
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
        request.radius_km
    )
    
    # Create confirmation notification
    create_subscription_confirmation_notification(
        user_id, 
        request.disaster_types, 
        request.locations
    )
    
    return result

@app.delete("/subscriptions")
def delete_user_subscription(authorization: str = Header(None)):
    """Delete user's notification subscription"""
    user_id = get_user_id_from_token(authorization)
    return delete_subscription(user_id)

@app.get("/subscriptions/disaster-types")
def get_disaster_types():
    """Get available disaster types for subscription"""
    return {"disaster_types": get_available_disaster_types()}

@app.get("/subscriptions/locations")
def get_locations():
    """Get popular locations for subscription"""
    return {"locations": get_popular_locations()}

# --- DEVELOPMENT ENDPOINTS ---
@app.get("/dev/api-key")
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

@app.post("/dev/test-enhanced-notification")
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

@app.get("/admin/dashboard/stats")
def get_dashboard_stats(x_api_key: str = Header(None)):
    """Get dashboard statistics for admin dashboard"""
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        stats = get_admin_dashboard_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/system/status")
def get_admin_system_status(x_api_key: str = Header(None)):
    """Get system status for admin dashboard"""
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        status = get_system_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))