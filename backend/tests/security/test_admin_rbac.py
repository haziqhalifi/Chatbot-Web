"""
Security Test: Verify admin role-based access control
Run this test to ensure non-admin users cannot access admin endpoints
"""
import requests
import jwt
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

# Test secrets (should match backend config)
JWT_SECRET = "your-secret-key-change-in-production"
JWT_ALGORITHM = "HS256"

def create_test_token(user_id: int, email: str, role: str) -> str:
    """Create a test JWT token with specified role"""
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=1),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def test_admin_endpoint(endpoint: str, token: str, method: str = "GET"):
    """Test an admin endpoint with a given token"""
    headers = {"Authorization": f"Bearer {token}"}
    
    if method == "GET":
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
    elif method == "POST":
        response = requests.post(f"{BASE_URL}{endpoint}", headers=headers, json={})
    else:
        raise ValueError(f"Unsupported method: {method}")
    
    return response

def run_security_tests():
    """Run comprehensive security tests"""
    print("=" * 70)
    print("ADMIN ROLE-BASED ACCESS CONTROL SECURITY TESTS")
    print("=" * 70)
    
    # Create test tokens
    admin_token = create_test_token(1, "admin@example.com", "admin")
    user_token = create_test_token(2, "user@example.com", "Public")
    
    # Test endpoints
    test_cases = [
        ("/admin/dashboard/stats", "GET"),
        ("/admin/system/status", "GET"),
        ("/admin/users", "GET"),
        ("/performance", "GET"),
    ]
    
    print("\n1. Testing with ADMIN token (should succeed):")
    print("-" * 70)
    for endpoint, method in test_cases:
        response = test_admin_endpoint(endpoint, admin_token, method)
        status = "✅ PASS" if response.status_code == 200 else f"❌ FAIL ({response.status_code})"
        print(f"{status} | {method:4} {endpoint:40} → {response.status_code}")
    
    print("\n2. Testing with REGULAR USER token (should return 403):")
    print("-" * 70)
    for endpoint, method in test_cases:
        response = test_admin_endpoint(endpoint, user_token, method)
        status = "✅ PASS" if response.status_code == 403 else f"❌ FAIL ({response.status_code})"
        detail = response.json().get("detail", "") if response.status_code == 403 else ""
        print(f"{status} | {method:4} {endpoint:40} → {response.status_code}")
        if detail:
            print(f"       Detail: {detail}")
    
    print("\n3. Testing without token (should return 401):")
    print("-" * 70)
    for endpoint, method in test_cases:
        headers = {}  # No Authorization header
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        else:
            response = requests.post(f"{BASE_URL}{endpoint}", headers=headers, json={})
        
        status = "✅ PASS" if response.status_code == 401 else f"❌ FAIL ({response.status_code})"
        print(f"{status} | {method:4} {endpoint:40} → {response.status_code}")
    
    print("\n4. Testing privilege escalation attempt:")
    print("-" * 70)
    # Try to promote self to admin
    response = requests.post(
        f"{BASE_URL}/admin/users/2/promote",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    status = "✅ PASS (Blocked)" if response.status_code == 403 else f"❌ FAIL - SECURITY BREACH! ({response.status_code})"
    print(f"{status} | POST /admin/users/2/promote (self-promotion) → {response.status_code}")
    if response.status_code != 403:
        print("       ⚠️  CRITICAL: Regular user was able to promote themselves!")
    
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    print("✅ All admin endpoints should return 200 for admin users")
    print("✅ All admin endpoints should return 403 for regular users")
    print("✅ All admin endpoints should return 401 for unauthenticated requests")
    print("✅ Privilege escalation attempts should be blocked with 403")
    print("=" * 70)

if __name__ == "__main__":
    try:
        run_security_tests()
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend server")
        print("   Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ ERROR: {e}")
