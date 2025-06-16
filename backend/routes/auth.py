from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
import jwt
import os
from users import create_user, verify_user
from auth_utils import google_authenticate
from notifications import create_welcome_notification
from database import get_db_conn

router = APIRouter()

# Pydantic models
class AuthRequest(BaseModel):
    email: str
    password: str

class AdminAuthRequest(BaseModel):
    email: str
    password: str
    adminCode: str

class GoogleAuthRequest(BaseModel):
    credential: str

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret")
JWT_ALGORITHM = "HS256"
GOOGLE_CLIENT_ID = "845615957730-ldlb837mjkqtvigr8d6pt8ruq1qab2jo.apps.googleusercontent.com"

@router.post("/signup")
def signup(request: AuthRequest):
    result = create_user(request.email, request.password)
    
    # Get the user ID to create welcome notification
    try:
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

@router.post("/signin")
def signin(request: AuthRequest):
    return verify_user(request.email, request.password)

@router.post("/admin/signin")
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

@router.post("/google-auth")
def google_auth(data: GoogleAuthRequest):
    return google_authenticate(
        credential=data.credential,
        client_id=GOOGLE_CLIENT_ID,
        jwt_secret=JWT_SECRET,
        jwt_algorithm=JWT_ALGORITHM
    )
