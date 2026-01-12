"""
Integration Test Configuration and Fixtures
Tests real interactions between modules while mocking external services
"""
import pytest
import sys
import os
from pathlib import Path
from unittest.mock import patch, MagicMock, AsyncMock
from datetime import datetime, timedelta, timezone
import jwt
import json

# Add backend to path
backend_path = str(Path(__file__).parent.parent.parent)
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from config.settings import JWT_SECRET, JWT_ALGORITHM


@pytest.fixture(scope="session")
def app():
    """Lazy import of FastAPI app to avoid startup side effects"""
    from main import app as fastapi_app
    return fastapi_app


@pytest.fixture
def client(app):
    """FastAPI test client"""
    from fastapi.testclient import TestClient
    with TestClient(app) as test_client:
        yield test_client


# ============================================================================
# DATABASE FIXTURES
# ============================================================================

@pytest.fixture
def mock_db_connection():
    """Mock database connection for integration tests"""
    with patch('database.connection.DatabaseConnection') as mock_conn:
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        mock_cursor.fetchall.return_value = []
        
        mock_instance = MagicMock()
        mock_instance.__enter__.return_value.cursor.return_value = mock_cursor
        mock_conn.return_value = mock_instance
        
        yield mock_conn


@pytest.fixture
def mock_create_chat_session(monkeypatch):
    """Mock chat session creation"""
    def _create_session(user_id, title=None, provider=None):
        return {
            'id': 1,
            'user_id': user_id,
            'title': title or 'New Chat',
            'ai_provider': provider or 'openai',
            'created_at': datetime.now().isoformat(),
            'openai_thread_id': None,
        }
    
    monkeypatch.setattr('database.chat.create_chat_session', _create_session)
    return _create_session


@pytest.fixture
def mock_get_chat_session(monkeypatch):
    """Mock chat session retrieval"""
    def _get_session(session_id, user_id):
        return {
            'id': session_id,
            'user_id': user_id,
            'title': 'Test Chat',
            'ai_provider': 'openai',
            'openai_thread_id': None,
        }
    
    monkeypatch.setattr('database.chat.get_chat_session', _get_session)
    return _get_session


@pytest.fixture
def mock_save_chat_message(monkeypatch):
    """Mock chat message saving"""
    def _save_message(session_id, sender_type, content, message_type='text'):
        return {
            'id': 1,
            'session_id': session_id,
            'sender_type': sender_type,
            'content': content,
            'message_type': message_type,
            'timestamp': datetime.now().isoformat(),
        }
    
    monkeypatch.setattr('database.chat.save_chat_message', _save_message)
    return _save_message


# ============================================================================
# AUTH FIXTURES
# ============================================================================

@pytest.fixture
def valid_jwt_token():
    """Create a valid JWT token for testing"""
    payload = {
        'user_id': 1,
        'email': 'test@example.com',
        'exp': datetime.now(timezone.utc) + timedelta(hours=1),
        'iat': datetime.now(timezone.utc),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


@pytest.fixture
def expired_jwt_token():
    """Create an expired JWT token for testing"""
    payload = {
        'user_id': 1,
        'email': 'test@example.com',
        'exp': datetime.now(timezone.utc) - timedelta(hours=1),
        'iat': datetime.now(timezone.utc) - timedelta(hours=2),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


@pytest.fixture
def auth_headers(valid_jwt_token):
    """Create authorization headers with valid token"""
    return {'Authorization': f'Bearer {valid_jwt_token}'}


@pytest.fixture
def mock_user_service(monkeypatch):
    """Mock user service for auth integration tests"""
    class MockUserService:
        @staticmethod
        def create_user(email, password):
            return {'id': 1, 'email': email, 'created_at': datetime.now().isoformat()}
        
        @staticmethod
        def verify_user(email, password):
            if email == 'test@example.com' and password == 'correct_password':
                return {'id': 1, 'email': email}
            return None
        
        @staticmethod
        def get_user_by_email(email):
            if email == 'existing@example.com':
                return {'id': 1, 'email': email}
            return None
    
    monkeypatch.setattr('services.user_service.create_user', MockUserService.create_user)
    monkeypatch.setattr('services.user_service.verify_user', MockUserService.verify_user)
    return MockUserService


# ============================================================================
# OPENAI SERVICE FIXTURES
# ============================================================================

@pytest.fixture
def mock_openai_service(monkeypatch):
    """Mock OpenAI service for chat integration tests"""
    class MockOpenAIService:
        def __init__(self):
            self.call_count = 0
        
        def generate_response(self, prompt, thread_id=None):
            self.call_count += 1
            return {
                'response': f'Response to: {prompt}',
                'duration': 1.5,
                'thread_id': thread_id or 'thread_123',
                'map_commands': [],
            }
        
        def get_or_create_thread(self, user_id):
            return 'thread_123'
    
    mock_service = MockOpenAIService()
    monkeypatch.setattr(
        'services.chat_service.get_openai_assistant_service',
        lambda: mock_service
    )
    return mock_service


# ============================================================================
# NOTIFICATION FIXTURES
# ============================================================================

@pytest.fixture
def mock_notification_service(monkeypatch):
    """Mock notification service"""
    class MockNotificationService:
        def __init__(self):
            self.notifications = []
        
        def create_notification(self, user_id, title, message, notif_type='info'):
            notif = {
                'id': len(self.notifications) + 1,
                'user_id': user_id,
                'title': title,
                'message': message,
                'type': notif_type,
                'read': False,
                'created_at': datetime.now().isoformat(),
            }
            self.notifications.append(notif)
            return notif
        
        def mark_as_read(self, notif_id):
            for notif in self.notifications:
                if notif['id'] == notif_id:
                    notif['read'] = True
                    return notif
            return None
        
        def get_notifications(self, user_id, limit=50):
            return [n for n in self.notifications if n['user_id'] == user_id]
    
    return MockNotificationService()




# ============================================================================
# TEST CLIENT FIXTURES
# ============================================================================

@pytest.fixture
def integration_test_env(monkeypatch):
    """Set up environment for integration tests"""
    monkeypatch.setenv('OPENAI_ASSISTANT_ENABLED', 'false')
    monkeypatch.setenv('JWT_SECRET', JWT_SECRET)
    monkeypatch.setenv('API_KEY_CREDITS', '{"test_key": 100}')
    yield
    # Cleanup is automatic with monkeypatch


# ============================================================================
# REQUEST BUILDERS
# ============================================================================

@pytest.fixture
def chat_session_request():
    """Helper to build chat session requests"""
    def _build(title=None, provider=None):
        return {
            'title': title or 'Test Chat',
            'ai_provider': provider or 'openai',
        }
    return _build


@pytest.fixture
def chat_message_request():
    """Helper to build chat message requests"""
    def _build(session_id, prompt, message_type='text'):
        return {
            'session_id': session_id,
            'prompt': prompt,
            'message_type': message_type,
        }
    return _build


# ============================================================================
# SETUP AND TEARDOWN
# ============================================================================

@pytest.fixture(autouse=True)
def reset_app_state(monkeypatch):
    """Reset app state before each test"""
    yield
    # Cleanup after test


@pytest.fixture
def capture_logs(caplog):
    """Capture logs for debugging integration tests"""
    import logging
    caplog.set_level(logging.DEBUG)
    return caplog
