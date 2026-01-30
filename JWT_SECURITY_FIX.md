# JWT Security Fix

## Issues Fixed

### 1. **Unsafe Fallback Secret** ❌ → ✅

**Problem**: JWT secret had a default fallback value `"your_jwt_secret"` which is:

- Publicly visible in source code
- Not production-grade
- Allows token forgery if env var is missing

**Fix**:

- `JWT_SECRET` is now loaded at module startup
- Application fails fast with `ValueError` if `JWT_SECRET` env var is missing
- No fallback - secrets must be explicitly configured

```python
# Before (INSECURE)
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret")

# After (SECURE)
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise ValueError("JWT_SECRET environment variable is required and must be set")
```

### 2. **Long Token Expiration Without Refresh** ❌ → ✅

**Problem**: Single JWT token with 7-day expiration meant:

- Compromised tokens valid for a full week
- No token revocation mechanism
- Risk window too large

**Fix**: Implemented **refresh token pattern**:

- **Access Token**: 15 minutes (short-lived, for API requests)
- **Refresh Token**: 7 days (long-lived, for getting new access tokens)

Benefits:

- Compromised access token only valid for 15 min
- User can be logged out immediately by invalidating refresh token
- Server can track and revoke refresh tokens

```python
# Access token (short-lived)
access_payload = {
    "user_id": row[0],
    "email": email,
    "exp": datetime.utcnow() + timedelta(minutes=15),  # 15 min
    "type": "access"
}

# Refresh token (long-lived)
refresh_payload = {
    "user_id": row[0],
    "exp": datetime.utcnow() + timedelta(days=7),  # 7 days
    "type": "refresh"
}
```

### 3. **Tokens in Response Body → HTTP-Only Cookies** ❌ → ✅

**Problem**: Access tokens were returned in JSON response body:

- Vulnerable to XSS (JavaScript can steal from `localStorage`)
- No automatic CSRF protection
- Frontend must manage token storage

**Fix**: Using **HTTP-Only, Secure cookies** for refresh tokens:

- Browser handles cookie storage (JavaScript cannot access)
- Automatically sent with every request
- Protected by `SameSite=Lax` against CSRF attacks
- Requires `Secure` flag (HTTPS only) in production

```python
response.set_cookie(
    key="refresh_token",
    value=refresh_token,
    max_age=7*24*60*60,  # 7 days
    httponly=True,   # ← JS cannot access
    secure=True,     # ← HTTPS only
    samesite="Lax"   # ← CSRF protection
)
```

Access token is still in JSON response (needed for API calls), but it's short-lived.

---

## Changed Files

1. **`backend/services/user_service.py`**
   - Moved `JWT_SECRET` and `JWT_ALGORITHM` to module level
   - Added startup validation for `JWT_SECRET`
   - Updated `verify_user()` to return both access and refresh tokens
   - Reduced token expiration to 15 minutes for access token

2. **`backend/routes/auth.py`**
   - Import `JWT_SECRET` and `JWT_ALGORITHM` from `user_service`
   - Removed duplicate JWT configuration
   - Updated `POST /signin` to set refresh token in HTTP-only cookie
   - Updated `POST /admin/signin` to set refresh token in HTTP-only cookie

---

## Frontend Changes Required

### Current (Insecure) - Storing in localStorage

```javascript
// ❌ INSECURE - XSS vulnerable
const response = await fetch('/signin', {...});
const data = await response.json();
localStorage.setItem('token', data.token);  // Vulnerable to XSS!
```

### Updated (Secure) - Using automatic cookies + short-lived token

```javascript
// ✅ SECURE
const response = await fetch('/signin', {...});
const data = await response.json();

// Access token (15 min) - use for API calls
fetch('/api/chat', {
    headers: {
        'Authorization': `Bearer ${data.access_token}`
    },
    credentials: 'include'  // ← Include cookies automatically
});

// Refresh token is in HTTP-only cookie (automatic with credentials: 'include')
```

### Token Refresh Endpoint (TODO - Create)

When access token expires (401), automatically call refresh endpoint:

```javascript
// Automatically handle 401 in axios interceptor or fetch wrapper
if (response.status === 401) {
  // POST /refresh (uses httponly cookie automatically)
  const newToken = await fetch("/refresh", {
    credentials: "include",
  }).json();

  // Retry original request with new token
  return fetch(originalRequest, {
    headers: { Authorization: `Bearer ${newToken.access_token}` },
  });
}
```

---

## Production Configuration

Ensure in `.env`:

```env
JWT_SECRET=<32+ character random string>  # REQUIRED - fail without it
```

In production deployment:

- ✅ HTTPS enabled (for `Secure` cookie flag)
- ✅ `secure=True` in cookies (already set in code)
- ✅ CORS properly configured to allow credentials
- ✅ Add refresh token endpoint with revocation support

---

## Next Steps (Recommended)

1. **Create `/refresh` endpoint** - Allow frontend to get new access token using refresh token
2. **Add token revocation** - Store refresh tokens in database, enable logout
3. **Implement CORS** - Ensure `credentials: 'include'` works with frontend domain
4. **Update frontend** - Stop storing tokens in localStorage, use automatic cookies
5. **Add rate limiting** - Prevent refresh token brute force attacks

---

## Security Checklist

- [x] No default/fallback JWT secrets
- [x] JWT_SECRET validated at startup
- [x] Short-lived access tokens (15 min)
- [x] Refresh tokens in HTTP-only cookies
- [ ] TODO: /refresh endpoint for token renewal
- [ ] TODO: Token revocation on logout
- [ ] TODO: Rate limiting on token endpoints
- [ ] TODO: Frontend updated to use cookies
