#!/usr/bin/env python
"""Check and update database schema for report status"""

from database.connection import DatabaseConnection

def check_and_update_schema():
    """Check if disaster_reports table has required columns, add if missing"""
    try:
        with DatabaseConnection() as conn:
            conn.autocommit = False
            cursor = conn.cursor()
            
            # Check if disaster_reports table exists
            cursor.execute("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = 'disaster_reports'
            """)
            
            if cursor.fetchone()[0] == 0:
                print("ERROR: disaster_reports table does not exist!")
                return False
            
            print("✓ disaster_reports table exists")
            
            # Check for status column
            cursor.execute("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'disaster_reports' AND COLUMN_NAME = 'status'
            """)
            
            if cursor.fetchone()[0] == 0:
                print("Adding 'status' column...")
                cursor.execute("""
                    ALTER TABLE disaster_reports ADD status NVARCHAR(50) DEFAULT 'Active'
                """)
                print("✓ Added 'status' column")
            else:
                print("✓ 'status' column already exists")
            
            # Check for admin_notes column
            cursor.execute("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'disaster_reports' AND COLUMN_NAME = 'admin_notes'
            """)
            
            if cursor.fetchone()[0] == 0:
                print("Adding 'admin_notes' column...")
                cursor.execute("""
                    ALTER TABLE disaster_reports ADD admin_notes NVARCHAR(MAX)
                """)
                print("✓ Added 'admin_notes' column")
            else:
                print("✓ 'admin_notes' column already exists")
            
            # Check for updated_at column
            cursor.execute("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'disaster_reports' AND COLUMN_NAME = 'updated_at'
            """)
            
            if cursor.fetchone()[0] == 0:
                print("Adding 'updated_at' column...")
                cursor.execute("""
                    ALTER TABLE disaster_reports ADD updated_at DATETIME DEFAULT GETDATE()
                """)
                print("✓ Added 'updated_at' column")
            else:
                print("✓ 'updated_at' column already exists")
            
            conn.commit()
            conn.autocommit = True
            cursor.close()
            
            print("\n✓ Schema check completed successfully!")
            return True
            
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    check_and_update_schema()
