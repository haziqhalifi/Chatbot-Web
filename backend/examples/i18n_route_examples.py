"""
Example of using i18n in backend routes.
This file demonstrates how to integrate the i18n utility with FastAPI routes.
"""

from fastapi import APIRouter, HTTPException, Header, Request
from utils.i18n import create_translator, translate
from models import AuthRequest

router = APIRouter()

# Example 1: Using translator with request headers
@router.post("/api/example/login")
async def login_example(request: Request, auth_data: AuthRequest):
    """Example login endpoint with i18n support"""
    # Create translator from request headers
    translator = create_translator(request.headers)
    
    # Use translator for responses
    try:
        # Your authentication logic here
        user = authenticate_user(auth_data.email, auth_data.password)
        
        return {
            "success": True,
            "message": translator.t('auth.login_success'),
            "user": user
        }
    except Exception:
        raise HTTPException(
            status_code=401,
            detail=translator.t('auth.invalid_credentials')
        )


# Example 2: Using direct translate function
@router.post("/api/example/register")
async def register_example(
    auth_data: AuthRequest,
    accept_language: str = Header(None)
):
    """Example registration endpoint with i18n support"""
    # Extract language from header
    lang = accept_language.split(",")[0].split("-")[0] if accept_language else "en"
    lang = "ms" if lang == "ms" else "en"
    
    try:
        # Your registration logic here
        user = create_user(auth_data.email, auth_data.password)
        
        return {
            "success": True,
            "message": translate('auth.registration_success', lang=lang),
            "user": user
        }
    except Exception as e:
        if "already exists" in str(e).lower():
            raise HTTPException(
                status_code=400,
                detail=translate('auth.email_exists', lang=lang)
            )
        raise HTTPException(
            status_code=400,
            detail=translate('auth.registration_failed', lang=lang)
        )


# Example 3: Using translator for multiple messages
@router.post("/api/example/report")
async def submit_report_example(request: Request, report_data: dict):
    """Example report submission with i18n support"""
    translator = create_translator(request.headers)
    
    try:
        # Your report submission logic here
        report = save_report(report_data)
        
        # Send notification with translated message
        notification_message = translator.t('report.submitted')
        send_notification(report.user_id, notification_message)
        
        return {
            "success": True,
            "message": translator.t('report.submitted'),
            "report_id": report.id
        }
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=translator.t('report.submit_failed')
        )


# Example 4: Conditional translations based on disaster type
@router.post("/api/example/notification")
async def send_notification_example(request: Request, data: dict):
    """Example notification with disaster type translation"""
    translator = create_translator(request.headers)
    
    disaster_type = data.get('disaster_type', '').lower()
    
    # Map disaster types to translation keys
    disaster_translations = {
        'flood': 'notification.flood_warning',
        'landslide': 'notification.landslide_warning',
        'evacuation': 'notification.evacuation_notice',
        'weather': 'notification.weather_update',
        'all_clear': 'notification.all_clear'
    }
    
    # Get translated notification title
    notification_key = disaster_translations.get(disaster_type, 'notification.general_alert')
    title = translator.t(notification_key)
    
    return {
        "success": True,
        "message": translator.t('notification.sent'),
        "notification_title": title
    }


# Example 5: Status translation
@router.get("/api/example/report/{report_id}/status")
async def get_report_status_example(
    report_id: int,
    request: Request
):
    """Example endpoint that returns translated status"""
    translator = create_translator(request.headers)
    
    # Get report from database
    report = get_report_by_id(report_id)
    
    if not report:
        raise HTTPException(
            status_code=404,
            detail=translator.t('report.not_found')
        )
    
    # Translate status
    status_translations = {
        'pending': translator.t('status.pending'),
        'investigating': translator.t('status.investigating'),
        'resolved': translator.t('status.resolved')
    }
    
    return {
        "report_id": report.id,
        "status": report.status,
        "status_display": status_translations.get(report.status, report.status),
        "message": translator.t('success.operation_completed')
    }


# Example 6: Error handling with translations
@router.get("/api/example/protected")
async def protected_endpoint_example(
    request: Request,
    authorization: str = Header(None)
):
    """Example protected endpoint with translated error messages"""
    translator = create_translator(request.headers)
    
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail=translator.t('auth.unauthorized')
        )
    
    try:
        # Verify token
        user = verify_token(authorization)
        
        return {
            "message": translator.t('success.operation_completed'),
            "user": user
        }
    except TokenExpiredError:
        raise HTTPException(
            status_code=401,
            detail=translator.t('auth.token_expired')
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=translator.t('error.server')
        )


# Helper functions (placeholder implementations)
def authenticate_user(email, password):
    """Placeholder for user authentication"""
    return {"id": 1, "email": email}

def create_user(email, password):
    """Placeholder for user creation"""
    return {"id": 1, "email": email}

def save_report(data):
    """Placeholder for saving report"""
    class Report:
        def __init__(self):
            self.id = 1
            self.user_id = 1
    return Report()

def send_notification(user_id, message):
    """Placeholder for sending notification"""
    pass

def get_report_by_id(report_id):
    """Placeholder for getting report"""
    class Report:
        def __init__(self):
            self.id = report_id
            self.status = 'pending'
    return Report()

def verify_token(token):
    """Placeholder for token verification"""
    return {"id": 1, "email": "user@example.com"}

class TokenExpiredError(Exception):
    """Custom exception for expired tokens"""
    pass
