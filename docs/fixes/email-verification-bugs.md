# Email Verification Bug Fixes - Summary

## Issues Fixed

### 1. **strptime() TypeError in Verification Code**

**Error:**

```
Verification failed: strptime() argument 1 must be str, not datetime.datetime
```

**Root Cause:**
The `expires_at` value retrieved from the SQL Server database via pyodbc was already a `datetime` object, not a string. The code was trying to parse it with `strptime()`, which expects a string.

**Solution:**
Added `_coerce_datetime()` helper function that:

- Detects if value is already a datetime object and returns it as-is
- Handles string formats: `'YYYY-MM-DD HH:MM:SS'` and `'YYYY-MM-DD HH:MM:SS.ffffff'`
- Falls back to ISO format parsing
- Provides clear error messages for unsupported formats

**Files Updated:**

- [backend/utils/signup_verification.py](../backend/utils/signup_verification.py)
- [backend/utils/admin_verification.py](../backend/utils/admin_verification.py)

**Changes Made:**

```python
# Added to both files:
def _coerce_datetime(value) -> datetime:
    """Convert various datetime formats to datetime object"""
    if isinstance(value, datetime):
        return value
    # ... handle string formats ...

# Updated verify functions to use:
expires_dt = _coerce_datetime(expires_at)  # Instead of strptime()
```

### 2. **Google OAuth 403 Error**

**Error:**

```
The given origin is not allowed for the given client ID.
```

**Root Cause:**
The authorized origins in the Google Cloud Console don't include your local development URL (e.g., `http://localhost:4028`).

**Solution:**

- Added comprehensive guide: [GOOGLE_OAUTH_403_FIX.md](../GOOGLE_OAUTH_403_FIX.md)
- Instructions to add authorized JavaScript origins in Google Cloud Console
- Client ID is: `845615957730-ldlb837mjkqtvigr8d6pt8ruq1qab2jo.apps.googleusercontent.com`

**Steps to Fix:**

1. Go to Google Cloud Console
2. Navigate to APIs & Services > Credentials
3. Click on your OAuth 2.0 Client ID
4. Add your origin (e.g., `http://localhost:4028`) to "Authorized JavaScript origins"
5. Wait 5-10 minutes for changes to propagate
6. Hard refresh browser and retry

## Testing the Fixes

### Test Email Verification

1. Open sign-up page
2. Enter valid email
3. Click "Send Code"
4. Check server logs for verification code (if SMTP not configured)
5. Enter 6-digit code
6. Click "Sign Up"
7. Should complete without strptime error

### Test Google Authentication

1. After fixing Google OAuth configuration
2. Click "Sign up with Google"
3. Should no longer see 403 error
4. Complete Google authentication flow

## Database Migration

If using existing database, the `user_verification_codes` table is created automatically on app startup via:

```python
# In database/schema.py - called during update_database_schema()
create_user_verification_codes_table()
```

No manual migration needed unless you're on an older version.

## Related Documentation

- [SIGNUP_EMAIL_VERIFICATION_GUIDE.md](../SIGNUP_EMAIL_VERIFICATION_GUIDE.md) - Full implementation guide
- [GOOGLE_OAUTH_403_FIX.md](../GOOGLE_OAUTH_403_FIX.md) - Google OAuth setup guide
- [backend/utils/signup_verification.py](../backend/utils/signup_verification.py) - Email verification code service
- [backend/routes/auth.py](../backend/routes/auth.py) - API endpoints
