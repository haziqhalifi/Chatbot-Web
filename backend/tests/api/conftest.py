import pytest
import sys
import os
import jwt
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from pathlib import Path

# Add backend root to path
backend_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_root))

# Must set env vars before importing main
os.environ.setdefault("JWT_SECRET", "test-secret-key")
os.environ.setdefault("DATABASE_CONNECTION_STRING", "DRIVER={ODBC Driver 17 for SQL Server};SERVER=.;DATABASE=test_db;Trusted_Connection=yes;")
os.environ.setdefault("OPENAI_API_KEY", "test-openai-key")
os.environ.setdefault("OPENAI_ASSISTANT_ID", "test-assistant-id")


@pytest.fixture(scope="session")
def test_client():
    """Create TestClient for the FastAPI app"""
    from main import app
    # TestClient uses ASGITransport internally, no need to pass explicitly
    client = TestClient(app)
    yield client
    client.close()


@pytest.fixture
def valid_jwt_token():
    """Generate a valid JWT token for testing"""
    secret = os.getenv("JWT_SECRET", "test-secret-key")
    payload = {
        "user_id": 1,
        "email": "testuser@example.com",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    return jwt.encode(payload, secret, algorithm="HS256")


@pytest.fixture
def admin_jwt_token():
    """Generate an admin JWT token for testing"""
    secret = os.getenv("JWT_SECRET", "test-secret-key")
    payload = {
        "user_id": 999,
        "email": "admin@example.com",
        "is_admin": True,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    return jwt.encode(payload, secret, algorithm="HS256")


@pytest.fixture
def expired_jwt_token():
    """Generate an expired JWT token for testing"""
    secret = os.getenv("JWT_SECRET", "test-secret-key")
    payload = {
        "user_id": 1,
        "email": "testuser@example.com",
        "exp": datetime.now(timezone.utc) - timedelta(hours=1)
    }
    return jwt.encode(payload, secret, algorithm="HS256")


@pytest.fixture
def auth_headers(valid_jwt_token):
    """Return authorization headers with valid token"""
    return {"Authorization": f"Bearer {valid_jwt_token}"}


@pytest.fixture
def admin_headers(admin_jwt_token):
    """Return authorization headers with admin token"""
    return {"Authorization": f"Bearer {admin_jwt_token}"}


@pytest.fixture
def api_key_header():
    """Return API key header"""
    return {"x-api-key": "secretkey"}


@pytest.fixture
def sample_user_data():
    """Sample user data for tests"""
    return {
        "email": "test@example.com",
        "password": "TestPassword123!",
        "name": "Test User"
    }


@pytest.fixture
def sample_admin_code():
    """Sample admin code for tests"""
    return "123456"


@pytest.fixture
def sample_chat_session_data():
    """Sample chat session data"""
    return {
        "title": "Test Chat Session",
        "ai_provider": "openai"
    }


@pytest.fixture
def sample_chat_message_data():
    """Sample chat message data"""
    return {
        "content": "Hello, how are you?",
        "message_type": "text"
    }


@pytest.fixture
def sample_notification_data():
    """Sample notification data"""
    return {
        "title": "Test Notification",
        "message": "This is a test notification",
        "type": "alert"
    }


@pytest.fixture
def sample_profile_data():
    """Sample user profile data"""
    return {
        "name": "Updated User",
        "phone": "+60123456789",
        "preferences": {"theme": "dark", "language": "en"}
    }


@pytest.fixture
def sample_subscription_data():
    """Sample subscription data"""
    return {
        "disaster_types": ["flood", "earthquake"],
        "locations": ["Kuala Lumpur", "Selangor"]
    }


@pytest.fixture
def sample_faq_data():
    """Sample FAQ data"""
    return {
        "question": "What is a flood?",
        "answer": "A flood is an overflow of water.",
        "category": "disaster",
        "order": 1
    }


@pytest.fixture
def sample_report_data():
    """Sample incident report data"""
    return {
        "incident_type": "flood",
        "location": "Subang",
        "description": "Flash flooding occurred at Subang area",
        "severity": "high",
        "affected_people": 50
    }
