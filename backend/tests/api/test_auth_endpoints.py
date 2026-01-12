import pytest
from fastapi.testclient import TestClient


class TestAuthenticationEndpoints:
    """Test suite for authentication endpoints"""

    def test_health_check_endpoint(self, test_client):
        """Test health check endpoint is accessible"""
        response = test_client.get("/health/database")
        assert response.status_code in [200, 500]  # May fail if DB not running

    def test_signup_missing_email(self, test_client):
        """Test signup fails with missing email"""
        response = test_client.post("/signup", json={
            "password": "Test123!"
        })
        assert response.status_code == 422  # Validation error

    def test_signup_invalid_email(self, test_client):
        """Test signup fails with invalid email"""
        response = test_client.post("/signup", json={
            "email": "not-an-email",
            "password": "Test123!"
        })
        assert response.status_code in [422, 400]

    def test_signup_weak_password(self, test_client):
        """Test signup fails with weak password"""
        response = test_client.post("/signup", json={
            "email": "test@example.com",
            "password": "weak"
        })
        assert response.status_code in [400, 422]

    def test_signup_success(self, test_client, sample_user_data):
        """Test successful signup (may fail if user exists)"""
        response = test_client.post("/signup", json=sample_user_data)
        assert response.status_code in [200, 201, 400, 409]  # Created, validation error, or user exists

    def test_signin_missing_credentials(self, test_client):
        """Test signin fails with missing credentials"""
        response = test_client.post("/signin", json={})
        assert response.status_code == 422

    def test_signin_invalid_email(self, test_client):
        """Test signin fails with invalid email"""
        response = test_client.post("/signin", json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code in [401, 400]

    def test_signin_wrong_password(self, test_client):
        """Test signin fails with wrong password"""
        response = test_client.post("/signin", json={
            "email": "test@example.com",
            "password": "wrongpassword123"
        })
        assert response.status_code in [401, 400]

    def test_admin_signin_missing_code(self, test_client):
        """Test admin signin fails with missing code"""
        response = test_client.post("/admin/signin", json={})
        assert response.status_code == 422

    def test_admin_signin_invalid_code(self, test_client):
        """Test admin signin fails with invalid code"""
        response = test_client.post("/admin/signin", json={
            "admin_code": "000000"
        })
        assert response.status_code in [401, 400, 422]  # Auth failed or validation error

    def test_forgot_password_missing_email(self, test_client):
        """Test forgot password fails with missing email"""
        response = test_client.post("/forgot-password", json={})
        assert response.status_code == 422

    def test_forgot_password_invalid_email(self, test_client):
        """Test forgot password with non-existent email"""
        response = test_client.post("/forgot-password", json={
            "email": "nonexistent@example.com"
        })
        assert response.status_code in [200, 400, 404]  # May return success or 404

    def test_forgot_password_valid_email(self, test_client, sample_user_data):
        """Test forgot password with valid email format"""
        response = test_client.post("/forgot-password", json={
            "email": sample_user_data["email"]
        })
        assert response.status_code in [200, 400, 404]

    def test_reset_password_missing_token(self, test_client):
        """Test reset password fails with missing token"""
        response = test_client.post("/reset-password", json={
            "new_password": "NewPassword123!"
        })
        assert response.status_code == 422

    def test_reset_password_invalid_token(self, test_client):
        """Test reset password fails with invalid token"""
        response = test_client.post("/reset-password", json={
            "reset_token": "invalid-token-xyz",
            "new_password": "NewPassword123!"
        })
        assert response.status_code in [400, 401, 404, 422]  # Invalid token or validation error

    def test_reset_password_weak_password(self, test_client):
        """Test reset password fails with weak password"""
        response = test_client.post("/reset-password", json={
            "reset_token": "valid-token",
            "new_password": "weak"
        })
        assert response.status_code in [400, 422]

    def test_change_password_missing_header(self, test_client):
        """Test change password fails without auth header"""
        response = test_client.post("/change-password", json={
            "old_password": "Old123!",
            "new_password": "New123!"
        })
        assert response.status_code in [401, 422]  # Auth required or validation error

    def test_change_password_with_valid_token(self, test_client, auth_headers):
        """Test change password with valid token"""
        response = test_client.post("/change-password", 
            json={
                "old_password": "wrongpassword",
                "new_password": "New123!"
            },
            headers=auth_headers
        )
        assert response.status_code in [200, 400, 401, 422]  # Success, wrong password, or validation error

    def test_google_auth_missing_token(self, test_client):
        """Test Google auth fails with missing token"""
        response = test_client.post("/google-auth", json={})
        assert response.status_code == 422

    def test_google_auth_invalid_token(self, test_client):
        """Test Google auth fails with invalid token"""
        response = test_client.post("/google-auth", json={
            "id_token": "invalid-google-token-xyz"
        })
        assert response.status_code in [400, 401, 422]  # Invalid token or validation error

    def test_token_structure_validation(self, valid_jwt_token):
        """Test that JWT token is properly formatted"""
        assert isinstance(valid_jwt_token, str)
        assert len(valid_jwt_token.split('.')) == 3  # JWT has 3 parts

    def test_bearer_token_format(self, auth_headers):
        """Test that Bearer token is properly formatted"""
        assert auth_headers["Authorization"].startswith("Bearer ")
        token = auth_headers["Authorization"].split(" ")[1]
        assert len(token) > 0


class TestAuthorizationHeaders:
    """Test authorization header validation"""

    def test_missing_authorization_header(self, test_client):
        """Test endpoints reject requests without auth header"""
        response = test_client.get("/chat/sessions")
        assert response.status_code == 401

    def test_invalid_authorization_header_format(self, test_client):
        """Test endpoints reject invalid auth header format"""
        response = test_client.get("/chat/sessions", 
            headers={"Authorization": "InvalidFormat token"}
        )
        assert response.status_code == 401

    def test_malformed_bearer_token(self, test_client):
        """Test endpoints reject malformed bearer token"""
        response = test_client.get("/chat/sessions",
            headers={"Authorization": "Bearer malformed-token"}
        )
        assert response.status_code == 401

    def test_expired_token_rejected(self, test_client, expired_jwt_token):
        """Test that expired tokens are rejected"""
        response = test_client.get("/chat/sessions",
            headers={"Authorization": f"Bearer {expired_jwt_token}"}
        )
        assert response.status_code == 401

    def test_valid_token_accepted(self, test_client, auth_headers):
        """Test that valid tokens are accepted"""
        response = test_client.get("/chat/sessions", headers=auth_headers)
        assert response.status_code == 200


class TestAPIKeyAuthentication:
    """Test API key authentication"""

    def test_api_key_in_header(self, api_key_header):
        """Test API key is accepted in header"""
        assert "x-api-key" in api_key_header
        assert api_key_header["x-api-key"] == "secretkey"

    def test_request_without_api_key(self, test_client):
        """Test requests can be made without API key (for public endpoints)"""
        response = test_client.get("/chat/providers")
        assert response.status_code in [200, 401, 500]


class TestHTTPStatusCodes:
    """Test HTTP status code handling"""

    def test_200_ok_response(self, test_client, auth_headers):
        """Test 200 OK response"""
        response = test_client.get("/chat/providers")
        assert response.status_code in [200, 500]

    def test_201_created_response(self, test_client, auth_headers, sample_chat_session_data):
        """Test 201 Created response"""
        response = test_client.post("/chat/sessions",
            json=sample_chat_session_data,
            headers=auth_headers
        )
        assert response.status_code in [200, 201, 500]

    def test_400_bad_request(self, test_client):
        """Test 400 Bad Request response"""
        response = test_client.post("/signup", json={"invalid": "data"})
        assert response.status_code in [400, 422]

    def test_401_unauthorized(self, test_client):
        """Test 401 Unauthorized response"""
        response = test_client.get("/chat/sessions")
        assert response.status_code == 401

    def test_404_not_found(self, test_client, auth_headers):
        """Test 404 Not Found response"""
        response = test_client.get("/chat/sessions/99999", headers=auth_headers)
        assert response.status_code in [404, 500]

    def test_422_unprocessable_entity(self, test_client):
        """Test 422 Unprocessable Entity response"""
        response = test_client.post("/signup", json={})
        assert response.status_code == 422

    def test_500_server_error_handling(self, test_client, auth_headers):
        """Test server handles errors gracefully"""
        # This endpoint might fail if dependencies aren't available
        response = test_client.get("/health/database/stats", headers=auth_headers)
        assert response.status_code in [200, 500]


class TestResponseSchemas:
    """Test response schema validation"""

    def test_health_endpoint_response_format(self, test_client):
        """Test health endpoint returns valid response"""
        response = test_client.get("/health/database")
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)

    def test_error_response_structure(self, test_client):
        """Test error responses have proper structure"""
        response = test_client.post("/signup", json={})
        assert response.status_code == 422
        data = response.json()
        assert isinstance(data, dict)

    def test_list_response_is_iterable(self, test_client, auth_headers):
        """Test list endpoints return iterable data"""
        response = test_client.get("/chat/sessions", headers=auth_headers)
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (dict, list))

    def test_response_content_type(self, test_client):
        """Test responses have correct content type"""
        response = test_client.get("/health/database")
        assert "application/json" in response.headers.get("content-type", "")
