"""
Migration script to add admin tracking columns to FAQ table
Adds created_by and updated_by foreign keys to track which admin created/modified FAQs
"""

import sys
import os

# Add parent directory to path to import database modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.connection import DatabaseConnection

def migrate_faq_admin_tracking():
    """Add created_by and updated_by columns to faqs table"""
    print("Starting FAQ admin tracking migration...")
    
    try:
        with DatabaseConnection() as conn:
            conn.autocommit = False
            cursor = conn.cursor()
            
            # Check if created_by column exists
            cursor.execute("""
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'faqs' AND COLUMN_NAME = 'created_by'
            """)
            created_by_exists = cursor.fetchone()[0] > 0
            
            # Check if updated_by column exists
            cursor.execute("""
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'faqs' AND COLUMN_NAME = 'updated_by'
            """)
            updated_by_exists = cursor.fetchone()[0] > 0
            
            changes_made = False
            
            # Add created_by column if it doesn't exist
            if not created_by_exists:
                print("Adding created_by column...")
                cursor.execute("""
                    ALTER TABLE faqs ADD created_by INT NULL
                """)
                cursor.execute("""
                    ALTER TABLE faqs ADD CONSTRAINT FK_faqs_created_by 
                    FOREIGN KEY (created_by) REFERENCES users(id)
                """)
                print("✓ created_by column added successfully")
                changes_made = True
            else:
                print("✓ created_by column already exists")
            
            # Add updated_by column if it doesn't exist
            if not updated_by_exists:
                print("Adding updated_by column...")
                cursor.execute("""
                    ALTER TABLE faqs ADD updated_by INT NULL
                """)
                cursor.execute("""
                    ALTER TABLE faqs ADD CONSTRAINT FK_faqs_updated_by 
                    FOREIGN KEY (updated_by) REFERENCES users(id)
                """)
                print("✓ updated_by column added successfully")
                changes_made = True
            else:
                print("✓ updated_by column already exists")
            
            if changes_made:
                conn.commit()
                print("\n✅ Migration completed successfully!")
                print("FAQ table now tracks admin user IDs for create/update operations.")
            else:
                print("\n✅ No migration needed - columns already exist.")
            
            conn.autocommit = True
            cursor.close()
            
            return True
            
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("FAQ Admin Tracking Migration")
    print("=" * 60)
    print()
    
    success = migrate_faq_admin_tracking()
    
    if success:
        print("\n" + "=" * 60)
        print("Migration Summary:")
        print("- Added created_by column (FK to users table)")
        print("- Added updated_by column (FK to users table)")
        print("- All FAQ changes will now be tracked to admin users")
        print("=" * 60)
        sys.exit(0)
    else:
        print("\n❌ Migration failed. Please check the error messages above.")
        sys.exit(1)
