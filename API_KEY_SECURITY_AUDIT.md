# API Key Security Audit Report

## Executive Summary

⚠️ **CRITICAL SECURITY ISSUES FOUND** - The application has multiple serious API key exposure vulnerabilities that must be addressed immediately.

---

## Critical Issues

### 1. ⚠️ HARDCODED API KEY IN FRONTEND CODE

**Severity: CRITICAL**

The API key is hardcoded as a string literal in multiple frontend files:

**Vulnerable Files:**

- [frontend/src/api/client.js](frontend/src/api/client.js#L15) - Line 15: `config.headers['x-api-key'] = 'secretkey'`
- [frontend/src/pages/admin/SimplifiedReports.jsx](frontend/src/pages/admin/SimplifiedReports.jsx#L57) - Multiple hardcoded instances (lines 57, 137, 174, 200)
- [frontend/src/pages/admin/SimplifiedNadmaHistory.jsx](frontend/src/pages/admin/SimplifiedNadmaHistory.jsx#L32)
- [frontend/src/pages/admin/SimplifiedManageUsers.jsx](frontend/src/pages/admin/SimplifiedManageUsers.jsx#L44) - Multiple instances
- [frontend/src/pages/admin/SimplifiedManageFAQ.jsx](frontend/src/pages/admin/SimplifiedManageFAQ.jsx#L106) - Multiple instances
- [frontend/src/test/api.test.js](frontend/src/test/api.test.js#L47) - Test files

**Risk:**

- Anyone viewing the page source can see the API key
- Browser developer tools expose the key
- Source code repositories expose the key (if public)
- API key is visible in network request headers

**Current Code:**

```javascript
// INSECURE ❌
config.headers["x-api-key"] = "secretkey";
```

---

### 2. ⚠️ HARDCODED API KEY IN BACKEND .env FILE

**Severity: CRITICAL**

The `.env` file contains hardcoded sensitive keys:

**File:** [backend/.env](backend/.env)

```env
API_KEY="secretkey"
OPENAI_API_KEY=sk-proj-wEfaSE9okc01m4NeoXHeg-uHoP7_9h2Z1GFX9q0B4mj_...
```

**Risks:**

- `.env` files should NEVER be committed to version control
- All OpenAI API keys are exposed
- Anyone with access to the repository can use the OpenAI key to incur charges
- The key in the paste above is a REAL API key (compromised - rotate immediately)

---

### 3. ⚠️ SHARED API KEY ACROSS FRONTEND & BACKEND

**Severity: HIGH**

The same API key (`secretkey`) is used in both frontend and backend:

**Frontend sends:** `x-api-key: secretkey`
**Backend validates against:** `API_KEY_CREDITS = {os.getenv("API_KEY"): 100}`

**Problems:**

- Frontend sends the key in every request header
- An attacker with network access can intercept and use the key
- No per-user/per-request authentication isolation
- The key never changes per session

---

### 4. ⚠️ NO HTTPS IN DEVELOPMENT SETUP

**Severity: HIGH**

Frontend communicates with backend over HTTP:

**File:** [frontend/src/api/client.js](frontend/src/api/client.js#L3)

```javascript
baseURL: 'http://localhost:8000',
```

**Risk:**

- In production, HTTP exposes the API key to man-in-the-middle (MITM) attacks
- Any intercepting proxy or network sniffer can see the key

---

### 5. ⚠️ WEAK API KEY VALIDATION

**Severity: MEDIUM**

**File:** [backend/utils/chat.py](backend/utils/chat.py#L3)

```python
def verify_api_key(x_api_key: str, API_KEY_CREDITS: dict):
    credits = API_KEY_CREDITS.get(x_api_key, 0)
    if credits <= 0:
        raise HTTPException(status_code=401, detail="Invalid API Key, or no credits")
    return x_api_key
```

**Problems:**

- Only checks if key exists in a dictionary (no cryptographic validation)
- No rate limiting per API key
- No API key rotation/expiration
- No audit logging of API key usage
- API key is sent in every request (no token exchange)

---

### 6. ⚠️ NO ENVIRONMENT-SPECIFIC CONFIGURATION

**Severity: MEDIUM**

The API key is the same for all environments (dev, staging, prod).

**Problems:**

- Development compromises affect production
- No way to revoke/rotate without affecting all users
- No environment isolation

---

## Recommended Fixes (Priority Order)

### ✅ Fix 1: Remove `.env` from Version Control (IMMEDIATE)

```bash
# Add to .gitignore
echo "backend/.env" >> .gitignore
echo ".env" >> .gitignore
echo "*.env.local" >> .gitignore

# Remove from git history (if already committed)
git rm --cached backend/.env
git commit -m "Remove .env file from version control"
```

**Then rotate all keys immediately:**

1. Rotate OpenAI API key in OpenAI dashboard
2. Generate new `API_KEY` for backend

---

### ✅ Fix 2: Move API Key to Backend Only

The frontend should NOT contain the API key. Instead:

**Remove from frontend:**

- Delete all hardcoded `'secretkey'` from frontend files
- Don't send `x-api-key` header from frontend at all

**New Flow:**

```
User Request → Frontend → Backend (with JWT token) → Backend validates JWT → Access allowed
```

**Updated [frontend/src/api/client.js](frontend/src/api/client.js):**

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Only send JWT token, NOT API key
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // REMOVED: config.headers['x-api-key'] = 'secretkey';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
```

---

### ✅ Fix 3: Implement Backend API Key Middleware

Only the backend should validate the API key internally:

**New [backend/middleware/api_key.py](backend/middleware/api_key.py):**

```python
from fastapi import Request, HTTPException, Header
from config.settings import INTERNAL_API_KEY

async def verify_internal_api_key(api_key: str = Header(None, alias="x-internal-api-key")):
    """Verify internal API key for backend-only endpoints"""
    if not api_key or api_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid internal API key")
    return api_key
```

---

### ✅ Fix 4: Enable HTTPS in Production

**Requirements:**

- Use HTTPS for all production traffic
- Use TLS 1.2+ only
- Add HSTS headers

**In [backend/main.py](backend/main.py):**

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # HTTPS only
    allow_credentials=True,
)

# Add HSTS header
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

---

### ✅ Fix 5: Implement Proper API Key Management

Use a database-backed approach for API keys:

**Schema:**

```python
# backend/models/api_key.py
from sqlalchemy import Column, String, Integer, DateTime, Boolean
from datetime import datetime, timedelta

class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True)
    key_hash = Column(String, unique=True)  # SHA-256 hash, never store plaintext
    user_id = Column(Integer, ForeignKey("users.id"))
    credits = Column(Integer, default=100)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)  # For rotation
    last_used = Column(DateTime)
    is_active = Column(Boolean, default=True)
```

**Validation:**

```python
# backend/utils/security.py
import hashlib
from datetime import datetime

def hash_api_key(key: str) -> str:
    """Hash API key using SHA-256"""
    return hashlib.sha256(key.encode()).hexdigest()

def verify_api_key_from_db(key: str, db: Session):
    """Verify API key against database"""
    key_hash = hash_api_key(key)
    api_key = db.query(APIKey).filter(
        APIKey.key_hash == key_hash,
        APIKey.is_active == True,
        APIKey.expires_at > datetime.utcnow()
    ).first()

    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid or expired API key")

    # Update last_used timestamp
    api_key.last_used = datetime.utcnow()
    db.commit()

    return api_key
```

---

### ✅ Fix 6: Add API Key Rotation & Audit Logging

```python
# backend/utils/audit.py
from datetime import datetime
import logging

audit_logger = logging.getLogger("audit")

def log_api_key_usage(api_key_id: int, endpoint: str, status_code: int, user_id: int):
    """Log API key usage for audit trail"""
    audit_logger.info(
        f"API_KEY_USAGE: key_id={api_key_id}, user_id={user_id}, "
        f"endpoint={endpoint}, status={status_code}, timestamp={datetime.utcnow()}"
    )
```

---

## Current Configuration Problems

### Backend Configuration

**File:** [backend/config/settings.py](backend/config/settings.py)

```python
# INSECURE: API key stored as plain dict
API_KEY_CREDITS = {os.getenv("API_KEY"): 100}

# INSECURE: OpenAI key exposed in settings
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
self.client = OpenAI(api_key=OPENAI_API_KEY)  # Used directly in code
```

**Should be:**

```python
# Only load API key from environment, don't expose in logs
API_KEY_CREDITS = {}  # Load from database at runtime
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")  # Don't use directly, wrap in service
```

---

## Security Best Practices Checklist

- [ ] Remove `.env` from version control
- [ ] Rotate all exposed API keys immediately
- [ ] Add `.env` to `.gitignore`
- [ ] Create `.env.example` template file
- [ ] Remove hardcoded API keys from frontend
- [ ] Implement JWT-based authentication instead of shared API key
- [ ] Use HTTPS in production
- [ ] Implement API key hashing in database
- [ ] Add audit logging for API key usage
- [ ] Implement API key expiration/rotation policy
- [ ] Use environment-specific configuration
- [ ] Enable rate limiting per API key
- [ ] Add secrets management tool (e.g., HashiCorp Vault, AWS Secrets Manager)
- [ ] Scan codebase for hardcoded secrets with `truffleHog`

---

## Testing

### Test 1: Verify No API Key in Frontend

```bash
# Search for hardcoded API keys
grep -r "secretkey" frontend/src/
grep -r "sk-proj-" frontend/src/
grep -r "x-api-key" frontend/src/
```

### Test 2: Verify No API Key in Network

```bash
# Open browser DevTools (F12) → Network tab
# Make a request and check headers - should NOT contain x-api-key
```

### Test 3: Verify HTTPS in Production

```bash
# Ensure all requests use HTTPS
curl -I https://yourdomain.com/
```

---

## Impact Summary

| Issue                         | Severity | Impact              | Fix Effort |
| ----------------------------- | -------- | ------------------- | ---------- |
| Hardcoded API key in frontend | CRITICAL | Key compromised     | 2 hours    |
| Hardcoded keys in `.env`      | CRITICAL | All secrets exposed | 1 hour     |
| HTTP instead of HTTPS         | HIGH     | Key interception    | 1 hour     |
| Weak validation               | MEDIUM   | No accountability   | 4 hours    |
| No rotation policy            | MEDIUM   | Permanent exposure  | 2 hours    |

**Total Estimated Fix Time: 10 hours**

---

## References

- [OWASP - API Security](https://owasp.org/www-project-api-security/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [12-Factor App - Store Config in Environment](https://12factor.net/config)
- [Google Cloud - API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
