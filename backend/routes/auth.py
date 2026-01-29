from fastapi import APIRouter, HTTPException, Header, Depends, Query, Response
import jwt
import os
from datetime import datetime, timedelta, timezone

# Import from new organized structure
from services.user_service import create_user, verify_user, pwd_context, JWT_SECRET, JWT_ALGORITHM
from utils.auth import google_authenticate
from services.notification_service import create_welcome_notification
from database import get_db_conn

# Import new models and utilities
from models import EmailRequest, AuthRequest, AdminAuthRequest, GoogleAuthRequest, AuthResponse, ForgotPasswordRequest
from utils.security import generate_secure_token
from utils.security import validate_password as validate_password_strength
from utils.email_sender import send_password_reset_email
from utils.admin_verification import send_admin_verification_code, verify_admin_code
from utils.signup_verification import send_signup_verification_code, verify_signup_code, resend_verification_code
from pydantic import BaseModel

router = APIRouter()

# Configuration (imported from user_service to ensure consistency)
GOOGLE_CLIENT_ID = "845615957730-ldlb837mjkqtvigr8d6pt8ruq1qab2jo.apps.googleusercontent.com"


def _get_user_id_from_token(authorization: str) -> int:
    """Extract user_id from Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return int(user_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def _coerce_datetime(value) -> datetime:
    if isinstance(value, datetime):
        return value
    if value is None:
        raise ValueError("expires_at is null")

    text = str(value).strip()

    # SQL Server/pyodbc often returns: 'YYYY-MM-DD HH:MM:SS' or with microseconds
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M:%S.%f"):
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            pass

    # Fallback: ISO-ish parsing (e.g. 'YYYY-MM-DDTHH:MM:SS[.ffffff]')
    try:
        return datetime.fromisoformat(text.replace(" ", "T"))
    except ValueError as e:
        raise ValueError(f"Unrecognized datetime format: {text}") from e

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

@router.post("/send-verification-code")
def send_verification_code(request: EmailRequest):
    """Send verification code to user email for signup"""
    try:
        # Send verification code
        result = send_signup_verification_code(request.email)
        
        if result["success"]:
            return {"message": result["message"]}
        else:
            raise HTTPException(status_code=500, detail=result["message"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send verification code: {str(e)}")

@router.post("/verify-signup-code")
def verify_signup_email(request: EmailRequest, code: str = Query(...)):
    """Verify signup code sent to user email"""
    try:
        # Verify the code
        result = verify_signup_code(request.email, code)
        
        if result["success"]:
            return {"message": result["message"]}
        else:
            raise HTTPException(status_code=400, detail=result["message"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@router.post("/resend-verification-code")
def resend_code(request: EmailRequest):
    """Resend verification code to user email"""
    try:
        # Resend verification code
        result = resend_verification_code(request.email)
        
        if result["success"]:
            return {"message": result["message"]}
        else:
            raise HTTPException(status_code=500, detail=result["message"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resend verification code: {str(e)}")

@router.post("/signin")
def signin(request: AuthRequest, response: Response):
    """Regular user sign in - admins should use /admin/signin"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Check if user is an admin
        cursor.execute("SELECT role FROM users WHERE email = ?", (request.email,))
        user_row = cursor.fetchone()
        
        if user_row and user_row[0] == 'admin':
            raise HTTPException(
                status_code=403, 
                detail="Admin accounts must sign in through the admin portal"
            )
        
        conn.close()
    except HTTPException:
        raise
    except Exception:
        pass  # Continue with normal signin if query fails
    
    result = verify_user(request.email, request.password)
    
    # Set refresh token in HTTP-only cookie (secure for production)
    response.set_cookie(
        key="refresh_token",
        value=result.pop("refresh_token"),  # Remove from response body
        max_age=7*24*60*60,  # 7 days
        httponly=True,  # Not accessible to JavaScript
        secure=True,   # HTTPS only in production
        samesite="Lax"  # CSRF protection
    )
    
    return result

@router.post("/admin/send-verification-code")
def admin_send_verification_code(request: EmailRequest):
    """Send verification code to admin email"""
    # Validate email domain - allow government, education, or personal emails
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
        'college' in email_domain or
        email_domain.endswith('.um.edu.my')
    )
    
    # Check for common personal email domains
    personal_domains = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
        'live.com', 'icloud.com', 'protonmail.com', 'tutanota.com'
    ]
    is_personal = email_domain in personal_domains
    
    # Special case for the admin email u2101028@siswa.um.edu.my
    is_admin_email = request.email.lower() == 'u2101028@siswa.um.edu.my'
    
    if not (is_government or is_education or is_personal or is_admin_email):
        raise HTTPException(
            status_code=401, 
            detail="Admin access requires government, education, or personal email address"
        )
    
    # Verify user exists in database
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email FROM users WHERE email = ?", (request.email,))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found. Please sign up first.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    # Send verification code
    result = send_admin_verification_code(request.email)
    
    if result["success"]:
        return {"message": result["message"]}
    else:
        raise HTTPException(status_code=500, detail=result["message"])

