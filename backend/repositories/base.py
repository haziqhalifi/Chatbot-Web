"""
Database repository pattern implementation
"""
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any, Tuple
from contextlib import contextmanager
import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseConfig:
    """Database configuration"""
    SQL_SERVER = os.getenv("SQL_SERVER")
    SQL_DATABASE = os.getenv("SQL_DATABASE")
    SQL_USER = os.getenv("SQL_USER")
    SQL_PASSWORD = os.getenv("SQL_PASSWORD")
    
    @classmethod
    def get_connection_string(cls) -> str:
        return (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={cls.SQL_SERVER};"
            f"DATABASE={cls.SQL_DATABASE};"
            f"UID={cls.SQL_USER};"
            f"PWD={cls.SQL_PASSWORD}"
        )

class BaseRepository(ABC):
    """Base repository class with common database operations"""
    
    def __init__(self):
        self.conn_str = DatabaseConfig.get_connection_string()
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = None
        try:
            conn = pyodbc.connect(self.conn_str)
            yield conn
        except Exception as e:
            if conn:
                conn.rollback()
            raise e
        finally:
            if conn:
                conn.close()
    
    def execute_query(self, query: str, params: Tuple = None) -> List[Dict]:
        """Execute a SELECT query and return results as list of dictionaries"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params or ())
            
            # Get column names
            columns = [desc[0] for desc in cursor.description]
            
            # Convert rows to dictionaries
            results = []
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            
            return results
    
    def execute_command(self, command: str, params: Tuple = None) -> int:
        """Execute INSERT, UPDATE, DELETE commands"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(command, params or ())
            conn.commit()
            return cursor.rowcount
    
    def execute_scalar(self, query: str, params: Tuple = None) -> Any:
        """Execute query and return single value"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params or ())
            result = cursor.fetchone()
            return result[0] if result else None

# Example: User Repository
class UserRepository(BaseRepository):
    """Repository for user operations"""
    
    def find_by_id(self, user_id: int) -> Optional[Dict]:
        """Find user by ID"""
        query = "SELECT id, email, role, created_at FROM users WHERE id = ?"
        results = self.execute_query(query, (user_id,))
        return results[0] if results else None
    
    def find_by_email(self, email: str) -> Optional[Dict]:
        """Find user by email"""
        query = "SELECT id, email, role, created_at FROM users WHERE email = ?"
        results = self.execute_query(query, (email,))
        return results[0] if results else None
    
    def create(self, email: str, password_hash: str, role: str = 'user') -> int:
        """Create new user and return user ID"""
        command = """
            INSERT INTO users (email, password_hash, role, created_at)
            OUTPUT INSERTED.id
            VALUES (?, ?, ?, GETUTCDATE())
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(command, (email, password_hash, role))
            user_id = cursor.fetchone()[0]
            conn.commit()
            return user_id
    
    def update_last_login(self, user_id: int) -> bool:
        """Update user's last login timestamp"""
        command = "UPDATE users SET last_login = GETUTCDATE() WHERE id = ?"
        rows_affected = self.execute_command(command, (user_id,))
        return rows_affected > 0

# Example: Chat Repository
class ChatRepository(BaseRepository):
    """Repository for chat operations"""
    
    def create_session(self, user_id: int, title: Optional[str] = None) -> Dict:
        """Create new chat session"""
        command = """
            INSERT INTO chat_sessions (user_id, title, created_at, updated_at)
            OUTPUT INSERTED.id, INSERTED.created_at
            VALUES (?, ?, GETUTCDATE(), GETUTCDATE())
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(command, (user_id, title))
            result = cursor.fetchone()
            conn.commit()
            
            return {
                "id": result[0],
                "user_id": user_id,
                "title": title,
                "created_at": result[1],
                "updated_at": result[1]
            }
    
    def get_user_sessions(self, user_id: int, limit: int = 20, offset: int = 0) -> List[Dict]:
        """Get user's chat sessions with pagination"""
        query = """
            SELECT s.id, s.title, s.created_at, s.updated_at,
                   COUNT(m.id) as message_count
            FROM chat_sessions s
            LEFT JOIN chat_messages m ON s.id = m.session_id
            WHERE s.user_id = ?
            GROUP BY s.id, s.title, s.created_at, s.updated_at
            ORDER BY s.updated_at DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        """
        return self.execute_query(query, (user_id, offset, limit))
    
    def save_message(self, session_id: int, sender: str, content: str, message_type: str = 'text') -> Dict:
        """Save a chat message"""
        command = """
            INSERT INTO chat_messages (session_id, sender, content, message_type, timestamp)
            OUTPUT INSERTED.id, INSERTED.timestamp
            VALUES (?, ?, ?, ?, GETUTCDATE())
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(command, (session_id, sender, content, message_type))
            result = cursor.fetchone()
            conn.commit()
            
            # Update session's updated_at timestamp
            self.execute_command(
                "UPDATE chat_sessions SET updated_at = GETUTCDATE() WHERE id = ?",
                (session_id,)
            )
            
            return {
                "id": result[0],
                "session_id": session_id,
                "sender": sender,
                "content": content,
                "message_type": message_type,
                "timestamp": result[1]
            }

# Repository factory
class RepositoryFactory:
    """Factory for creating repository instances"""
    
    _instances = {}
    
    @classmethod
    def get_user_repository(cls) -> UserRepository:
        if 'user' not in cls._instances:
            cls._instances['user'] = UserRepository()
        return cls._instances['user']
    
    @classmethod
    def get_chat_repository(cls) -> ChatRepository:
        if 'chat' not in cls._instances:
            cls._instances['chat'] = ChatRepository()
        return cls._instances['chat']
