from fastapi import HTTPException
from passlib.context import CryptContext
from database import get_db_conn
import jwt
import os
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- User-related database logic ---
def create_user(email: str, password: str):
    hashed_password = pwd_context.hash(password)
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered. Please sign in instead.")
        cursor.execute(
            "INSERT INTO users (email, hashed_password) VALUES (?, ?)",
            (email, hashed_password)
        )
        conn.commit()
        return {"message": "Account created successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred during registration. Please try again.")
    finally:
        try:
            conn.close()
        except:
            pass

def verify_user(email: str, password: str):
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT id, hashed_password, name FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        if not row[1]:
            raise HTTPException(status_code=401, detail="No password set for this account. Please use social login or reset your password.")
        
        if not pwd_context.verify(password, row[1]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Generate JWT token
        JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret")
        JWT_ALGORITHM = "HS256"
        payload = {
            "user_id": row[0],
            "email": email,
            "name": row[2] or "",
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        # Update last login time
        update_last_login(row[0])
        
        return {
            "message": "Login successful",
            "token": token,
            "user": {
                "id": row[0],
                "email": email,
                "name": row[2] or "",
                "role": "user"
            }
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="An error occurred during sign in. Please try again.")
    finally:
        try:
            conn.close()
        except:
            pass

def get_or_create_google_user(email: str, name: str, given_name: str = "", family_name: str = "", picture: str = "", locale: str = "en", email_verified: bool = False):
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        if not row:
            # Create new user with all Google information
            cursor.execute(
                """INSERT INTO users (email, name, given_name, family_name, profile_picture, 
                   language, email_verified, hashed_password, auth_provider) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (email, name, given_name, family_name, picture, locale, email_verified, None, "google")
            )
            conn.commit()
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
        else:
            # Update existing user with latest Google information
            cursor.execute(
                """UPDATE users SET name = ?, given_name = ?, family_name = ?, 
                   profile_picture = ?, language = ?, email_verified = ?, auth_provider = ? 
                   WHERE email = ?""",
                (name, given_name, family_name, picture, locale, email_verified, "google", email)
            )
            conn.commit()
        return row[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to authenticate with Google. Please try again.")
    finally:
        try:
            conn.close()
        except:
            pass

def get_user_profile(user_id: int):
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        print(f"Fetching profile for user_id: {user_id}")
        cursor.execute(
            """SELECT id, email, name, given_name, family_name, language, role, 
               profile_picture, email_verified, auth_provider, phone, address, 
               city, state, postcode, country, timezone, created_at, updated_at, last_login 
               FROM users WHERE id = ?""", 
            (user_id,)
        )
        row = cursor.fetchone()
        if not row:
            print(f"User not found with id: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        
        print(f"User data from database: {row}")
        profile_data = {
            "id": row[0],
            "email": row[1],
            "name": row[2] or "",
            "given_name": row[3] or "",
            "family_name": row[4] or "",
            "language": row[5] or "English",
            "role": row[6] or "Public",
            "profile_picture": row[7] or "",
            "email_verified": bool(row[8]) if row[8] is not None else False,
            "auth_provider": row[9] or "local",
            "phone": row[10] or "",
            "address": row[11] or "",
            "city": row[12] or "",
            "state": row[13] or "",
            "postcode": row[14] or "",
            "country": row[15] or "",
            "timezone": row[16] or "",
            "created_at": row[17].isoformat() if row[17] else None,
            "updated_at": row[18].isoformat() if row[18] else None,
            "last_login": row[19].isoformat() if row[19] else None,
        }
        print(f"Returning profile data: {profile_data}")
        return profile_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve profile. Please try again.")
    finally:
        try:
            conn.close()
        except:
            pass

def update_user_profile(user_id: int, name: str, language: str, phone: str = "", address: str = "", city: str = "", state: str = "", postcode: str = "", country: str = "", timezone: str = ""):
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        print(f"Updating profile for user_id: {user_id}")
        print(f"New data: name={name}, language={language}, phone={phone}, address={address}, city={city}, state={state}, postcode={postcode}, country={country}, timezone={timezone}")
        
        # Validate name
        if not name or not name.strip():
            raise HTTPException(status_code=400, detail="Name is required")
        
        cursor.execute(
            """UPDATE users SET name = ?, language = ?, phone = ?, address = ?, 
               city = ?, state = ?, postcode = ?, country = ?, timezone = ?, updated_at = GETDATE() 
               WHERE id = ?""",
            (name, language, phone, address, city, state, postcode, country, timezone, user_id)
        )
        print(f"Rows affected: {cursor.rowcount}")
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")
        conn.commit()
        print("Profile updated successfully")
        # Fetch and return the updated profile
        return get_user_profile(user_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update profile. Please try again.")
    finally:
        try:
            conn.close()
        except:
            pass

def update_last_login(user_id: int):
    """Update the last login timestamp for a user"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET last_login = GETDATE() WHERE id = ?",
            (user_id,)
        )
        conn.commit()
        print(f"Updated last login for user {user_id}")
    except Exception as e:
        print(f"Failed to update last login: {e}")
    finally:
        try:
            conn.close()
        except:
            pass


def delete_user_account(user_id: int):
    """Delete a user and related data.

    Notes:
    - Some tables reference users without ON DELETE CASCADE (e.g., notifications, chat_sessions).
    - This function deletes dependent rows first, then deletes the user.
    """
    conn = None
    try:
        conn = get_db_conn()
        conn.autocommit = False
        cursor = conn.cursor()

        # Ensure user exists
        cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")

        # Delete notifications (FK to users)
        cursor.execute("DELETE FROM notifications WHERE user_id = ?", (user_id,))

        # Delete system reports (FK to users)
        cursor.execute("DELETE FROM system_reports WHERE user_id = ?", (user_id,))

        # Delete disaster reports if table exists
        cursor.execute(
            """
            IF OBJECT_ID('disaster_reports', 'U') IS NOT NULL
                DELETE FROM disaster_reports WHERE user_id = ?
            """,
            (user_id,),
        )

        # Delete password reset tokens (FK to users)
        cursor.execute("DELETE FROM password_reset_tokens WHERE user_id = ?", (user_id,))

        # Delete chat sessions (messages are ON DELETE CASCADE from sessions)
        cursor.execute("DELETE FROM chat_sessions WHERE user_id = ?", (user_id,))

        # Delete subscriptions (may have FK with ON DELETE CASCADE, but safe to delete explicitly)
        cursor.execute(
            """
            IF OBJECT_ID('user_subscriptions', 'U') IS NOT NULL
                DELETE FROM user_subscriptions WHERE user_id = ?
            """,
            (user_id,),
        )

        # Finally delete user
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))

        conn.commit()
        conn.autocommit = True
        return {"message": "Account deleted successfully."}
    except HTTPException:
        if conn is not None:
            try:
                conn.rollback()
            except Exception:
                pass
        raise
    except Exception as e:
        if conn is not None:
            try:
                conn.rollback()
            except Exception:
                pass
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn is not None:
            try:
                conn.close()
            except Exception:
                pass
