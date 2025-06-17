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
    from .chat import generate_response, verify_api_key
except ImportError:
    pass

# Import language utilities
try:
    from .language import detect_language, get_language_instruction
except ImportError:
    pass

# Import performance utilities
try:
    from .performance import should_use_rag, perf_monitor, is_general_question
except ImportError:
    pass

# Import RAG utilities
try:
    from .rag import retrieve_context, initialize_rag
except ImportError:
    pass

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
    'generate_response',
    'verify_api_key',
    
    # Language utilities (if available)
    'detect_language',
    'get_language_instruction',
    
    # Performance utilities (if available)
    'should_use_rag',
    'perf_monitor',
    'is_general_question',
    
    # RAG utilities (if available)
    'retrieve_context',
    'initialize_rag',
    
    # Development utilities (if available)
    'get_database_connection'
]