from fastapi import APIRouter, HTTPException, Header, UploadFile, File
from pydantic import BaseModel
from utils.chat import verify_api_key, generate_response, transcribe_audio_file

router = APIRouter()

class PromptRequest(BaseModel):
    prompt: str
    rag_enabled: bool = True  # Default to True for backward compatibility

@router.post("/generate")
def generate(request: PromptRequest, x_api_key: str = Header(None)):
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    return generate_response(request, x_api_key, API_KEY_CREDITS)

@router.post("/transcribe")
def transcribe_audio(file: UploadFile = File(...)):
    return transcribe_audio_file(file)
