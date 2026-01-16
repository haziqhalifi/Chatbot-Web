"""Fix severity column to have NULL default instead of 'Medium'"""
from database.connection import DatabaseConnection

def fix_severity_default():
    try:
        with DatabaseConnection() as conn:
            conn.autocommit = False
            cursor = conn.cursor()
            
            # First, find and drop the existing default constraint
            print("Checking for existing default constraint on severity column...")
            cursor.execute("""
                SELECT dc.name
                FROM sys.default_constraints dc
                JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
                JOIN sys.tables t ON c.object_id = t.object_id
                WHERE t.name = 'disaster_reports' AND c.name = 'severity'
            """)
            
            constraint_name = cursor.fetchone()
            
            if constraint_name:
                constraint_name = constraint_name[0]
                print(f"Found default constraint: {constraint_name}")
                print("Dropping existing default constraint...")
                cursor.execute(f"ALTER TABLE disaster_reports DROP CONSTRAINT {constraint_name}")
                print("✓ Default constraint dropped")
            else:
                print("No default constraint found")
            
            # Verify the column allows NULL
            print("Ensuring severity column allows NULL...")
            cursor.execute("""
                ALTER TABLE disaster_reports 
                ALTER COLUMN severity NVARCHAR(50) NULL
            """)
            
            conn.commit()
            conn.autocommit = True
            cursor.close()
            
            print("\n✓ Successfully updated severity column:")
            print("  - Removed 'Medium' default value")
            print("  - Column now defaults to NULL")
            print("  - New reports will have unassigned severity")
            
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        raise

if __name__ == "__main__":
    fix_severity_default()
