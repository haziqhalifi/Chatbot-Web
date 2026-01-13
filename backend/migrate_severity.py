"""Migration script to reset severity to NULL for existing reports"""
from database.connection import DatabaseConnection

def migrate_severity():
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Update all reports with 'Medium' severity to NULL
            cursor.execute("""
                UPDATE disaster_reports 
                SET severity = NULL 
                WHERE severity = 'Medium'
            """)
            
            rows_affected = cursor.rowcount
            
            if not conn.autocommit:
                conn.commit()
            
            cursor.close()
            print(f"✓ Successfully updated {rows_affected} reports to have NULL severity")
            print("  Admins will now need to assign severity levels")
            
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        raise

if __name__ == "__main__":
    migrate_severity()
