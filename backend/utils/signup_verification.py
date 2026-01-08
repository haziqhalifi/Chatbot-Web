"""
User signup verification utilities for email-based verification codes
"""
import os
import random
import string
from datetime import datetime, timedelta
from database import get_db_conn
from utils.email_sender import send_email


def generate_verification_code() -> str:
    """Generate a 6-digit verification code"""
    return ''.join(random.choices(string.digits, k=6))


def _coerce_datetime(value) -> datetime:
    """Convert various datetime formats to datetime object"""
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


def send_signup_verification_code(email: str) -> dict:
    """
    Generate and send a verification code to the user's signup email
    Returns: dict with success status and message
    """
    try:
        # Generate verification code
        code = generate_verification_code()
        
        # Set expiration time (10 minutes from now)
        expires_at = (datetime.utcnow() + timedelta(minutes=10)).strftime('%Y-%m-%d %H:%M:%S')
        
        # Store in database
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Delete any existing unused codes for this email
        cursor.execute("""
            DELETE FROM user_verification_codes 
            WHERE email = ? AND used = 0
        """, (email,))
        
        # Insert new verification code
        cursor.execute("""
            INSERT INTO user_verification_codes (email, code, expires_at, used, attempts)
            VALUES (?, ?, ?, 0, 0)
        """, (email, code, expires_at))
        
        conn.commit()
        conn.close()
        
        # Send email with verification code
        subject = "DisasterWatch Email Verification Code"
        body = f"""
Hello,

Welcome to DisasterWatch! Your email verification code is: {code}

This code will expire in 10 minutes.

If you did not sign up for DisasterWatch, please ignore this email.

Best regards,
DisasterWatch Team
        """
        
        # Check if SMTP is configured
        if os.getenv("SMTP_HOST"):
            try:
                send_email(to_email=email, subject=subject, body_text=body)
                print(f"[SIGNUP VERIFICATION] Code sent to: {email}")
                return {
                    "success": True,
                    "message": "Verification code sent to your email"
                }
            except Exception as e:
                print(f"[SIGNUP VERIFICATION] Email send failed: {e}")
                print(f"[SIGNUP VERIFICATION] Code for {email}: {code}")
                return {
                    "success": True,
                    "message": "Verification code generated (email service unavailable - check server logs)"
                }
        else:
            # For development - log the code
            print(f"[SIGNUP VERIFICATION] Code for {email}: {code}")
            return {
                "success": True,
                "message": "Verification code generated (check server logs)"
            }
            
    except Exception as e:
        print(f"[SIGNUP VERIFICATION] Error: {e}")
        return {
            "success": False,
            "message": f"Failed to generate verification code: {str(e)}"
        }


def verify_signup_code(email: str, code: str) -> dict:
    """
    Verify the signup verification code
    Returns: dict with success status and message
    """
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Query the verification code
        cursor.execute("""
            SELECT id, code, expires_at, used, attempts 
            FROM user_verification_codes 
            WHERE email = ? 
            ORDER BY created_at DESC
        """, (email,))
        
        result = cursor.fetchone()
        
        if not result:
            conn.close()
            return {
                "success": False,
                "message": "No verification code found for this email"
            }
        
        code_id, stored_code, expires_at, used, attempts = result
        
        # Check if code is already used
        if used:
            conn.close()
            return {
                "success": False,
                "message": "Verification code already used"
            }
        
        # Check if code is expired (handle both string and datetime formats)
        expires_dt = _coerce_datetime(expires_at)
        if datetime.utcnow() > expires_dt:
            conn.close()
            return {
                "success": False,
                "message": "Verification code has expired"
            }
        
        # Check max attempts (max 5 attempts)
        if attempts >= 5:
            conn.close()
            return {
                "success": False,
                "message": "Too many failed attempts. Please request a new code."
            }
        
        # Check if code matches
        if code != stored_code:
            # Increment attempts
            new_attempts = attempts + 1
            cursor.execute("""
                UPDATE user_verification_codes 
                SET attempts = ? 
                WHERE id = ?
            """, (new_attempts, code_id))
            conn.commit()
            conn.close()
            return {
                "success": False,
                "message": "Invalid verification code"
            }
        
        # Mark code as used
        cursor.execute("""
            UPDATE user_verification_codes 
            SET used = 1 
            WHERE id = ?
        """, (code_id,))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Verification code verified successfully"
        }
        
    except Exception as e:
        print(f"[SIGNUP VERIFICATION] Verification error: {e}")
        return {
            "success": False,
            "message": f"Verification failed: {str(e)}"
        }


def resend_verification_code(email: str) -> dict:
    """
    Resend verification code to the user's email
    Returns: dict with success status and message
    """
    try:
        # Delete any existing unused codes for this email
        conn = get_db_conn()
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM user_verification_codes 
            WHERE email = ? AND used = 0
        """, (email,))
        
        conn.commit()
        conn.close()
        
        # Send new code
        return send_signup_verification_code(email)
        
    except Exception as e:
        print(f"[SIGNUP VERIFICATION] Resend error: {e}")
        return {
            "success": False,
            "message": f"Failed to resend verification code: {str(e)}"
        }
