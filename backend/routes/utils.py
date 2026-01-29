"""
Shared utilities for route modules
"""
import jwt
import os
from services.user_service import JWT_SECRET, JWT_ALGORITHM

def get_user_id_from_token(authorization: str):
    """Helper function to extract user_id from JWT token"""
    from fastapi import HTTPException
    
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

def get_api_key_credits():
    """Get API key credits from main module"""
    try:
        import main
        return main.API_KEY_CREDITS
    except (ImportError, AttributeError):
        # Fallback if main is not available
        return {os.getenv("API_KEY"): 100}
