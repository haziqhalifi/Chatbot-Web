"""
Unit tests for utils.email_sender module
Tests email sending functionality and SMTP configuration
"""
import pytest
from unittest.mock import patch, Mock, MagicMock
import smtplib


class TestEmailConfiguration:
    """Test email configuration from environment variables"""
    
    def test_env_function_returns_value(self, monkeypatch):
        """Test _env helper returns environment variable value"""
        from utils.email_sender import _env
        
        monkeypatch.setenv("TEST_VAR", "test_value")
        assert _env("TEST_VAR") == "test_value"
    
    def test_env_function_returns_default(self, monkeypatch):
        """Test _env returns default when variable not set"""
        from utils.email_sender import _env
        
        monkeypatch.delenv("MISSING_VAR", raising=False)
        assert _env("MISSING_VAR", "default") == "default"
    
    def test_env_function_handles_empty_string(self, monkeypatch):
        """Test _env treats empty string as not set"""
        from utils.email_sender import _env
        
        monkeypatch.setenv("EMPTY_VAR", "")
        assert _env("EMPTY_VAR", "default") == "default"


class TestSendEmail:
    """Test email sending functionality"""
    
    def test_send_email_missing_smtp_host(self, monkeypatch):
        """Test send_email raises error when SMTP_HOST not configured"""
        from utils.email_sender import send_email
        
        monkeypatch.delenv("SMTP_HOST", raising=False)
        
        with pytest.raises(RuntimeError, match="SMTP_HOST is not configured"):
            send_email(
                to_email="test@example.com",
                subject="Test",
                body_text="Test message"
            )
    
    def test_send_email_success_with_auth(self, monkeypatch):
        """Test successful email sending with authentication"""
        from utils.email_sender import send_email
        
        # Set up environment
        monkeypatch.setenv("SMTP_HOST", "smtp.gmail.com")
        monkeypatch.setenv("SMTP_PORT", "587")
        monkeypatch.setenv("SMTP_USER", "sender@gmail.com")
        monkeypatch.setenv("SMTP_PASSWORD", "password123")
        monkeypatch.setenv("SMTP_FROM", "noreply@example.com")
        monkeypatch.setenv("SMTP_TLS", "true")
        
        # Mock SMTP
        mock_server = MagicMock()
        
        with patch('utils.email_sender.smtplib.SMTP') as mock_smtp:
            mock_smtp.return_value.__enter__.return_value = mock_server
            
            send_email(
                to_email="recipient@example.com",
                subject="Test Subject",
                body_text="Test body content"
            )
            
            # Verify SMTP calls
            mock_smtp.assert_called_once_with("smtp.gmail.com", 587, timeout=20)
            mock_server.ehlo.assert_called()
            mock_server.starttls.assert_called_once()
            mock_server.login.assert_called_once_with("sender@gmail.com", "password123")
            mock_server.send_message.assert_called_once()
    
    def test_send_email_without_auth(self, monkeypatch):
        """Test email sending without authentication"""
        from utils.email_sender import send_email
        
        monkeypatch.setenv("SMTP_HOST", "localhost")
        monkeypatch.setenv("SMTP_PORT", "25")
        monkeypatch.delenv("SMTP_USER", raising=False)
        monkeypatch.delenv("SMTP_PASSWORD", raising=False)
        monkeypatch.setenv("SMTP_TLS", "false")
        
        mock_server = MagicMock()
        
        with patch('utils.email_sender.smtplib.SMTP') as mock_smtp:
            mock_smtp.return_value.__enter__.return_value = mock_server
            
            send_email(
                to_email="test@local.com",
                subject="Local Test",
                body_text="Local message"
            )
            
            # Should NOT call login when no user configured
            mock_server.login.assert_not_called()
            mock_server.send_message.assert_called_once()
    
    def test_send_email_with_ssl(self, monkeypatch):
        """Test email sending with SSL (implicit TLS)"""
        from utils.email_sender import send_email
        
        monkeypatch.setenv("SMTP_HOST", "smtp.gmail.com")
        monkeypatch.setenv("SMTP_PORT", "465")
        monkeypatch.setenv("SMTP_USER", "user@gmail.com")
        monkeypatch.setenv("SMTP_PASSWORD", "pass")
        monkeypatch.setenv("SMTP_SSL", "true")
        
        mock_server = MagicMock()
        
        with patch('utils.email_sender.smtplib.SMTP_SSL') as mock_smtp_ssl:
            mock_smtp_ssl.return_value.__enter__.return_value = mock_server
            
            send_email(
                to_email="test@example.com",
                subject="SSL Test",
                body_text="SSL message"
            )
            
            # Should use SMTP_SSL, not SMTP
            mock_smtp_ssl.assert_called_once_with("smtp.gmail.com", 465, timeout=20)
            # Should NOT call starttls with SMTP_SSL
            mock_server.starttls.assert_not_called()
    
    def test_send_email_default_port(self, monkeypatch):
        """Test default SMTP port is 587"""
        from utils.email_sender import send_email
        
        monkeypatch.setenv("SMTP_HOST", "smtp.test.com")
        monkeypatch.delenv("SMTP_PORT", raising=False)
        
        mock_server = MagicMock()
        
        with patch('utils.email_sender.smtplib.SMTP') as mock_smtp:
            mock_smtp.return_value.__enter__.return_value = mock_server
            
            send_email(
                to_email="test@test.com",
                subject="Port Test",
                body_text="Testing default port"
            )
            
            # Default port should be 587
            mock_smtp.assert_called_once_with("smtp.test.com", 587, timeout=20)
    
    def test_send_email_message_structure(self, monkeypatch):
        """Test email message has correct structure"""
        from utils.email_sender import send_email
        
        monkeypatch.setenv("SMTP_HOST", "smtp.test.com")
        monkeypatch.setenv("SMTP_FROM", "sender@test.com")
        
        mock_server = MagicMock()
        sent_message = None
        
        def capture_message(msg):
            nonlocal sent_message
            sent_message = msg
        
        mock_server.send_message.side_effect = capture_message
        
        with patch('utils.email_sender.smtplib.SMTP') as mock_smtp:
            mock_smtp.return_value.__enter__.return_value = mock_server
            
            send_email(
                to_email="recipient@test.com",
                subject="Structure Test",
                body_text="This is the body"
            )
        
        # Verify message was sent
        assert mock_server.send_message.called
    
    def test_send_email_timeout_configuration(self, monkeypatch):
        """Test SMTP timeout can be configured"""
        from utils.email_sender import send_email
        
        monkeypatch.setenv("SMTP_HOST", "smtp.test.com")
        monkeypatch.setenv("SMTP_TIMEOUT", "30")
        
        mock_server = MagicMock()
        
        with patch('utils.email_sender.smtplib.SMTP') as mock_smtp:
            mock_smtp.return_value.__enter__.return_value = mock_server
            
            send_email(
                to_email="test@test.com",
                subject="Timeout Test",
                body_text="Testing timeout"
            )
            
            # Should use configured timeout
            mock_smtp.assert_called_once_with("smtp.test.com", 587, timeout=30)
    
    def test_send_email_connection_error(self, monkeypatch):
        """Test email sending handles connection errors"""
        from utils.email_sender import send_email
        
        monkeypatch.setenv("SMTP_HOST", "invalid.smtp.server")
        
        with patch('utils.email_sender.smtplib.SMTP') as mock_smtp:
            mock_smtp.side_effect = smtplib.SMTPConnectError(421, "Cannot connect")
            
            with pytest.raises(smtplib.SMTPConnectError):
                send_email(
                    to_email="test@test.com",
                    subject="Error Test",
                    body_text="Should fail"
                )
    
    def test_send_email_authentication_error(self, monkeypatch):
        """Test email sending handles authentication errors"""
        from utils.email_sender import send_email
        
        monkeypatch.setenv("SMTP_HOST", "smtp.test.com")
        monkeypatch.setenv("SMTP_USER", "user@test.com")
        monkeypatch.setenv("SMTP_PASSWORD", "wrong_password")
        
        mock_server = MagicMock()
        mock_server.login.side_effect = smtplib.SMTPAuthenticationError(535, "Auth failed")
        
        with patch('utils.email_sender.smtplib.SMTP') as mock_smtp:
            mock_smtp.return_value.__enter__.return_value = mock_server
            
            with pytest.raises(smtplib.SMTPAuthenticationError):
                send_email(
                    to_email="test@test.com",
                    subject="Auth Error Test",
                    body_text="Should fail auth"
                )
