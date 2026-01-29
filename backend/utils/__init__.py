"""
Utility modules for the chatbot application
"""

# Import commonly used utilities for easy access
from .security import (
    validate_password, 
    hash_password, 
    verify_password, 
    generate_secure_token,
    password_validator,
    simple_hasher
)

# Import auth utilities if they exist
try:
    from .auth import *
except ImportError:
    pass

# Import chat utilities
try:
    from .chat import verify_api_key
except ImportError:
    pass



# Performance and RAG utilities removed

# Development database utilities
try:
    from .dev_database import get_database_connection
except ImportError:
    pass

__all__ = [
    # Security utilities
    'validate_password',
    'hash_password', 
    'verify_password',
    'generate_secure_token',
    'password_validator',
    'secure_hasher',
    
    # Chat utilities (if available)
    'verify_api_key',
    
    # Development utilities (if available)
    'get_database_connection'
]