@router.post("/admin/signin")
def admin_signin(request: AdminAuthRequest, response: Response):
    # Validate admin code from database
    verification_result = verify_admin_code(request.email, request.admin_code)
    
    if not verification_result["success"]:
        raise HTTPException(status_code=401, detail=verification_result["message"])
    
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
    
    # Verify user credentials (this will raise HTTPException if invalid or account is suspended/blocked)
    try:
        user_result = verify_user(request.email, request.password)
    except HTTPException as e:
        # Re-raise the exception with the original message (suspended/blocked/invalid credentials)
        raise e
    
    # Check if user has admin role
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT role FROM users WHERE email = ?", (request.email,))
        user_row = cursor.fetchone()
        
        if user_row and user_row[0] != 'admin':
            # Promote user to admin role since they verified with admin code
            cursor.execute("UPDATE users SET role = 'admin' WHERE email = ?", (request.email,))
            conn.commit()
        
        conn.close()
    except Exception as e:
        print(f"Error updating admin role: {e}")
    
    # Add admin role to user data
    user_result["user"]["role"] = "admin"
    
    # Set refresh token in HTTP-only cookie (secure for production)
    response.set_cookie(
        key="refresh_token",
        value=user_result.pop("refresh_token"),  # Remove from response body
        max_age=7*24*60*60,  # 7 days
        httponly=True,  # Not accessible to JavaScript
        secure=True,   # HTTPS only in production
        samesite="Lax"  # CSRF protection
    )
    
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
    conn = None
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
        expires_at = (datetime.now(timezone.utc) + timedelta(hours=1)).strftime('%Y-%m-%d %H:%M:%S')
        # Store token
        cursor.execute("""
            INSERT INTO password_reset_tokens (user_id, token, expires_at, used)
            VALUES (?, ?, ?, 0)
        """, (user_id, token, expires_at))
        conn.commit()
        # Log the reset link (simulate email)
        frontend_base_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:4028")
        reset_link = f"{frontend_base_url}/reset-password?token={token}"
        # Prefer real email if SMTP is configured; otherwise log link for dev.
        if os.getenv("SMTP_HOST"):
            try:
                send_password_reset_email(to_email=email, reset_link=reset_link)
                print(f"[FORGOT PASSWORD] Reset email sent to: {email}")
            except Exception as e:
                print(f"[FORGOT PASSWORD] Email send failed: {e}")
                print(f"[FORGOT PASSWORD] Fallback link: {reset_link}")
        else:
            print(f"[FORGOT PASSWORD] Send this link to user: {reset_link}")
        return {"message": "If the email exists, a reset link has been sent."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn is not None:
            try:
                conn.close()
            except Exception:
                pass

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest):
    token = request.token
    new_password = request.new_password
    conn = None
    try:
        validation = validate_password_strength(new_password)
        if not validation.get("valid", False):
            raise HTTPException(status_code=400, detail="; ".join(validation.get("errors", [])) or "Invalid password")

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
        if bool(used):
            raise HTTPException(status_code=400, detail="Token already used.")
        expires_at_dt = _coerce_datetime(expires_at)
        if datetime.now(timezone.utc) > expires_at_dt:
            raise HTTPException(status_code=400, detail="Token expired.")
        # Update password
        hashed = pwd_context.hash(new_password)
        cursor.execute("UPDATE users SET hashed_password = ? WHERE id = ?", (hashed, user_id))
        # Mark token as used
        cursor.execute("UPDATE password_reset_tokens SET used = 1 WHERE token = ?", (token,))
        conn.commit()
        return {"message": "Password has been reset successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn is not None:
            try:
                conn.close()
            except Exception:
                pass


@router.post("/change-password")
def change_password(request: ChangePasswordRequest, authorization: str = Header(None)):
    """Change password for authenticated (local) users."""
    user_id = _get_user_id_from_token(authorization)

    validation = validate_password_strength(request.new_password)
    if not validation.get("valid", False):
        raise HTTPException(
            status_code=400,
            detail="; ".join(validation.get("errors", [])) or "Invalid password",
        )

    conn = None
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT hashed_password, auth_provider FROM users WHERE id = ?",
            (user_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")

        hashed_password, auth_provider = row
        if auth_provider and str(auth_provider).lower() != "local":
            raise HTTPException(
                status_code=400,
                detail="Password change is not available for this login method.",
            )

        if not hashed_password:
            raise HTTPException(
                status_code=400,
                detail="No password is set for this account.",
            )

        if not pwd_context.verify(request.current_password, hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")

        new_hashed = pwd_context.hash(request.new_password)
        cursor.execute(
            "UPDATE users SET hashed_password = ?, updated_at = GETDATE() WHERE id = ?",
            (new_hashed, user_id),
        )
        conn.commit()
        return {"message": "Password changed successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn is not None:
            try:
                conn.close()
            except Exception:
                pass
