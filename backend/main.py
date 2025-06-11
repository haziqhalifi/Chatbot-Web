from fastapi import FastAPI, HTTPException, Depends, Header, UploadFile, File
from typing import Annotated
from fastapi.middleware.cors import CORSMiddleware
import ollama
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
import pyodbc
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
import jwt
from datetime import datetime, timedelta
import openai
import whisper

load_dotenv()

API_KEY_CREDITS = {os.getenv("API_KEY"): 100}
print(API_KEY_CREDITS)

app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

origins = [
    "http://localhost:3000",
    "http://localhost:4028",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection helper
SQL_SERVER = os.getenv("SQL_SERVER")
SQL_DATABASE = os.getenv("SQL_DATABASE")
SQL_USER = os.getenv("SQL_USER")
SQL_PASSWORD = os.getenv("SQL_PASSWORD")

conn_str = (
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={SQL_SERVER};"
    f"DATABASE={SQL_DATABASE};"
    f"UID={SQL_USER};"
    f"PWD={SQL_PASSWORD}"
)

def get_db_conn():
    return pyodbc.connect(conn_str)

# --- Pydantic models for request bodies ---
class AuthRequest(BaseModel):
    email: str
    password: str

class PromptRequest(BaseModel):
    prompt: str

class GoogleAuthRequest(BaseModel):
    credential: str

# --- SIGN UP ---
@app.post("/signup")
def signup(request: AuthRequest):
    email = request.email
    password = request.password
    hashed_password = pwd_context.hash(password)
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        # Insert new user
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

# --- SIGN IN ---
@app.post("/signin")
def signin(request: AuthRequest):
    email = request.email
    password = request.password
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

# --- GOOGLE AUTHENTICATION ---
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret")
JWT_ALGORITHM = "HS256"
GOOGLE_CLIENT_ID = "845615957730-ldlb837mjkqtvigr8d6pt8ruq1qab2jo.apps.googleusercontent.com"

@app.post("/google-auth")
def google_auth(data: GoogleAuthRequest):
    try:
        print("Received credential:", data.credential)  # Debug: log the credential
        # Print server UTC time for debugging
        from datetime import datetime, timezone
        print("Server UTC time (before verify):", datetime.now(timezone.utc).timestamp())
        # Try to decode the JWT header and payload for debugging
        import base64, json
        try:
            header, payload, signature = data.credential.split('.')
            print("Decoded header:", base64.urlsafe_b64decode(header + '==').decode())
            print("Decoded payload:", base64.urlsafe_b64decode(payload + '==').decode())
        except Exception as debug_e:
            print("Could not decode JWT for debug:", debug_e)
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            data.credential,
            grequests.Request(),
            GOOGLE_CLIENT_ID
        )
        email = idinfo["email"]
        name = idinfo.get("name", "")
        # Connect to DB
        conn = get_db_conn()
        cursor = conn.cursor()
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        if not row:
            # Create user if not exists (no password for Google users)
            cursor.execute(
                "INSERT INTO users (email, name, hashed_password) VALUES (?, ?, ?)",
                (email, name, None)
            )
            conn.commit()
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
        user_id = row[0]
        # Generate JWT token
        payload = {
            "user_id": user_id,
            "email": email,
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return {"message": "Google authentication successful", "token": token, "email": email, "name": name}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            conn.close()
        except:
            pass

# --- API KEY & OLLAMA ENDPOINTS (unchanged) ---
def verify_api_key(x_api_key: str = Header(None)):
    credits = API_KEY_CREDITS.get(x_api_key, 0)
    if credits <= 0:
        raise HTTPException(status_code=401, detail="Invalid API Key, or no credits")
    return x_api_key

@app.post("/generate")
def generate(request: PromptRequest, x_api_key: str = Depends(verify_api_key)):
    API_KEY_CREDITS[x_api_key] -= 1
    response = ollama.chat(model="tiara", messages=[{"role": "user", "content": request.prompt}])
    return {"response": response["message"]["content"]}

@app.post("/transcribe")
def transcribe_audio(file: UploadFile = File(...)):
    try:
        audio_bytes = file.file.read()
        import tempfile, os
        temp_dir = os.path.dirname(os.path.abspath(__file__))
        temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=".wav", dir=temp_dir)
        try:
            temp_audio.write(audio_bytes)
            temp_audio.flush()
            temp_audio.close()  # Close so ffmpeg/whisper can read it
            model = whisper.load_model("base")
            result = model.transcribe(temp_audio.name)
        finally:
            os.unlink(temp_audio.name)  # Clean up temp file
        return {"transcript": result["text"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))