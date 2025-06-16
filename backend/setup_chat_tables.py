"""
Manual database setup script for chat tables
Run this script to manually create the chat tables if they're not being created automatically
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db_conn, create_chat_tables
from dotenv import load_dotenv

def test_database_connection():
    """Test if we can connect to the database"""
    try:
        load_dotenv()
        print("Testing database connection...")
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Test basic query
        cursor.execute("SELECT 1 as test")
        result = cursor.fetchone()
        print(f"Database connection successful: {result}")
        
        # Check if users table exists (should exist from previous setup)
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'users'
        """)
        users_exists = cursor.fetchone()[0]
        print(f"Users table exists: {users_exists > 0}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

def create_tables_manually():
    """Manually create chat tables"""
    try:
        print("\n" + "="*50)
        print("MANUALLY CREATING CHAT TABLES")
        print("="*50)
        
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Drop tables if they exist (for clean setup)
        print("Dropping existing chat tables if they exist...")
        try:
            cursor.execute("DROP TABLE IF EXISTS chat_messages")
            cursor.execute("DROP TABLE IF EXISTS chat_sessions")
            conn.commit()
            print("Existing tables dropped")
        except Exception as e:
            print(f"Note: {e} (this is normal if tables don't exist)")
        
        # Create chat_sessions table
        print("Creating chat_sessions table...")
        cursor.execute("""
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
        print("✓ chat_sessions table created")
        
        # Create chat_messages table
        print("Creating chat_messages table...")
        cursor.execute("""
            CREATE TABLE chat_messages (
                id INT IDENTITY(1,1) PRIMARY KEY,
                session_id INT NOT NULL,
                sender_type VARCHAR(10) NOT NULL,
                content TEXT NOT NULL,
                timestamp DATETIME DEFAULT GETDATE(),
                message_type VARCHAR(50) DEFAULT 'text',
                FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
            )
        """)
        print("✓ chat_messages table created")
        
        # Create indexes
        print("Creating indexes...")
        cursor.execute("CREATE INDEX IX_chat_sessions_user_id ON chat_sessions(user_id)")
        cursor.execute("CREATE INDEX IX_chat_messages_session_id ON chat_messages(session_id)")
        cursor.execute("CREATE INDEX IX_chat_messages_timestamp ON chat_messages(timestamp)")
        print("✓ Indexes created")
        
        conn.commit()
        conn.close()
        
        print("\n✅ ALL CHAT TABLES CREATED SUCCESSFULLY!")
        print("="*50)
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables manually: {e}")
        return False

def verify_tables():
    """Verify that the tables were created"""
    try:
        print("\nVerifying table creation...")
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Check chat_sessions table
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'chat_sessions'
        """)
        sessions_exists = cursor.fetchone()[0]
        print(f"✓ chat_sessions table exists: {sessions_exists > 0}")
        
        # Check chat_messages table
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'chat_messages'
        """)
        messages_exists = cursor.fetchone()[0]
        print(f"✓ chat_messages table exists: {messages_exists > 0}")
        
        # Show table structure
        if sessions_exists > 0:
            cursor.execute("""
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'chat_sessions'
                ORDER BY ORDINAL_POSITION
            """)
            print("\nchat_sessions table structure:")
            for row in cursor.fetchall():
                print(f"  - {row[0]} ({row[1]}) {'NULL' if row[2] == 'YES' else 'NOT NULL'}")
        
        conn.close()
        return sessions_exists > 0 and messages_exists > 0
        
    except Exception as e:
        print(f"Error verifying tables: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting manual database setup for chat tables...")
    
    # Test database connection first
    if not test_database_connection():
        print("❌ Database connection failed. Please check your .env file and database settings.")
        exit(1)
    
    # Create tables manually
    if create_tables_manually():
        # Verify creation
        if verify_tables():
            print("\n🎉 Setup completed successfully!")
            print("You can now restart your backend server and try the chat functionality.")
        else:
            print("\n❌ Table verification failed.")
    else:
        print("\n❌ Table creation failed.")
