from .connection import DatabaseConnection

def update_users_table():
    """Add new columns to users table if they don't exist"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Check if columns exist first before trying to add them
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'users'
            """)
            existing_columns = [row[0].lower() for row in cursor.fetchall()]
            
            # Temporarily disable autocommit for schema changes
            conn.autocommit = False
            
            # Add basic profile columns
            if 'name' not in existing_columns:
                cursor.execute("ALTER TABLE users ADD name NVARCHAR(255)")
                
            if 'language' not in existing_columns:
                cursor.execute("ALTER TABLE users ADD language NVARCHAR(50) DEFAULT 'English'")
                
            if 'role' not in existing_columns:
                cursor.execute("ALTER TABLE users ADD role NVARCHAR(50) DEFAULT 'Public'")
            
            # Add Google authentication specific columns
            if 'given_name' not in existing_columns:
                cursor.execute("ALTER TABLE users ADD given_name NVARCHAR(255)")
                
            if 'family_name' not in existing_columns:
                cursor.execute("ALTER TABLE users ADD family_name NVARCHAR(255)")
                
            if 'profile_picture' not in existing_columns:
                cursor.execute("ALTER TABLE users ADD profile_picture NVARCHAR(1000)")
                
            if 'email_verified' not in existing_columns:
                cursor.execute("ALTER TABLE users ADD email_verified BIT DEFAULT 0")
                
            if 'auth_provider' not in existing_columns:
                cursor.execute("ALTER TABLE users ADD auth_provider NVARCHAR(50) DEFAULT 'local'")
                
            # Add additional profile information columns
            if 'phone' not in existing_columns:
                cursor.execute("ALTER TABLE users ADD phone NVARCHAR(20)")
                
            if 'address' not in existing_columns:
                cursor.execute("ALTER TABLE users ADD address NVARCHAR(500)")
                
            if 'city' not in existing_columns:
                cursor.execute("ALTER TABLE users ADD city NVARCHAR(100)")
                
            if 'state' not in existing_columns:
                cursor.execute("ALTER TABLE users ADD state NVARCHAR(100)")
                
            if 'postcode' not in existing_columns:
                cursor.execute("ALTER TABLE users ADD postcode NVARCHAR(10)")
                
            if 'country' not in existing_columns:
                cursor.execute("ALTER TABLE users ADD country NVARCHAR(100)")
                
            if 'timezone' not in existing_columns:
                cursor.execute("ALTER TABLE users ADD timezone NVARCHAR(50)")
                
            if 'created_at' not in existing_columns:
                cursor.execute("ALTER TABLE users ADD created_at DATETIME DEFAULT GETDATE()")
                
            if 'updated_at' not in existing_columns:
                cursor.execute("ALTER TABLE users ADD updated_at DATETIME DEFAULT GETDATE()")
                
            if 'last_login' not in existing_columns:
                cursor.execute("ALTER TABLE users ADD last_login DATETIME")
                
            conn.commit()
            conn.autocommit = True
            cursor.close()
            print("Database schema updated successfully with new user fields")
    except Exception as e:
        print(f"Database update error: {e}")

__all__ = ['update_users_table']
