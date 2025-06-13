from fastapi import FastAPI, HTTPException, Depends, Header, UploadFile, File
from typing import Annotated
from fastapi.middleware.cors import CORSMiddleware
import ollama
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
import jwt
from datetime import datetime, timedelta
import openai
import whisper
from database import get_db_conn, update_users_table  # Import the database connection helper
from users import create_user, verify_user, get_or_create_google_user, get_user_profile, update_user_profile
from chat_utils import verify_api_key, generate_response, transcribe_audio_file
from auth_utils import google_authenticate  # Import the Google authentication logic

load_dotenv()

API_KEY_CREDITS = {os.getenv("API_KEY"): 100}
print(API_KEY_CREDITS)

# Initialize database updates
update_users_table()

app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:4028",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic models for request bodies ---
class AuthRequest(BaseModel):
    email: str
    password: str

class PromptRequest(BaseModel):
    prompt: str

class GoogleAuthRequest(BaseModel):
    credential: str

class ReportRequest(BaseModel):
    user_id: int
    title: str
    location: str
    disaster_type: str
    description: str
    timestamp: str  # ISO format string for date and time

class UserProfileRequest(BaseModel):
    name: str
    language: str = "English"
    phone: str = ""
    address: str = ""
    city: str = ""
    country: str = ""
    timezone: str = ""

# --- SIGN UP ---
@app.post("/signup")
def signup(request: AuthRequest):
    return create_user(request.email, request.password)

# --- SIGN IN ---
@app.post("/signin")
def signin(request: AuthRequest):
    return verify_user(request.email, request.password)

# --- GOOGLE AUTHENTICATION ---
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret")
JWT_ALGORITHM = "HS256"
GOOGLE_CLIENT_ID = "845615957730-ldlb837mjkqtvigr8d6pt8ruq1qab2jo.apps.googleusercontent.com"

@app.post("/google-auth")
def google_auth(data: GoogleAuthRequest):
    return google_authenticate(
        credential=data.credential,
        client_id=GOOGLE_CLIENT_ID,
        jwt_secret=JWT_SECRET,
        jwt_algorithm=JWT_ALGORITHM
    )

# --- API KEY & OLLAMA ENDPOINTS (unchanged) ---
@app.post("/generate")
def generate(request: PromptRequest, x_api_key: str = Header(None)):
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    return generate_response(request, x_api_key, API_KEY_CREDITS)

@app.post("/transcribe")
def transcribe_audio(file: UploadFile = File(...)):
    return transcribe_audio_file(file)

@app.post("/report")
def create_report(report: ReportRequest):
    from database import insert_report
    return insert_report(report)

# --- USER PROFILE ENDPOINTS ---
@app.get("/profile")
def get_profile(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return get_user_profile(user_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.put("/profile")
def update_profile(request: UserProfileRequest, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return update_user_profile(user_id, request.name, request.language, request.phone, request.address, request.city, request.country, request.timezone)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")