import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db_conn
from dotenv import load_dotenv

def setup_disaster_reports_table():
    """Create or update the disaster_reports table"""
    try:
        load_dotenv()
        print("="*50)
        print("Setting up disaster_reports table")
        print("="*50)

        conn = get_db_conn()
        cursor = conn.cursor()

        # Check if disaster_reports table exists
        cursor.execute("""
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_NAME = 'disaster_reports'
        """)
        table_exists = cursor.fetchone()[0] > 0

        if not table_exists:
            print("Creating disaster_reports table...")
            cursor.execute("""
                CREATE TABLE disaster_reports (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    user_id INT NOT NULL,
                    title NVARCHAR(255) NOT NULL,
                    location NVARCHAR(255) NOT NULL,
                    disaster_type NVARCHAR(100) NOT NULL,
                    description NVARCHAR(MAX) NOT NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)
            print("✓ disaster_reports table created")
        else:
            print("disaster_reports table already exists.")
            # Check if updated_at column exists
            cursor.execute("""
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'disaster_reports' AND COLUMN_NAME = 'updated_at'
            """)
            column_exists = cursor.fetchone()[0] > 0
            if column_exists:
                print("Removing 'updated_at' column from disaster_reports table...")
                cursor.execute("ALTER TABLE disaster_reports DROP COLUMN updated_at")
                print("✓ 'updated_at' column removed.")

        conn.commit()
        conn.close()

        print("\n✅ DISASTER REPORTS TABLE setup complete!")
        print("="*50)
        return True

    except Exception as e:
        print(f"❌ Error setting up disaster_reports table: {e}")
        return False

if __name__ == "__main__":
    setup_disaster_reports_table()
