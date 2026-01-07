"""
Admin verification utilities for email-based verification codes
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


def send_admin_verification_code(email: str) -> dict:
    """
    Generate and send a verification code to the admin email
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
            DELETE FROM admin_verification_codes 
            WHERE email = ? AND used = 0
        """, (email,))
        
        # Insert new verification code
        cursor.execute("""
            INSERT INTO admin_verification_codes (email, code, expires_at, used, attempts)
            VALUES (?, ?, ?, 0, 0)
        """, (email, code, expires_at))
        
        conn.commit()
        conn.close()
        
        # Send email with verification code
        subject = "DisasterWatch Admin Verification Code"
        body = f"""
Hello,

Your DisasterWatch Admin verification code is: {code}

This code will expire in 10 minutes.

If you did not request this code, please ignore this email.

Best regards,
DisasterWatch Security Team
        """
        
        # Check if SMTP is configured
        if os.getenv("SMTP_HOST"):
            try:
                send_email(to_email=email, subject=subject, body_text=body)
                print(f"[ADMIN VERIFICATION] Code sent to: {email}")
                return {
                    "success": True,
                    "message": "Verification code sent to your email"
                }
            except Exception as e:
                print(f"[ADMIN VERIFICATION] Email send failed: {e}")
                print(f"[ADMIN VERIFICATION] Code for {email}: {code}")
                return {
                    "success": True,
                    "message": "Verification code generated (email service unavailable - check server logs)"
                }
        else:
            # For development - log the code
            print(f"[ADMIN VERIFICATION] Code for {email}: {code}")
            return {
                "success": True,
                "message": "Verification code generated (check server logs)"
            }
            
    except Exception as e:
        print(f"[ADMIN VERIFICATION] Error: {e}")
        return {
            "success": False,
            "message": f"Failed to generate verification code: {str(e)}"
        }


def verify_admin_code(email: str, code: str) -> dict:
    """
    Verify the admin verification code
    Returns: dict with success status and message
    """
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Find the verification code
        cursor.execute("""
            SELECT id, code, expires_at, used, attempts 
            FROM admin_verification_codes 
            WHERE email = ? AND used = 0
            ORDER BY created_at DESC
        """, (email,))
        
        result = cursor.fetchone()
        
        if not result:
            conn.close()
            return {
                "success": False,
                "message": "No verification code found. Please request a new code."
            }
        
        code_id, stored_code, expires_at, used, attempts = result
        
        # Check if code has expired
        if isinstance(expires_at, str):
            expires_at = datetime.strptime(expires_at, '%Y-%m-%d %H:%M:%S')
        
        if datetime.utcnow() > expires_at:
            cursor.execute("""
                UPDATE admin_verification_codes 
                SET used = 1 
                WHERE id = ?
            """, (code_id,))
            conn.commit()
            conn.close()
            return {
                "success": False,
                "message": "Verification code has expired. Please request a new code."
            }
        
        # Check attempts (max 5 attempts)
        if attempts >= 5:
            cursor.execute("""
                UPDATE admin_verification_codes 
                SET used = 1 
                WHERE id = ?
            """, (code_id,))
            conn.commit()
            conn.close()
            return {
                "success": False,
                "message": "Too many failed attempts. Please request a new code."
            }
        
        # Verify the code
        if code != stored_code:
            # Increment attempts
            cursor.execute("""
                UPDATE admin_verification_codes 
                SET attempts = attempts + 1 
                WHERE id = ?
            """, (code_id,))
            conn.commit()
            remaining = 5 - (attempts + 1)
            conn.close()
            return {
                "success": False,
                "message": f"Invalid verification code. {remaining} attempts remaining."
            }
        
        # Code is valid - mark as used
        cursor.execute("""
            UPDATE admin_verification_codes 
            SET used = 1 
            WHERE id = ?
        """, (code_id,))
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Verification code validated successfully"
        }
        
    except Exception as e:
        print(f"[ADMIN VERIFICATION] Verification error: {e}")
        return {
            "success": False,
            "message": f"Failed to verify code: {str(e)}"
        }
