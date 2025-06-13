from fastapi import HTTPException
from passlib.context import CryptContext
from database import get_db_conn

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
        cursor.execute("SELECT hashed_password FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        if not row or not pwd_context.verify(password, row[0]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {"message": "Login successful"}
    except Exception as e:
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
