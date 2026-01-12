"""Test configuration and fixtures"""
import os
import sys
from pathlib import Path
from unittest.mock import Mock, patch

import pytest
from fastapi.testclient import TestClient

# Ensure backend root is importable during collection
BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

# Test database configuration
TEST_DB_CONFIG = {
    "SQL_SERVER": "localhost",
    "SQL_DATABASE": "test_chatbot_db",
    "SQL_USER": "test_user",
    "SQL_PASSWORD": "test_password"
}

@pytest.fixture(autouse=True)
def add_repo_to_path():
    """Ensure backend root is on sys.path for absolute imports."""
    root = Path(__file__).resolve().parent.parent
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))
        added = True
    else:
        added = False
    yield
    if added and str(root) in sys.path:
        sys.path.remove(str(root))


@pytest.fixture
def test_client():
    """Create a test client for the FastAPI app"""
    from main import app
    with TestClient(app) as client:
        yield client

@pytest.fixture
def mock_db_connection():
    """Mock database connection for testing"""
    with patch('pyodbc.connect') as mock_connect:
        mock_conn = Mock()
        mock_cursor = Mock()
        mock_conn.cursor.return_value = mock_cursor
        mock_connect.return_value = mock_conn
        yield mock_conn, mock_cursor

@pytest.fixture
def sample_user():
    """Sample user data for testing"""
    return {
        "id": 1,
        "email": "test@example.com",
        "role": "user",
        "created_at": "2025-06-16T10:00:00Z"
    }

@pytest.fixture
def sample_jwt_token():
    """Sample JWT token for authenticated requests"""
    import jwt
    payload = {"user_id": 1, "email": "test@example.com"}
    return jwt.encode(payload, "test_secret", algorithm="HS256")

@pytest.fixture
def auth_headers(sample_jwt_token):
    """Authorization headers for authenticated requests"""
    return {"Authorization": f"Bearer {sample_jwt_token}"}

# Test environment setup
@pytest.fixture(autouse=True)
def setup_test_env():
    """Set up test environment variables"""
    test_env = {
        "JWT_SECRET": "test_secret",
        "SQL_SERVER": TEST_DB_CONFIG["SQL_SERVER"],
        "SQL_DATABASE": TEST_DB_CONFIG["SQL_DATABASE"],
        "SQL_USER": TEST_DB_CONFIG["SQL_USER"],
        "SQL_PASSWORD": TEST_DB_CONFIG["SQL_PASSWORD"],
        "API_KEY": "k",
        "OPENAI_API_KEY": "",
        "OPENAI_ASSISTANT_ID": "",
    }
    
    # Set environment variables
    for key, value in test_env.items():
        os.environ[key] = value
    
    yield
    
    # Clean up
    for key in test_env.keys():
        if key in os.environ:
            del os.environ[key]
