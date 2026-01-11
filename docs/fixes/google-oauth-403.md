# Google OAuth 403 Error - Origin Not Authorized

## Issue

When attempting to sign up or sign in, you see:

```
The given origin is not allowed for the given client ID.
```

This means your application's origin (e.g., `http://localhost:4028`) is not authorized in the Google Cloud Console for the OAuth 2.0 client ID.

## Solution

### 1. Go to Google Cloud Console

1. Navigate to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (DisasterWatch or similar)

### 2. Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type
3. Fill in required information:
   - App name: DisasterWatch
   - User support email: (your email)
   - Developer contact: (your email)
4. Click **Save and Continue**

### 3. Add Authorized Origins

1. Go to **APIs & Services** > **Credentials**
2. Click on your OAuth 2.0 Client ID (the one ending in `.apps.googleusercontent.com`)
3. Under "Authorized JavaScript origins", click **Add URI**
4. Add the following origins:
   - **Development**: `http://localhost:4028`
   - **Development (alternate port)**: `http://localhost:3000`
   - **Production**: `https://your-domain.com` (when deployed)

### 4. Save Changes

Click **Save** to apply the changes.

## Common Origins to Add

### Local Development

- `http://localhost:3000` (common React default)
- `http://localhost:4028` (if using Vite)
- `http://localhost:5173` (Vite default)
- `http://127.0.0.1:4028`

### Production

- `https://disasterwatch.com`
- `https://www.disasterwatch.com`

## Finding Your Client ID

If you need to verify or change your client ID:

1. The current client ID is: `845615957730-ldlb837mjkqtvigr8d6pt8ruq1qab2jo.apps.googleusercontent.com`
2. This is configured in [frontend/src/components/auth/SocialLoginButtons.jsx](../frontend/src/components/auth/SocialLoginButtons.jsx)
3. And in [backend/routes/auth.py](../backend/routes/auth.py)

## Testing After Configuration

1. Wait 5-10 minutes for Google's servers to update
2. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Try signing up or signing in again

## Still Getting 403?

1. **Clear browser cache**: Delete cookies and site data for localhost
2. **Check the exact URL**: Make sure you're accessing from the exact origin you configured
3. **Verify client ID**: Ensure the client ID in your code matches the one in Google Cloud Console
4. **Check authentication library**: Ensure `google-accounts.id.initialize()` is called with correct client_id

## Security Notes

- Never commit real credentials to version control
- Use environment variables for client ID in production
- Only add trusted origins
- Regularly review authorized origins

## Environment Variable Setup (Optional)

To use an environment variable instead of hardcoding:

```jsx
// SocialLoginButtons.jsx
const clientId =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "845615957730-ldlb837mjkqtvigr8d6pt8ruq1qab2jo.apps.googleusercontent.com";

window.google.accounts.id.initialize({
  client_id: clientId,
  callback: onGoogleResponse,
});
```

Then in your `.env` file:

```
REACT_APP_GOOGLE_CLIENT_ID=845615957730-ldlb837mjkqtvigr8d6pt8ruq1qab2jo.apps.googleusercontent.com
```

## References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Websites](https://developers.google.com/identity/sign-in/web)
