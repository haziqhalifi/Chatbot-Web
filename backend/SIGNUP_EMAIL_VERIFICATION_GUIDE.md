# Email Verification for Sign-Up Implementation Guide

## Overview

This document describes the implementation of email verification code functionality for the sign-up page using the same SMTP provider as the admin sign-in and password reset features.

## Architecture

### Backend Components

#### 1. Database Table: `user_verification_codes`

- **Location:** [backend/database/schema.py](../../backend/database/schema.py)
- **Schema:**
  - `id` (INT, Primary Key)
  - `email` (NVARCHAR(255), Indexed)
  - `code` (NVARCHAR(6)) - 6-digit verification code
  - `expires_at` (DATETIME) - 10-minute expiration
  - `used` (BIT) - Tracks if code has been used
  - `created_at` (DATETIME)
  - `attempts` (INT) - Failed verification attempts (max 5)

#### 2. Verification Service: `signup_verification.py`

- **Location:** [backend/utils/signup_verification.py](../../backend/utils/signup_verification.py)
- **Functions:**
  - `generate_verification_code()` - Generates 6-digit code
  - `send_signup_verification_code(email: str)` - Generates and sends code
  - `verify_signup_code(email: str, code: str)` - Validates the provided code
  - `resend_verification_code(email: str)` - Resends code to user

**Key Features:**

- Uses same `send_email()` from [backend/utils/email_sender.py](../../backend/utils/email_sender.py)
- Automatically configures SMTP from environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD)
- Falls back to console logging if SMTP is not configured (development mode)
- Enforces 10-minute expiration
- Limits attempts to 5 before requiring a new code
- Automatically marks code as used after successful verification

#### 3. API Routes in `auth.py`

- **Location:** [backend/routes/auth.py](../../backend/routes/auth.py)

**Endpoints:**

1. **POST /send-verification-code**

   ```json
   Request: { "email": "user@example.com" }
   Response: { "message": "Verification code sent to your email" }
   ```

   - Generates and sends verification code
   - Can be called multiple times to resend

2. **POST /verify-signup-code**

   ```
   Request: { "email": "user@example.com" }
   Query: ?code=123456
   Response: { "message": "Verification code verified successfully" }
   ```

   - Validates the verification code
   - Checks expiration and attempt limits
   - Marks code as used upon success
   - Returns 400 error if invalid/expired

3. **POST /resend-verification-code**

   ```json
   Request: { "email": "user@example.com" }
   Response: { "message": "Verification code generated" }
   ```

   - Clears old unused codes
   - Sends fresh verification code
   - Resets the 10-minute expiration timer

4. **POST /signup**
   ```json
   Request: { "email": "user@example.com", "password": "SecurePass123!" }
   Response: { "token": "...", "user_id": 1, ... }
   ```
   - Creates user account
   - Should only be called after email verification

### Frontend Implementation

#### SignUp.jsx Component

- **Location:** [frontend/src/pages/SignUp.jsx](../../frontend/src/pages/SignUp.jsx)

**Key Changes:**

1. **Send Code Button**

   - Calls `/send-verification-code` endpoint
   - Shows 60-second countdown before allowing resend
   - Validates email format before sending

2. **Verification Code Input**

   - Disabled until code is sent
   - Only accepts 6-digit input
   - Real-time validation

3. **Form Submission**

   - Two-step process:
     1. Verify code via `/verify-signup-code`
     2. Create account via `/signup`
   - Only creates account if verification succeeds

4. **Resend Logic**
   - Uses `/resend-verification-code` endpoint
   - Clears previous code input
   - Resets the countdown timer
   - Endpoint intelligently handles both initial send and resends

## Email Configuration

### Required Environment Variables

Set these in your `.env` file or server environment:

```
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@disasterwatch.com
SMTP_TLS=true
SMTP_TIMEOUT=20
```

### Supported Email Providers

- Gmail SMTP
- Office 365
- AWS SES
- Custom SMTP servers
- Any provider supporting SMTP authentication

**Example Gmail Configuration:**

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_TLS=true
```

## Verification Flow Diagram

```
User Registration Flow:
1. User enters email → Validates format
2. Click "Send Code" → POST /send-verification-code
3. Check email for code → User enters 6-digit code
4. Click "Sign Up" → POST /verify-signup-code (validates code)
5. If valid → POST /signup (creates account)
6. If invalid → Error message with resend option

Resend Flow:
1. User clicks "Send Code" again (within 60s countdown completes)
2. POST /resend-verification-code (or /send-verification-code)
3. Old code invalidated, new code sent
4. Countdown resets to 60s
```

## Security Features

1. **Code Expiration**

   - All codes expire after 10 minutes
   - Expired codes cannot be used for verification

2. **Attempt Limiting**

   - Maximum 5 failed attempts per code
   - Requires new code after 5 failed attempts

3. **One-Time Use**

   - Each code can only be verified once
   - Code is marked as "used" after successful verification

4. **Email Uniqueness**

   - Only one active unverified code per email
   - New code request deletes old unused codes

5. **Password Requirements**
   - Enforced by signup endpoint
   - Must be 8+ characters with uppercase, lowercase, number, and special character

## Testing Instructions

### 1. Local Development (SMTP Disabled)

When `SMTP_HOST` is not set:

- Verification codes print to server console
- Check server logs for generated codes
- Example: `[SIGNUP VERIFICATION] Code for user@example.com: 123456`

### 2. With SMTP Enabled

1. Configure SMTP environment variables
2. Register new account
3. Check email for verification code
4. Enter code in sign-up form
5. Account creation completes

### 3. Test Cases

- **Valid code**: Should succeed
- **Expired code**: Wait 10+ minutes, should fail with "expired" message
- **Wrong code**: Should fail with "Invalid verification code"
- **Code reuse**: Verify once, try again, should fail
- **Too many attempts**: Try 5+ wrong codes, should block with "Too many failed attempts"
- **Resend code**: Request new code, old one becomes invalid

## Database Migrations

If you're adding this to an existing installation:

1. Database table is created automatically on app startup
2. If manual migration needed, run:
   ```python
   from database.schema import create_user_verification_codes_table
   create_user_verification_codes_table()
   ```

## Troubleshooting

| Issue                               | Solution                                                    |
| ----------------------------------- | ----------------------------------------------------------- |
| Codes not being sent                | Check SMTP_HOST is configured; check server logs for errors |
| "Email service unavailable" message | SMTP_HOST not set or SMTP connection failed; check env vars |
| Code expired immediately            | Check server time synchronization                           |
| "Too many failed attempts"          | Wait for code to expire or request new code                 |
| Email not received                  | Check SMTP credentials, spam folder, email filters          |
| Database table missing              | Run migrations or restart app with schema update enabled    |

## Related Files

- Email sender utility: [backend/utils/email_sender.py](../../backend/utils/email_sender.py)
- Admin verification (similar implementation): [backend/utils/admin_verification.py](../../backend/utils/admin_verification.py)
- Password reset (uses same SMTP): [backend/routes/auth.py](../../backend/routes/auth.py) (forgot-password endpoint)
- Database schema: [backend/database/schema.py](../../backend/database/schema.py)
- Frontend sign-up page: [frontend/src/pages/SignUp.jsx](../../frontend/src/pages/SignUp.jsx)
- Auth components: [frontend/src/components/auth/](../../frontend/src/components/auth/)
