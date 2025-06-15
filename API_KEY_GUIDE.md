# Admin API Key Access Guide

## Getting Your API Key

The admin API key is required to send targeted notifications and access admin-only features. Here are the ways to get your API key:

### Method 1: Check Environment File (Recommended for Development)

1. Navigate to the backend directory: `backend/`
2. Open the `.env` file
3. Look for the line: `API_KEY="secretkey"`
4. The value after the equals sign is your API key (in this case: `secretkey`)

### Method 2: Use the Development Endpoint

If your backend server is running, you can fetch the API key programmatically:

```bash
curl http://localhost:8000/dev/api-key
```

This will return:
```json
{
  "api_key": "secretkey",
  "note": "This endpoint should only be used in development mode",
  "env_file": "backend/.env",
  "usage": "Use this key in the X-API-KEY header for admin endpoints"
}
```

### Method 3: Use the Admin Panel Button

1. Go to the Admin Notification Panel: `http://localhost:3000/admin/notifications`
2. In the API Key field, click the "Get Key" button
3. The key will be automatically filled in

## Using the API Key

### In the Admin Panel (Web Interface)

1. Navigate to: `http://localhost:3000/admin/notifications`
2. Enter the API key in the "API Key" field
3. Fill out the notification details
4. Click "Send Notification"

### In API Requests (curl/Postman)

Include the API key in the `X-API-KEY` header:

```bash
# Send targeted notification
curl -X POST http://localhost:8000/admin/notifications/targeted \
  -H "X-API-KEY: secretkey" \
  -H "Content-Type: application/json" \
  -d '{
    "disaster_type": "Flood",
    "location": "Kuala Lumpur",
    "title": "Flash Flood Warning",
    "message": "Heavy rain expected in the area. Stay safe!",
    "type": "warning"
  }'

# Send system notification
curl -X POST http://localhost:8000/admin/notifications/system \
  -H "X-API-KEY: secretkey" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "System Maintenance",
    "message": "The system will be under maintenance tonight.",
    "type": "info"
  }'
```

### In JavaScript/Frontend Code

```javascript
import { adminNotificationAPI } from '../api';

// Send targeted notification
const response = await adminNotificationAPI.createTargetedNotification({
  disaster_type: "Earthquake",
  location: "Selangor",
  title: "Earthquake Alert",
  message: "Minor earthquake detected. Stay alert.",
  type: "warning"
}, "secretkey"); // API key as second parameter
```

## Security Notes

### Development Environment
- The default API key `"secretkey"` is fine for local development
- The `/dev/api-key` endpoint only works in development mode

### Production Environment
- **NEVER** use `"secretkey"` in production
- Generate a strong, unique API key
- Store it securely in environment variables
- The `/dev/api-key` endpoint is automatically disabled in production
- Consider implementing proper admin authentication instead of just API keys

### Changing the API Key

1. Edit the `backend/.env` file
2. Change the line: `API_KEY="your_new_secure_key_here"`
3. Restart your backend server
4. Update any scripts or applications using the old key

## Available Admin Endpoints

| Endpoint | Method | Description |
|----------|---------|-------------|
| `/admin/notifications/system` | POST | Send notifications to all users or specific user IDs |
| `/admin/notifications/targeted` | POST | Send notifications to users subscribed to specific disaster types/locations |
| `/dev/api-key` | GET | Get API key information (development only) |

## Troubleshooting

### "Invalid API Key" Error
- Check that your API key matches the one in `backend/.env`
- Ensure there are no extra spaces or quotes when copying the key
- Restart the backend server after changing the API key

### "Not Found" Error on `/dev/api-key`
- This endpoint only works in development mode
- Check your environment settings
- Use Method 1 (check .env file) instead

### No Users Notified
- Check that users have subscribed to the disaster type and location you're targeting
- Users need to set up their notification preferences first
- Try sending a system notification to all users for testing
