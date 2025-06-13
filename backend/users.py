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
            raise HTTPException(status_code=400, detail="Email already registered")
        cursor.execute(
            "INSERT INTO users (email, hashed_password) VALUES (?, ?)",
            (email, hashed_password)
        )
        conn.commit()
        return {"message": "User registered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
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
    finally:
        try:
            conn.close()
        except:
            pass

def get_or_create_google_user(email: str, name: str):
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        if not row:
            cursor.execute(
                "INSERT INTO users (email, name, hashed_password) VALUES (?, ?, ?)",
                (email, name, None)
            )
            conn.commit()
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
        return row[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
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
            "SELECT id, email, name, language, role FROM users WHERE id = ?", 
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
            "language": row[3] or "English",
            "role": row[4] or "Public"
        }
        print(f"Returning profile data: {profile_data}")
        return profile_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            conn.close()
        except:
            pass

def update_user_profile(user_id: int, name: str, language: str):
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        print(f"Updating profile for user_id: {user_id}, name: {name}, language: {language}")
        cursor.execute(
            "UPDATE users SET name = ?, language = ? WHERE id = ?",
            (name, language, user_id)
        )
        print(f"Rows affected: {cursor.rowcount}")
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")
        conn.commit()
        print("Profile updated successfully")
        return {"message": "Profile updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            conn.close()
        except:
            pass
