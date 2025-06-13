from fastapi import HTTPException
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
import jwt
from datetime import datetime, timedelta
from users import get_or_create_google_user
import os

def google_authenticate(credential: str, client_id: str, jwt_secret: str, jwt_algorithm: str):
    try:
        # Debug: decode JWT header and payload
        import base64, json
        try:
            header, payload, signature = credential.split('.')
            print("Decoded header:", base64.urlsafe_b64decode(header + '==').decode())
            print("Decoded payload:", base64.urlsafe_b64decode(payload + '==').decode())
        except Exception as debug_e:
            print("Could not decode JWT for debug:", debug_e)
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            credential,
            grequests.Request(),
            client_id
        )
        email = idinfo["email"]
        name = idinfo.get("name", "")
        user_id = get_or_create_google_user(email, name)
        payload = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        token = jwt.encode(payload, jwt_secret, algorithm=jwt_algorithm)
        return {"message": "Google authentication successful", "token": token, "email": email, "name": name}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
