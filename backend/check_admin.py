from database import get_db_conn
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

try:
    conn = get_db_conn()
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute("SELECT id, email, hashed_password FROM users WHERE email = ?", ('admin@gmail.com',))
    row = cursor.fetchone()
    
    if row:
        print(f"✓ User found!")
        print(f"  ID: {row[0]}")
        print(f"  Email: {row[1]}")
        print(f"  Has password hash: {row[2] is not None}")
        
        # Test password verification
        test_password = "AdminPassword123!"
        if pwd_context.verify(test_password, row[2]):
            print(f"✓ Password 'AdminPassword123!' is CORRECT")
        else:
            print(f"✗ Password 'AdminPassword123!' is INCORRECT")
            print(f"  The stored hash: {row[2][:50]}...")
    else:
        print("✗ User admin@gmail.com NOT FOUND in database")
        print("\nTo create this user, run:")
        print("POST http://localhost:8000/signup")
        print('{"email": "admin@gmail.com", "password": "AdminPassword123!"}')
    
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")
