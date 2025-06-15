# Admin Sign-In System Documentation

## Overview
The admin sign-in system provides secure access to administrative functions for authorized emergency management personnel.

## Access Requirements

### 1. Authorized Email Types
Admin access is allowed for:

**Government Emails:**
- `.gov` domains (e.g., `admin@emergency.gov`)
- `.gov.my` domains (Malaysian government)
- `.mil` domains (military)
- Domains containing: `government`, `emergency`, `disaster`

**Education Emails:**
- `.edu` domains (e.g., `professor@university.edu`)
- `.edu.my` domains (Malaysian education)
- `.ac.my` domains (Malaysian academic)
- Domains containing: `university`, `college`

**Personal Emails:**
- `gmail.com`, `yahoo.com`, `hotmail.com`, `outlook.com`
- `live.com`, `icloud.com`, `protonmail.com`, `tutanota.com`

### 2. Admin Verification Codes
Valid admin codes (for demo purposes):
- `ADMIN123`
- `EMRG2024`
- `DSTWCH01`

**Note:** In production, these codes should be:
- Stored securely in environment variables or a secure database
- Rotated regularly
- Issued by system administrators only

### 3. Password Requirements
Admin passwords must meet enhanced security requirements:
- Minimum 12 characters (vs 8 for regular users)
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

## How to Access

### For Development/Testing:
1. Navigate to `/admin/signin` or click "Emergency Management Access" on the regular sign-in page
2. Use a test email with an authorized domain (e.g., `admin@admin.disasterwatch.com`)
3. Enter a password that meets the admin requirements
4. Enter one of the valid admin codes
5. Click "Access Admin Portal"

### Creating Test Admin Account:
Since the system validates against existing user accounts, you'll need to:

**Option 1: Use Regular Signup + Admin Code**
1. First create a regular user account with any valid email:
   ```
   POST http://localhost:8000/signup
   {
     "email": "admin@gmail.com",
     "password": "AdminPassword123!"
   }
   ```

2. Then use the admin sign-in with the admin code:
   ```
   POST http://localhost:8000/admin/signin
   {
     "email": "admin@gmail.com", 
     "password": "AdminPassword123!",
     "adminCode": "ADMIN123"
   }
   ```

**Option 2: Use Admin Registration Endpoint**
```
POST http://localhost:8000/admin/register
{
  "email": "admin@admin.disasterwatch.com",
  "password": "AdminPassword123!"
}
```

## Features

### Admin Sign-In Page Features:
- Enhanced security validation
- Admin verification code requirement
- Authorized domain checking
- Security notice and warnings
- Distinctive red theme (vs blue for regular users)

### Admin Dashboard Features:
- Real-time disaster alerts overview
- User management statistics
- Response team coordination
- System status monitoring
- Quick action buttons for emergency response
- Recent disaster reports with severity levels

## Security Features

1. **Multi-factor Authentication:**
   - Email/password verification
   - Admin verification code
   - Domain validation

2. **Enhanced Password Requirements:**
   - Stronger password policy for admin accounts
   - Real-time validation feedback

3. **Access Logging:**
   - All admin access attempts are logged
   - Failed authentication attempts are tracked

4. **Role-based Access:**
   - Admin role assigned after successful authentication
   - Automatic redirection to admin dashboard
   - Role verification on protected routes

## API Endpoints

### POST `/admin/signin`
**Request Body:**
```json
{
  "email": "admin@admin.disasterwatch.com",
  "password": "AdminPassword123!",
  "adminCode": "ADMIN123"
}
```

**Response (Success):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "admin@admin.disasterwatch.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

**Response (Error):**
```json
{
  "detail": "Invalid admin verification code"
}
```

## Frontend Routes

- `/admin/signin` - Admin sign-in page
- `/admin/dashboard` - Admin dashboard (requires admin role)
- Regular users are redirected to `/signin` if they try to access admin routes

## Security Best Practices

### For Production Deployment:

1. **Environment Variables:**
   ```
   ADMIN_CODES=["CODE1","CODE2","CODE3"]
   AUTHORIZED_DOMAINS=["domain1.com","domain2.gov"]
   ```

2. **Database Storage:**
   - Store admin codes in encrypted database table
   - Implement code expiration
   - Track code usage

3. **Audit Logging:**
   - Log all admin authentication attempts
   - Monitor for suspicious activity
   - Set up alerts for failed attempts

4. **Network Security:**
   - Restrict admin access to specific IP ranges
   - Use HTTPS only
   - Implement rate limiting

5. **Session Management:**
   - Shorter session timeouts for admin users
   - Automatic logout on inactivity
   - Secure token storage

## Troubleshooting

### Common Issues:

1. **"Admin access requires authorized email domain"**
   - Ensure email uses one of the authorized domains
   - Check for typos in email address

2. **"Invalid admin verification code"**
   - Verify the admin code is correct
   - Check for extra spaces or case sensitivity

3. **"Invalid admin credentials"**
   - Ensure the user account exists in the system
   - Verify password meets admin requirements

4. **Redirected to regular sign-in**
   - User doesn't have admin role
   - Session expired
   - Authentication failed

## Development Notes

The admin system is designed to be:
- Easily extensible for additional security measures
- Compatible with existing user authentication
- Scalable for multiple admin roles and permissions
- Auditable for security compliance

For questions or issues, contact the development team or system administrator.
