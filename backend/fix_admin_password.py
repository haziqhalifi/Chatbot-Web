from database import get_db_conn
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

try:
    conn = get_db_conn()
    cursor = conn.cursor()
    
    # Hash the password
    password = "AdminPassword123!"
    hashed_password = pwd_context.hash(password)
    
    # Update the user with the hashed password
    cursor.execute(
        "UPDATE users SET hashed_password = ? WHERE email = ?",
        (hashed_password, 'admin@gmail.com')
    )
    conn.commit()
    
    print("✓ Password updated successfully!")
    print(f"  Email: admin@gmail.com")
    print(f"  Password: {password}")
    print(f"  Admin Code: ADMIN123")
    print("\nYou can now sign in to the admin portal with these credentials.")
    
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")
