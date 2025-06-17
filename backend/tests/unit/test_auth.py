"""
Unit tests for authentication routes
"""
import pytest
from unittest.mock import patch, Mock
from fastapi import HTTPException

class TestAuthRoutes:
    """Test authentication endpoints"""
    
    def test_signup_success(self, test_client, mock_db_connection):
        """Test successful user signup"""
        mock_conn, mock_cursor = mock_db_connection
        
        # Mock successful user creation
        with patch('users.create_user') as mock_create:
            mock_create.return_value = {"success": True, "user_id": 1}
            
            # Mock user ID retrieval for notification
            mock_cursor.fetchone.return_value = (1,)
            
            response = test_client.post("/signup", json={
                "email": "test@example.com",
                "password": "password123"
            })
            
            assert response.status_code == 200
            assert response.json()["success"] == True
            mock_create.assert_called_once_with("test@example.com", "password123")
    
    def test_signup_invalid_email(self, test_client):
        """Test signup with invalid email"""
        response = test_client.post("/signup", json={
            "email": "invalid-email",
            "password": "password123"
        })
        
        assert response.status_code == 422  # Validation error
    
    def test_signin_success(self, test_client):
        """Test successful user signin"""
        with patch('users.verify_user') as mock_verify:
            mock_verify.return_value = {
                "success": True,
                "token": "fake_jwt_token",
                "user_id": 1
            }
            
            response = test_client.post("/signin", json={
                "email": "test@example.com",
                "password": "password123"
            })
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] == True
            assert "token" in data
    
    def test_signin_invalid_credentials(self, test_client):
        """Test signin with invalid credentials"""
        with patch('users.verify_user') as mock_verify:
            mock_verify.return_value = {"success": False, "message": "Invalid credentials"}
            
            response = test_client.post("/signin", json={
                "email": "test@example.com",
                "password": "wrong_password"
            })
            
            assert response.status_code == 200  # Your current implementation returns 200
            data = response.json()
            assert data["success"] == False
    
    def test_admin_signin_invalid_code(self, test_client):
        """Test admin signin with invalid admin code"""
        response = test_client.post("/admin/signin", json={
            "email": "admin@example.com",
            "password": "password123",
            "adminCode": "INVALID_CODE"
        })
        
        assert response.status_code == 401
        assert "Invalid admin verification code" in response.json()["detail"]

class TestAuthUtilities:
    """Test authentication utility functions"""
    
    def test_get_user_id_from_token_success(self):
        """Test successful token parsing"""
        from routes.utils import get_user_id_from_token
        
        with patch('jwt.decode') as mock_decode:
            mock_decode.return_value = {"user_id": 123}
            
            user_id = get_user_id_from_token("Bearer fake_token")
            
            assert user_id == 123
            mock_decode.assert_called_once()
    
    def test_get_user_id_from_token_missing_header(self):
        """Test with missing authorization header"""
        from routes.utils import get_user_id_from_token
        
        with pytest.raises(HTTPException) as exc_info:
            get_user_id_from_token("")
        
        assert exc_info.value.status_code == 401
    
    def test_get_user_id_from_token_expired(self):
        """Test with expired token"""
        from routes.utils import get_user_id_from_token
        import jwt
        
        with patch('jwt.decode') as mock_decode:
            mock_decode.side_effect = jwt.ExpiredSignatureError()
            
            with pytest.raises(HTTPException) as exc_info:
                get_user_id_from_token("Bearer expired_token")
            
            assert exc_info.value.status_code == 401
            assert "expired" in exc_info.value.detail.lower()
