"""
Security utilities for password validation and hashing
"""
import re
import secrets
import string
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

# Simple password validation without external dependencies for now
class PasswordValidator:
    """Password validation with security requirements"""
    
    def __init__(self):
        self.min_length = 8
        self.max_length = 128
        self.require_uppercase = True
        self.require_lowercase = True
        self.require_digits = True
        self.require_special = True
        self.special_chars = "!@#$%^&*(),.?\":{}|<>"
    
    def validate_password(self, password: str) -> Dict[str, Any]:
        """
        Validate password strength and return detailed feedback
        Returns: {"valid": bool, "errors": list, "strength": str}
        """
        errors = []
        
        # Length check
        if len(password) < self.min_length:
            errors.append(f"Password must be at least {self.min_length} characters long")
        
        if len(password) > self.max_length:
            errors.append(f"Password must be no more than {self.max_length} characters long")
        
        # Character requirements
        if self.require_uppercase and not re.search(r"[A-Z]", password):
            errors.append("Password must contain at least one uppercase letter")
        
        if self.require_lowercase and not re.search(r"[a-z]", password):
            errors.append("Password must contain at least one lowercase letter")
        
        if self.require_digits and not re.search(r"\d", password):
            errors.append("Password must contain at least one digit")
        
        if self.require_special and not re.search(f"[{re.escape(self.special_chars)}]", password):
            errors.append(f"Password must contain at least one special character ({self.special_chars})")
        
        # Common password patterns to avoid
        common_patterns = [
            r"123456",
            r"password",
            r"qwerty",
            r"admin",
            r"letmein"
        ]
        
        for pattern in common_patterns:
            if re.search(pattern, password.lower()):
                errors.append("Password contains common patterns that are not secure")
                break
        
        # Calculate strength
        strength = self._calculate_strength(password)
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "strength": strength
        }
    
    def _calculate_strength(self, password: str) -> str:
        """Calculate password strength score"""
        score = 0
        
        # Length bonus
        if len(password) >= 8:
            score += 1
        if len(password) >= 12:
            score += 1
        if len(password) >= 16:
            score += 1
        
        # Character variety
        if re.search(r"[a-z]", password):
            score += 1
        if re.search(r"[A-Z]", password):
            score += 1
        if re.search(r"\d", password):
            score += 1
        if re.search(f"[{re.escape(self.special_chars)}]", password):
            score += 1
        
        # Entropy bonus for mixed characters
        if len(set(password)) > len(password) * 0.7:
            score += 1
        
        if score <= 3:
            return "weak"
        elif score <= 5:
            return "medium"
        elif score <= 7:
            return "strong"
        else:
            return "very_strong"

class SimpleHasher:
    """Simple password hashing for development (use bcrypt in production)"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Simple hash for development - replace with bcrypt in production"""
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest()
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return SimpleHasher.hash_password(plain_password) == hashed_password

class TokenGenerator:
    """Secure token generation utilities"""
    
    @staticmethod
    def generate_secure_token(length: int = 32) -> str:
        """Generate a cryptographically secure random token"""
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(length))
    
    @staticmethod
    def generate_api_key(prefix: str = "ak", length: int = 32) -> str:
        """Generate an API key with prefix"""
        token = TokenGenerator.generate_secure_token(length)
        return f"{prefix}_{token}"
    
    @staticmethod
    def generate_session_id(length: int = 24) -> str:
        """Generate a session ID"""
        return TokenGenerator.generate_secure_token(length)

# Global instances
password_validator = PasswordValidator()
simple_hasher = SimpleHasher()
token_generator = TokenGenerator()

# Utility functions for easy import
def validate_password(password: str) -> Dict[str, Any]:
    """Validate password strength"""
    return password_validator.validate_password(password)

def hash_password(password: str) -> str:
    """Hash a password"""
    return simple_hasher.hash_password(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password"""
    return simple_hasher.verify_password(plain_password, hashed_password)

def generate_secure_token(length: int = 32) -> str:
    """Generate a secure token"""
    return token_generator.generate_secure_token(length)
