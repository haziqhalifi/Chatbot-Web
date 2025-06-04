from fastapi import FastAPI, HTTPException, Depends, Header
from typing import Annotated
from fastapi.middleware.cors import CORSMiddleware
import ollama
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
import pyodbc
from pydantic import BaseModel

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

# --- API KEY & OLLAMA ENDPOINTS (unchanged) ---
def verify_api_key(x_api_key: str = Header(None)):
    credits = API_KEY_CREDITS.get(x_api_key, 0)
    if credits <= 0:
        raise HTTPException(status_code=401, detail="Invalid API Key, or no credits")
    return x_api_key

@app.post("/generate")
def generate(request: PromptRequest, x_api_key: str = Depends(verify_api_key)):
    API_KEY_CREDITS[x_api_key] -= 1
    response = ollama.chat(model="llama2", messages=[{"role": "user", "content": request.prompt}])
    return {"response": response["message"]["content"]}