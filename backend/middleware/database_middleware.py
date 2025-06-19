import time
import logging
from functools import wraps
from database.connection import DatabaseConnection

logger = logging.getLogger(__name__)

class DatabaseMiddleware:
    """Middleware to handle database operations with retries and monitoring"""
    
    def __init__(self):
        self.active_connections = 0
        self.total_requests = 0
        self.failed_requests = 0
        self.retry_attempts = 0
    
    def with_db_retry(self, max_retries=3, retry_delay=0.5):
        """Decorator to retry database operations on connection pool exhaustion"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                self.total_requests += 1
                last_exception = None
                
                for attempt in range(max_retries + 1):
                    try:
                        self.active_connections += 1
                        try:
                            result = func(*args, **kwargs)
                            return result
                        finally:
                            self.active_connections -= 1
                            
                    except Exception as e:
                        last_exception = e
                        error_msg = str(e).lower()
                        
                        # Check if it's a connection pool exhaustion error
                        if "connection pool exhausted" in error_msg or "timeout" in error_msg:
                            if attempt < max_retries:
                                self.retry_attempts += 1
                                wait_time = retry_delay * (2 ** attempt)  # Exponential backoff
                                logger.warning(f"Database connection failed (attempt {attempt + 1}/{max_retries + 1}), retrying in {wait_time}s: {e}")
                                time.sleep(wait_time)
                                continue
                        
                        # If it's not a connection issue or we've exhausted retries, raise immediately
                        self.failed_requests += 1
                        raise e
                
                # If we get here, all retries failed
                self.failed_requests += 1
                raise last_exception
            
            return wrapper
        return decorator
    
    def get_stats(self):
        """Get connection pool statistics"""
        return {
            "active_connections": self.active_connections,
            "total_requests": self.total_requests,
            "failed_requests": self.failed_requests,
            "retry_attempts": self.retry_attempts,
            "success_rate": (self.total_requests - self.failed_requests) / max(self.total_requests, 1) * 100
        }

# Global middleware instance
db_middleware = DatabaseMiddleware()

def with_database_connection(max_retries=3, retry_delay=0.5):
    """Decorator for functions that need database connections with automatic retry"""
    return db_middleware.with_db_retry(max_retries, retry_delay)

def get_db_stats():
    """Get database connection statistics"""
    return db_middleware.get_stats()
