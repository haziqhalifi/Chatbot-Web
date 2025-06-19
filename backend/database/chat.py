from datetime import datetime
from .connection import DatabaseConnection, format_timestamp

def create_chat_session(user_id, title=None):
    """Create a new chat session for a user"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Auto-generate title if not provided
            if not title:
                title = f"Chat {datetime.now().strftime('%Y-%m-%d %H:%M')}"
            
            cursor.execute("""
                INSERT INTO chat_sessions (user_id, title) 
                OUTPUT INSERTED.id, INSERTED.title, INSERTED.created_at, INSERTED.updated_at
                VALUES (?, ?)
            """, (user_id, title))
            
            row = cursor.fetchone()
            if not conn.autocommit:
                conn.commit()
            cursor.close()
            
            return {
                "id": row[0],
                "user_id": user_id,
                "title": row[1],
                "created_at": format_timestamp(row[2]),
                "updated_at": format_timestamp(row[3]),
                "is_active": True
            }
            
    except Exception as e:
        print(f"Error creating chat session: {e}")
        raise

def get_user_chat_sessions(user_id, limit=20, offset=0):
    """Get user's chat sessions with pagination"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT id, title, created_at, updated_at, is_active
                FROM chat_sessions 
                WHERE user_id = ? AND is_active = 1
                ORDER BY updated_at DESC
                OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
            """, (user_id, offset, limit))
            
            sessions = []
            for row in cursor.fetchall():
                sessions.append({
                    "id": row[0],
                    "title": row[1],
                    "created_at": format_timestamp(row[2]),
                    "updated_at": format_timestamp(row[3]),
                    "is_active": bool(row[4])
                })
            
            cursor.close()
            return sessions
            
    except Exception as e:
        print(f"Error getting user chat sessions: {e}")
        raise

def get_chat_session(session_id, user_id):
    """Get specific chat session details"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT id, user_id, title, created_at, updated_at, is_active
                FROM chat_sessions 
                WHERE id = ? AND user_id = ? AND is_active = 1
            """, (session_id, user_id))
            
            row = cursor.fetchone()
            cursor.close()
            
            if not row:
                return None
                
            return {
                "id": row[0],
                "user_id": row[1],
                "title": row[2],
                "created_at": format_timestamp(row[3]),
                "updated_at": format_timestamp(row[4]),
                "is_active": bool(row[5])
            }
            
    except Exception as e:
        print(f"Error getting chat session: {e}")
        raise

def save_chat_message(session_id, sender_type, content, message_type="text"):
    """Save a chat message to a session"""
    try:
        with DatabaseConnection() as conn:
            # Temporarily disable autocommit for transaction
            conn.autocommit = False
            cursor = conn.cursor()
            
            # First verify the session exists
            cursor.execute("SELECT user_id FROM chat_sessions WHERE id = ? AND is_active = 1", (session_id,))
            if not cursor.fetchone():
                raise Exception("Session not found or inactive")
            
            # Insert the message
            cursor.execute("""
                INSERT INTO chat_messages (session_id, sender_type, content, message_type)
                OUTPUT INSERTED.id, INSERTED.timestamp
                VALUES (?, ?, ?, ?)
            """, (session_id, sender_type, content, message_type))
            
            row = cursor.fetchone()
            
            # Update session's updated_at timestamp
            cursor.execute("""
                UPDATE chat_sessions 
                SET updated_at = GETDATE() 
                WHERE id = ?
            """, (session_id,))
            
            conn.commit()
            conn.autocommit = True
            cursor.close()
            
            return {
                "id": row[0],
                "session_id": session_id,
                "sender_type": sender_type,
                "content": content,
                "message_type": message_type,
                "timestamp": format_timestamp(row[1])
            }
            
    except Exception as e:
        print(f"Error saving chat message: {e}")
        raise

def get_chat_messages(session_id, user_id, limit=50, offset=0):
    """Get messages for a chat session"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # First verify the session belongs to the user
            cursor.execute("SELECT id FROM chat_sessions WHERE id = ? AND user_id = ? AND is_active = 1", (session_id, user_id))
            if not cursor.fetchone():
                cursor.close()
                return []
            
            # Get messages
            cursor.execute("""
                SELECT id, sender_type, content, message_type, timestamp
                FROM chat_messages 
                WHERE session_id = ?
                ORDER BY timestamp ASC
                OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
            """, (session_id, offset, limit))
            
            messages = []
            for row in cursor.fetchall():
                messages.append({
                    "id": row[0],
                    "sender_type": row[1],
                    "content": row[2],
                    "message_type": row[3],
                    "timestamp": format_timestamp(row[4])
                })
            
            cursor.close()
            return messages
            
    except Exception as e:
        print(f"Error getting chat messages: {e}")
        raise

def update_chat_session_title(session_id, user_id, title):
    """Update chat session title"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE chat_sessions 
                SET title = ?, updated_at = GETDATE()
                WHERE id = ? AND user_id = ? AND is_active = 1
            """, (title, session_id, user_id))
            
            if not conn.autocommit:
                conn.commit()
            
            result = cursor.rowcount > 0
            cursor.close()
            return result
            
    except Exception as e:
        print(f"Error updating chat session title: {e}")
        raise

def delete_chat_session(session_id, user_id):
    """Soft delete a chat session (mark as inactive)"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE chat_sessions 
                SET is_active = 0, updated_at = GETDATE()
                WHERE id = ? AND user_id = ?
            """, (session_id, user_id))
            
            if not conn.autocommit:
                conn.commit()
            
            result = cursor.rowcount > 0
            cursor.close()
            return result
            
    except Exception as e:
        print(f"Error deleting chat session: {e}")
        raise

def create_chat_tables():
    """Create chat sessions and messages tables"""
    try:
        with DatabaseConnection() as conn:
            # Temporarily disable autocommit for schema changes
            conn.autocommit = False
            cursor = conn.cursor()
            
            print("Creating chat tables...")
            
            # Create chat_sessions table
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'chat_sessions')
                CREATE TABLE chat_sessions (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    user_id INT NOT NULL,
                    title VARCHAR(500),
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME DEFAULT GETDATE(),
                    is_active BIT DEFAULT 1,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)
            print("chat_sessions table created/verified")
            
            # Create chat_messages table
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'chat_messages')
                CREATE TABLE chat_messages (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    session_id INT NOT NULL,
                    sender_type VARCHAR(10) NOT NULL, -- 'user' or 'bot'
                    content TEXT NOT NULL,
                    timestamp DATETIME DEFAULT GETDATE(),
                    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'voice', 'image'
                    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
                )
            """)
            print("chat_messages table created/verified")
            
            # Create indexes for better performance
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_chat_sessions_user_id')
                CREATE INDEX IX_chat_sessions_user_id ON chat_sessions(user_id)
            """)
            
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_chat_messages_session_id')
                CREATE INDEX IX_chat_messages_session_id ON chat_messages(session_id)
            """)
            
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_chat_messages_timestamp')
                CREATE INDEX IX_chat_messages_timestamp ON chat_messages(timestamp)
            """)
            
            conn.commit()
            conn.autocommit = True
            cursor.close()
            print("Chat tables and indexes created successfully")
            
    except Exception as e:
        print(f"Error creating chat tables: {e}")
        raise e

__all__ = [
    'create_chat_session',
    'get_user_chat_sessions', 
    'get_chat_session',
    'save_chat_message',
    'get_chat_messages',
    'update_chat_session_title',
    'delete_chat_session',
    'create_chat_tables'
]
