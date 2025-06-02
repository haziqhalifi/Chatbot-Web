from fastapi import FastAPI, HTTPException, Depends, Header
from typing import Annotated, List
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import SessionLocal, engine
import models
from fastapi.middleware.cors import CORSMiddleware
import ollama
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY_CREDITS = {os.getenv("API_KEY"): 100}
print(API_KEY_CREDITS)

app = FastAPI()

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

# Check if the database tables exist, if not create them
class TransactionBase(BaseModel):
    amount: float
    category: str
    description: str
    is_income: bool
    date: str

class TransactionModel(TransactionBase):
    id: int

    class Config:
        orm_mode = True

class PromptRequest(BaseModel):
    prompt: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

models.Base.metadata.create_all(bind=engine)

@app.post("/transactions/", response_model=TransactionModel)
async def create_transaction(
    transaction: TransactionBase, db: Session = Depends(get_db)
):
    db_transaction = models.Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.get("/transactions/", response_model=List[TransactionModel])
async def read_transactions(
    db: Session = Depends(get_db), skip: int = 0, limit: int = 100
):
    transactions = db.query(models.Transaction).offset(skip).limit(limit).all()
    return transactions

# Ollama API endpoint
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