"""
Service layer for business logic
"""

# Import base service classes
from .base import BaseService, ServiceResult, ServiceContainer, container

# Import specific services
try:
    from .chat_service import ChatService
except ImportError:
    pass

try:
    from .user_service import create_user, verify_user
except ImportError:
    pass

try:
    from .notification_service import create_welcome_notification, create_notifications_table
except ImportError:
    pass

try:
    from .subscription_service import create_subscriptions_table
except ImportError:
    pass

__all__ = [
    # Base classes
    'BaseService',
    'ServiceResult', 
    'ServiceContainer',
    'container',
    
    # Specific services (if available)
    'ChatService',
    'create_user',
    'verify_user',
    'create_welcome_notification',
    'create_notifications_table',
    'create_subscriptions_table'
]
