from fastapi import APIRouter, HTTPException, Header, UploadFile, File
from pydantic import BaseModel
from utils.chat import verify_api_key, transcribe_audio_file

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

@router.post("/transcribe")
def transcribe_audio(
    file: UploadFile = File(...),
    language: str = "auto",  # "ms" for Malay, "en" for English, "auto" for auto-detect
    method: str = "auto"  # "openai" for API, "local" for local Whisper, "auto" for best
):
    """
    Transcribe audio to text with language support.
    
    Supports:
    - Malay (ms) and English (en) languages
    - OpenAI Whisper API (better accuracy, requires API key)
    - Local Whisper model (free, runs locally)
    """
    return transcribe_audio_file(file, language=language, method=method)
