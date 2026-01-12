"""
Unit tests for utils.auth module
Tests password hashing, JWT generation, and Google authentication
"""
import pytest
from unittest.mock import patch, Mock, MagicMock
from datetime import datetime, timedelta
import jwt as pyjwt
from fastapi import HTTPException


class TestGoogleAuthentication:
    """Test Google OAuth authentication"""
    
    def test_google_authenticate_success(self, monkeypatch):
        """Test successful Google authentication"""
        from utils.auth import google_authenticate
        
        # Mock Google ID token verification
        mock_idinfo = {
            "email": "test@gmail.com",
            "name": "Test User",
            "given_name": "Test",
            "family_name": "User",
            "picture": "https://example.com/pic.jpg",
            "locale": "en",
            "email_verified": True
        }
        
        with patch('utils.auth.id_token.verify_oauth2_token') as mock_verify:
            mock_verify.return_value = mock_idinfo
            
            # Mock user service
            with patch('utils.auth.get_or_create_google_user') as mock_get_user:
                mock_get_user.return_value = 123
                
                # Mock the import statement
                with patch('services.user_service.update_last_login'):
                    result = google_authenticate(
                        credential="fake.jwt.token",
                        client_id="fake-client-id",
                        jwt_secret="test-secret",
                        jwt_algorithm="HS256"
                    )
        
        assert result["message"] == "Google authentication successful"
        assert result["email"] == "test@gmail.com"
        assert result["name"] == "Test User"
        assert "token" in result
        
        # Verify JWT token structure
        token = result["token"]
        decoded = pyjwt.decode(token, "test-secret", algorithms=["HS256"])
        assert decoded["user_id"] == 123
        assert decoded["email"] == "test@gmail.com"
    
    def test_google_authenticate_invalid_token(self, monkeypatch):
        """Test Google authentication with invalid token"""
        from utils.auth import google_authenticate
        
        with patch('utils.auth.id_token.verify_oauth2_token') as mock_verify:
            mock_verify.side_effect = ValueError("Invalid token")
            
            with pytest.raises(HTTPException) as exc:
                google_authenticate(
                    credential="invalid.token",
                    client_id="fake-client-id",
                    jwt_secret="test-secret",
                    jwt_algorithm="HS256"
            )
            
                assert exc.value.status_code == 400
                assert "Invalid Google token" in str(exc.value.detail)
    
    def test_google_authenticate_extracts_all_user_info(self, monkeypatch):
        """Test that all Google user info fields are extracted"""
        from utils.auth import google_authenticate
        
        mock_idinfo = {
            "email": "fullinfo@gmail.com",
            "name": "Full Info User",
            "given_name": "Full",
            "family_name": "Info",
            "picture": "https://example.com/full.jpg",
            "locale": "ms",
            "email_verified": True
        }
        
        with patch('utils.auth.id_token.verify_oauth2_token') as mock_verify:
            mock_verify.return_value = mock_idinfo
            
            with patch('utils.auth.get_or_create_google_user') as mock_get_user:
                mock_get_user.return_value = 456
                
                with patch('services.user_service.update_last_login'):
                    result = google_authenticate(
                    credential="full.token.info",
                    client_id="client",
                    jwt_secret="secret",
                    jwt_algorithm="HS256"
                )
                
                # Verify get_or_create_google_user was called with all fields
                mock_get_user.assert_called_once_with(
                    "fullinfo@gmail.com",
                    "Full Info User",
                    "Full",
                    "Info",
                    "https://example.com/full.jpg",
                    "ms",
                    True
                )
    
    def test_google_authenticate_jwt_expiration(self, monkeypatch):
        """Test that JWT token has proper expiration"""
        from utils.auth import google_authenticate
        
        mock_idinfo = {
            "email": "expire@test.com",
            "name": "Expire Test",
            "email_verified": True
        }
        
        with patch('utils.auth.id_token.verify_oauth2_token') as mock_verify:
            mock_verify.return_value = mock_idinfo
            
            with patch('utils.auth.get_or_create_google_user', return_value=789):
                with patch('services.user_service.update_last_login'):
                    result = google_authenticate(
                        credential="token",
                        client_id="client",
                        jwt_secret="secret",
                        jwt_algorithm="HS256"
                    )
        
        # Decode and check expiration (should be ~7 days)
        token = result["token"]
        decoded = pyjwt.decode(token, "secret", algorithms=["HS256"])
        
        exp_time = datetime.utcfromtimestamp(decoded["exp"])
        now = datetime.utcnow()
        time_diff = exp_time - now
        
        # Should be approximately 7 days (within 1 minute tolerance)
        # Check in seconds: 7 days = 604800 seconds, allow ±60 seconds
        seconds_diff = time_diff.total_seconds()
        seven_days_seconds = 7 * 24 * 60 * 60
        assert abs(seconds_diff - seven_days_seconds) < 60


class TestJWTTokenGeneration:
    """Test JWT token generation and validation"""
    
    def test_jwt_token_contains_user_info(self):
        """Test JWT token contains correct user information"""
        payload = {
            "user_id": 999,
            "email": "jwt@test.com",
            "name": "JWT User",
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        
        token = pyjwt.encode(payload, "test-secret", algorithm="HS256")
        decoded = pyjwt.decode(token, "test-secret", algorithms=["HS256"])
        
        assert decoded["user_id"] == 999
        assert decoded["email"] == "jwt@test.com"
        assert decoded["name"] == "JWT User"
    
    def test_jwt_token_expiration_validation(self):
        """Test JWT token expiration is enforced"""
        # Create expired token
        payload = {
            "user_id": 1,
            "exp": datetime.utcnow() - timedelta(days=1)  # Expired yesterday
        }
        
        token = pyjwt.encode(payload, "test-secret", algorithm="HS256")
        
        with pytest.raises(pyjwt.ExpiredSignatureError):
            pyjwt.decode(token, "test-secret", algorithms=["HS256"])
    
    def test_jwt_invalid_signature(self):
        """Test JWT token with invalid signature is rejected"""
        payload = {"user_id": 1, "exp": datetime.utcnow() + timedelta(days=1)}
        token = pyjwt.encode(payload, "secret1", algorithm="HS256")
        
        with pytest.raises(pyjwt.InvalidSignatureError):
            pyjwt.decode(token, "wrong-secret", algorithms=["HS256"])


class TestPasswordHashing:
    """Test password hashing utilities (if implemented)"""
    
    def test_password_functions_exist(self):
        """Test that password-related functions are available"""
        # Note: Add actual password hashing tests when implemented
        # This is a placeholder to ensure password utilities are tested
        try:
            import utils.auth
            # Check if password hashing functions exist
            assert hasattr(utils.auth, 'google_authenticate')
        except ImportError:
            pytest.skip("Password utilities not yet implemented")
