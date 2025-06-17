"""
Test configuration and fixtures
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import tempfile
import os

# Test database configuration
TEST_DB_CONFIG = {
    "SQL_SERVER": "localhost",
    "SQL_DATABASE": "test_chatbot_db",
    "SQL_USER": "test_user",
    "SQL_PASSWORD": "test_password"
}

@pytest.fixture
def test_client():
    """Create a test client for the FastAPI app"""
    # Import here to avoid circular imports
    from main import app
    return TestClient(app)

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
        "SQL_PASSWORD": TEST_DB_CONFIG["SQL_PASSWORD"]
    }
    
    # Set environment variables
    for key, value in test_env.items():
        os.environ[key] = value
    
    yield
    
    # Clean up
    for key in test_env.keys():
        if key in os.environ:
            del os.environ[key]
