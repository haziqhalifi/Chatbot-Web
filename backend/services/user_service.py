from fastapi import HTTPException
from passlib.context import CryptContext
from database.connection import DatabaseConnection
import jwt
import os
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- User-related database logic ---
def create_user(email: str, password: str):
    hashed_password = pwd_context.hash(password)
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Email already registered")
            cursor.execute(
                "INSERT INTO users (email, hashed_password) VALUES (?, ?)",
                (email, hashed_password)
            )
            conn.commit()
            return {"message": "User registered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def verify_user(email: str, password: str):
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, hashed_password, name FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            if not row or not pwd_context.verify(password, row[1]):
                raise HTTPException(status_code=401, detail="Invalid credentials")
            
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
                    "name": row[2] or ""
                }
            }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

def get_or_create_google_user(email: str, name: str, given_name: str = "", family_name: str = "", picture: str = "", locale: str = "en", email_verified: bool = False):
    try:
        with DatabaseConnection() as conn:
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
        raise HTTPException(status_code=500, detail=str(e))

def get_user_profile(user_id: int):
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            print(f"Fetching profile for user_id: {user_id}")
            cursor.execute(
                """SELECT id, email, name, given_name, family_name, language, role, 
                   profile_picture, email_verified, auth_provider, phone, address, 
                   city, country, timezone, created_at, updated_at, last_login 
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
                "country": row[13] or "",
                "timezone": row[14] or "",
                "created_at": row[15].isoformat() if row[15] else None,
                "updated_at": row[16].isoformat() if row[16] else None,
                "last_login": row[17].isoformat() if row[17] else None,
            }
            print(f"Returning profile data: {profile_data}")
            return profile_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def update_user_profile(user_id: int, name: str, language: str, phone: str = "", address: str = "", city: str = "", country: str = "", timezone: str = ""):
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            print(f"Updating profile for user_id: {user_id}")
            print(f"New data: name={name}, language={language}, phone={phone}, address={address}, city={city}, country={country}, timezone={timezone}")
            
            cursor.execute(
                """UPDATE users SET name = ?, language = ?, phone = ?, address = ?, 
                   city = ?, country = ?, timezone = ?, updated_at = GETDATE() 
                   WHERE id = ?""",
                (name, language, phone, address, city, country, timezone, user_id)
            )
            print(f"Rows affected: {cursor.rowcount}")
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="User not found")
            conn.commit()
            print("Profile updated successfully")
            # Fetch and return the updated profile
            return get_user_profile(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def update_last_login(user_id: int):
    """Update the last login timestamp for a user"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE users SET last_login = GETDATE() WHERE id = ?",
                (user_id,)
            )
            conn.commit()
            print(f"Updated last login for user {user_id}")
    except Exception as e:
        print(f"Failed to update last login: {e}")
