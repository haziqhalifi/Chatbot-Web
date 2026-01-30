"""
Authentication and authorization middleware for admin endpoints
"""
from fastapi import Header, HTTPException
import jwt
from config.settings import JWT_SECRET, JWT_ALGORITHM


def verify_admin_token(authorization: str = Header(None)) -> dict:
    """
    Verify JWT token and ensure user has admin role.
    Returns user data including user_id and role.
    
    Raises:
        HTTPException: 401 if token is missing/invalid/expired
        HTTPException: 403 if user is not an admin
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401, 
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        role = payload.get("role")
        email = payload.get("email")
        
        if not user_id:
            raise HTTPException(
                status_code=401, 
                detail="Invalid token: missing user_id"
            )
        
        # CRITICAL: Verify admin role
        if role != "admin":
            raise HTTPException(
                status_code=403, 
                detail="Access denied: Admin privileges required"
            )
        
        return {
            "user_id": user_id,
            "role": role,
            "email": email
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def verify_user_token(authorization: str = Header(None)) -> dict:
    """
    Verify JWT token for any authenticated user (admin or regular user).
    Returns user data including user_id and role.
    
    Raises:
        HTTPException: 401 if token is missing/invalid/expired
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401, 
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        role = payload.get("role", "Public")  # Default to Public if not set
        email = payload.get("email")
        
        if not user_id:
            raise HTTPException(
                status_code=401, 
                detail="Invalid token: missing user_id"
            )
        
        return {
            "user_id": user_id,
            "role": role,
            "email": email
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
