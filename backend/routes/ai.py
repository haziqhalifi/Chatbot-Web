from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from utils.chat import verify_api_key

router = APIRouter()

class PromptRequest(BaseModel):
    prompt: str

@router.post("/generate")
def generate(request: PromptRequest, x_api_key: str = Header(None)):
    """Legacy endpoint - Gemini/Ollama provider has been removed. Use OpenAI Assistant via chat endpoints instead."""
    raise HTTPException(
        status_code=410,
        detail="Gemini/Ollama provider has been removed. Please use the chat endpoints with OpenAI Assistant."
    )
