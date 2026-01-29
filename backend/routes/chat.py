from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
import jwt
from services.chat_service import ChatService
from services.user_service import JWT_SECRET, JWT_ALGORITHM
from utils.chat import verify_api_key
from config.settings import AI_PROVIDERS, DEFAULT_AI_PROVIDER, OPENAI_ASSISTANT_ENABLED

router = APIRouter()

# Chat-related models
class ChatSessionRequest(BaseModel):
    title: Optional[str] = None
    ai_provider: Optional[str] = None  # "openai"

class ChatMessageRequest(BaseModel):
    content: str
    message_type: str = "text"  # text, voice, image

class ChatGenerateRequest(BaseModel):
    session_id: int
    prompt: str
    message_type: str = "text"  # Add message_type for text, voice, image

class UpdateSessionTitleRequest(BaseModel):
    title: str

def get_user_id_from_token(authorization: str):
    """Helper function to extract user_id from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/chat/sessions")
def create_chat_session(
    request: ChatSessionRequest,
    authorization: str = Header(None)
):
    """Create a new chat session"""
    user_id = get_user_id_from_token(authorization)
    return ChatService.create_new_session(user_id, request.title, request.ai_provider)

@router.get("/chat/providers")
def get_ai_providers():
    """Get available AI providers"""
    provider_descriptions = {
        k: v
        for k, v in {
            "openai": "ChatGPT (OpenAI Assistant) - Cloud-based AI assistant"
        }.items()
        if k in AI_PROVIDERS
    }

    return {
        "providers": AI_PROVIDERS,
        "default": DEFAULT_AI_PROVIDER,
        "descriptions": provider_descriptions,
        "openai_configured": OPENAI_ASSISTANT_ENABLED
    }

@router.get("/chat/sessions")
def get_chat_sessions(
    authorization: str = Header(None),
    limit: int = 20,
    offset: int = 0
):
    """Get user's chat sessions"""
    user_id = get_user_id_from_token(authorization)
    return ChatService.get_user_sessions(user_id, limit, offset)

@router.get("/chat/sessions/{session_id}")
def get_chat_session(
    session_id: int,
    authorization: str = Header(None)
):
    """Get specific chat session details"""
    user_id = get_user_id_from_token(authorization)
    return ChatService.get_session_details(session_id, user_id)

@router.get("/chat/sessions/{session_id}/messages")
def get_chat_session_messages(
    session_id: int,
    authorization: str = Header(None),
    limit: int = 50,
    offset: int = 0
):
    """Get messages for a specific chat session"""
    user_id = get_user_id_from_token(authorization)
    return ChatService.get_session_messages(session_id, user_id, limit, offset)

@router.post("/chat/sessions/{session_id}/messages")
def save_chat_message(
    session_id: int,
    request: ChatMessageRequest,
    authorization: str = Header(None)
):
    """Save a message to a chat session"""
    user_id = get_user_id_from_token(authorization)
    return ChatService.save_user_message(session_id, user_id, request.content, request.message_type)

@router.post("/chat/generate")
def generate_chat_response(
    request: ChatGenerateRequest,
    x_api_key: str = Header(None),
    authorization: str = Header(None)
):
    """Generate AI response with chat session context"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    user_id = get_user_id_from_token(authorization)
    
    return ChatService.process_chat_message(
        request.session_id, 
        user_id, 
        request.prompt, 
        x_api_key, 
        API_KEY_CREDITS,
        request.message_type
    )

@router.put("/chat/sessions/{session_id}")
def update_chat_session_title(
    session_id: int,
    request: UpdateSessionTitleRequest,
    authorization: str = Header(None)
):
    """Update chat session title"""
    user_id = get_user_id_from_token(authorization)
    return ChatService.update_session_title(session_id, user_id, request.title)

@router.delete("/chat/sessions/{session_id}")
def delete_chat_session(
    session_id: int,
    authorization: str = Header(None)
):
    """Delete a chat session"""
    user_id = get_user_id_from_token(authorization)
    return ChatService.delete_session(session_id, user_id)
