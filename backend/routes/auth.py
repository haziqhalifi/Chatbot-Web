from fastapi import APIRouter, HTTPException, Header, Depends
import jwt
import os
from datetime import datetime, timedelta

# Import from new organized structure
from services.user_service import create_user, verify_user, pwd_context
from utils.auth import google_authenticate
from services.notification_service import create_welcome_notification
from database import get_db_conn

# Import new models and utilities
from models import AuthRequest, AdminAuthRequest, GoogleAuthRequest, AuthResponse, ForgotPasswordRequest
from utils.security import generate_secure_token
from pydantic import BaseModel

router = APIRouter()

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
    
    if request.admin_code not in valid_admin_codes:
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

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest):
    email = request.email
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        user_row = cursor.fetchone()
        if not user_row:
            # Always return success to avoid leaking user existence
            return {"message": "If the email exists, a reset link has been sent."}
        user_id = user_row[0]
        # Generate token and expiry
        token = generate_secure_token(48)
        expires_at = (datetime.utcnow() + timedelta(hours=1)).strftime('%Y-%m-%d %H:%M:%S')
        # Store token
        cursor.execute("""
            INSERT INTO password_reset_tokens (user_id, token, expires_at, used)
            VALUES (?, ?, ?, 0)
        """, (user_id, token, expires_at))
        conn.commit()
        # Log the reset link (simulate email)
        reset_link = f"http://localhost:4028/reset-password?token={token}"
        print(f"[FORGOT PASSWORD] Send this link to user: {reset_link}")
        return {"message": "If the email exists, a reset link has been sent."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            conn.close()
        except:
            pass

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest):
    token = request.token
    new_password = request.new_password
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        # Find token
        cursor.execute("""
            SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = ?
        """, (token,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="Invalid or expired token.")
        user_id, expires_at, used = row
        if used:
            raise HTTPException(status_code=400, detail="Token already used.")
        if datetime.utcnow() > datetime.strptime(str(expires_at), '%Y-%m-%d %H:%M:%S'):
            raise HTTPException(status_code=400, detail="Token expired.")
        # Update password
        hashed = pwd_context.hash(new_password)
        cursor.execute("UPDATE users SET hashed_password = ? WHERE id = ?", (hashed, user_id))
        # Mark token as used
        cursor.execute("UPDATE password_reset_tokens SET used = 1 WHERE token = ?", (token,))
        conn.commit()
        return {"message": "Password has been reset successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            conn.close()
        except:
            pass
