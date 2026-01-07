"""
Script to set up u2101028@siswa.um.edu.my as an admin user
"""
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db_conn
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def setup_admin_user():
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        admin_email = 'u2101028@siswa.um.edu.my'
        admin_password = 'AdminPassword123!'
        
        # Check if user already exists
        cursor.execute("SELECT id, email, role FROM users WHERE email = ?", (admin_email,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            print(f"✓ User {admin_email} already exists")
            user_id = existing_user[0]
            
            # Update password and role
            hashed_password = pwd_context.hash(admin_password)
            cursor.execute("""
                UPDATE users 
                SET hashed_password = ?, 
                    role = 'admin',
                    auth_provider = 'local',
                    email_verified = 1
                WHERE id = ?
            """, (hashed_password, user_id))
            conn.commit()
            print("✓ Password and role updated successfully!")
        else:
            # Create new admin user
            hashed_password = pwd_context.hash(admin_password)
            cursor.execute("""
                INSERT INTO users (email, hashed_password, role, auth_provider, email_verified, created_at)
                VALUES (?, ?, 'admin', 'local', 1, GETDATE())
            """, (admin_email, hashed_password))
            conn.commit()
            print(f"✓ Admin user {admin_email} created successfully!")
        
        print(f"\n=== Admin Credentials ===")
        print(f"Email: {admin_email}")
        print(f"Password: {admin_password}")
        print(f"Role: admin")
        print(f"\nYou can now use these credentials to sign in to the admin portal.")
        print(f"You will receive a verification code via email when signing in.")
        
        conn.close()
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Setting up admin user u2101028@siswa.um.edu.my...")
    success = setup_admin_user()
    if success:
        print("\n✓ Setup completed successfully!")
    else:
        print("\n✗ Setup failed!")
        sys.exit(1)
