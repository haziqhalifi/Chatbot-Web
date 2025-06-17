"""
Base service class with common patterns
"""
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class ServiceResult:
    """Standard service result wrapper"""
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    error_code: Optional[str] = None

class BaseService(ABC):
    """Base service class with common functionality"""
    
    def __init__(self, db_repository=None):
        self.db_repository = db_repository
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def _success(self, data: Any = None, message: str = None) -> ServiceResult:
        """Create a successful service result"""
        return ServiceResult(success=True, data=data, error=message)
    
    def _error(self, error: str, error_code: str = None) -> ServiceResult:
        """Create an error service result"""
        self.logger.error(f"Service error: {error_code or 'UNKNOWN'} - {error}")
        return ServiceResult(success=False, error=error, error_code=error_code)
    
    def _handle_exception(self, e: Exception, context: str = "Unknown operation") -> ServiceResult:
        """Standard exception handling"""
        error_msg = f"{context} failed: {str(e)}"
        self.logger.exception(error_msg)
        return self._error(error_msg, "INTERNAL_ERROR")

# Example: Chat Service Implementation
class ChatService(BaseService):
    """Service for handling chat operations"""
    
    def create_session(self, user_id: int, title: Optional[str] = None) -> ServiceResult:
        """Create a new chat session"""
        try:
            # Validate input
            if not user_id or user_id <= 0:
                return self._error("Invalid user ID", "INVALID_INPUT")
            
            # Business logic here
            session_data = {
                "user_id": user_id,
                "title": title or f"Chat Session {user_id}",
                "created_at": "2025-06-16T10:00:00Z"  # This would come from actual creation
            }
            
            self.logger.info(f"Created chat session for user {user_id}")
            return self._success(session_data)
            
        except Exception as e:
            return self._handle_exception(e, "Create chat session")
    
    def send_message(self, session_id: int, user_id: int, content: str) -> ServiceResult:
        """Send a message in a chat session"""
        try:
            # Validation
            if not content.strip():
                return self._error("Message content cannot be empty", "INVALID_INPUT")
            
            if len(content) > 4000:
                return self._error("Message too long", "MESSAGE_TOO_LONG")
            
            # Business logic would go here
            # - Save message to database
            # - Generate AI response
            # - Return both messages
            
            response_data = {
                "user_message": {
                    "sender": "user",
                    "content": content,
                    "timestamp": "2025-06-16T10:00:00Z"
                },
                "bot_response": {
                    "sender": "bot",
                    "content": "This is a sample response",
                    "timestamp": "2025-06-16T10:00:01Z"
                }
            }
            
            return self._success(response_data)
            
        except Exception as e:
            return self._handle_exception(e, "Send message")

# Dependency injection helper
class ServiceContainer:
    """Simple service container for dependency injection"""
    
    def __init__(self):
        self._services = {}
    
    def register(self, service_class, instance):
        """Register a service instance"""
        self._services[service_class] = instance
    
    def get(self, service_class):
        """Get a service instance"""
        return self._services.get(service_class)
    
    def register_singleton(self, service_class, *args, **kwargs):
        """Register a singleton service"""
        if service_class not in self._services:
            self._services[service_class] = service_class(*args, **kwargs)
        return self._services[service_class]

# Global container instance
container = ServiceContainer()
