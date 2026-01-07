from .connection import DatabaseConnection
from .users import update_users_table
from .chat import create_chat_tables
from .faq import create_faq_table, insert_default_faqs
from .nadma import create_nadma_tables

def update_database_schema():
    """Update database schema including all tables"""
    # Update users table with new columns
    update_users_table()
    
    # Create notifications table
    create_notifications_table()
    
    # Create chat tables
    create_chat_tables()
    
    # Create FAQ table and insert default data
    create_faq_table()
    insert_default_faqs()
    
    # Create password reset tokens table
    create_password_reset_tokens_table()
    
    # Create admin verification codes table
    create_admin_verification_codes_table()
    
    # Create NADMA disaster tables
    create_nadma_tables()

def create_notifications_table():
    """Create notifications table if it doesn't exist"""
    try:
        with DatabaseConnection() as conn:
            # Temporarily disable autocommit for schema changes
            conn.autocommit = False
            cursor = conn.cursor()
            
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'notifications')
                CREATE TABLE notifications (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    user_id INT NOT NULL,
                    title NVARCHAR(255) NOT NULL,
                    message NVARCHAR(MAX) NOT NULL,
                    type NVARCHAR(50) DEFAULT 'info',
                    is_read BIT DEFAULT 0,
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME DEFAULT GETDATE(),
                    expires_at DATETIME NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)
            
            # Create index for better performance
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_notifications_user_id')
                CREATE INDEX IX_notifications_user_id ON notifications(user_id)
            """)
            
            conn.commit()
            conn.autocommit = True
            cursor.close()
            print("Notifications table created successfully")
            
    except Exception as e:
        print(f"Error creating notifications table: {e}")

def migrate_reports_tables():
    """Migrate the reports table structure - rename reports to disaster_reports and create system_reports"""
    try:
        with DatabaseConnection() as conn:
            # Temporarily disable autocommit for schema changes
            conn.autocommit = False
            cursor = conn.cursor()
            
            # Check if the reports table exists and disaster_reports doesn't
            cursor.execute("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = 'reports'
            """)
            reports_exists = cursor.fetchone()[0] > 0
            
            cursor.execute("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = 'disaster_reports'
            """)
            disaster_reports_exists = cursor.fetchone()[0] > 0
            
            # Rename reports table to disaster_reports if it exists and disaster_reports doesn't exist
            if reports_exists and not disaster_reports_exists:
                print("Renaming 'reports' table to 'disaster_reports'...")
                cursor.execute("EXEC sp_rename 'reports', 'disaster_reports'")
                print("Successfully renamed table.")
            
            # Check if system_reports table exists
            cursor.execute("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = 'system_reports'
            """)
            system_reports_exists = cursor.fetchone()[0] > 0
            
            # Create system_reports table if it doesn't exist
            if not system_reports_exists:
                print("Creating 'system_reports' table...")
                cursor.execute("""
                    CREATE TABLE system_reports (
                        id INT IDENTITY(1,1) PRIMARY KEY,
                        user_id INT NOT NULL,
                        subject NVARCHAR(255) NOT NULL,
                        message NVARCHAR(MAX) NOT NULL,
                        status NVARCHAR(50) DEFAULT 'PENDING',
                        created_at DATETIME DEFAULT GETDATE(),
                        updated_at DATETIME DEFAULT GETDATE(),
                        resolved_at DATETIME NULL,
                        admin_notes NVARCHAR(MAX) NULL,
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    )
                """)
                print("Successfully created 'system_reports' table.")
            
            conn.commit()
            conn.autocommit = True
            cursor.close()
            print("Database migration completed successfully.")
            return True
            
    except Exception as e:
        print(f"Migration failed: {e}")
        return False

def create_password_reset_tokens_table():
    """Create password_reset_tokens table if it doesn't exist"""
    try:
        with DatabaseConnection() as conn:
            conn.autocommit = False
            cursor = conn.cursor()
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'password_reset_tokens')
                CREATE TABLE password_reset_tokens (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    user_id INT NOT NULL,
                    token NVARCHAR(128) NOT NULL,
                    expires_at DATETIME NOT NULL,
                    used BIT DEFAULT 0,
                    created_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_password_reset_tokens_user_id')
                CREATE INDEX IX_password_reset_tokens_user_id ON password_reset_tokens(user_id)
            """)
            conn.commit()
            conn.autocommit = True
            cursor.close()
            print("password_reset_tokens table created successfully")
    except Exception as e:
        print(f"Error creating password_reset_tokens table: {e}")

def create_admin_verification_codes_table():
    """Create admin_verification_codes table for email-based verification"""
    try:
        with DatabaseConnection() as conn:
            conn.autocommit = False
            cursor = conn.cursor()
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'admin_verification_codes')
                CREATE TABLE admin_verification_codes (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    email NVARCHAR(255) NOT NULL,
                    code NVARCHAR(6) NOT NULL,
                    expires_at DATETIME NOT NULL,
                    used BIT DEFAULT 0,
                    created_at DATETIME DEFAULT GETDATE(),
                    attempts INT DEFAULT 0
                )
            """)
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_admin_verification_codes_email')
                CREATE INDEX IX_admin_verification_codes_email ON admin_verification_codes(email)
            """)
            conn.commit()
            conn.autocommit = True
            cursor.close()
            print("admin_verification_codes table created successfully")
    except Exception as e:
        print(f"Error creating admin_verification_codes table: {e}")

__all__ = [
    'update_database_schema',
    'create_notifications_table', 
    'migrate_reports_tables',
    'create_password_reset_tokens_table',
    'create_admin_verification_codes_table',
]
