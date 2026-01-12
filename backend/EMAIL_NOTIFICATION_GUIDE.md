# Email Notification Guide

## Overview

The system now automatically sends email notifications to users who have subscribed to receive email alerts when:

1. Admin creates a **system-wide notification/announcement**
2. Admin creates a **targeted disaster notification** (based on disaster type and location)

## How It Works

### 1. User Subscription Check

- The system checks the `user_subscriptions` table for users who have `email` in their `notification_methods` field
- For targeted notifications, it also filters by disaster type and location preferences
- Only users with active subscriptions and valid email addresses receive emails

### 2. Email Sending Process

When an admin creates a notification:

1. **In-app notification** is created in the database for all applicable users
2. **Email service** queries for users with email subscriptions enabled
3. **Emails are sent** to subscribed users via SMTP
4. **Response includes stats**: users_notified, emails_sent, emails_failed

### 3. Email Content

Each notification email includes:

- **Subject**: `[DisasterWatch] {notification title}`
- **Type Badge**: ℹ️ Info | ✅ Success | ⚠️ Warning | 🚨 Alert
- **Title and Message**: From the notification
- **Disaster Details**: Type and location (if targeted notification)
- **Footer**: Instructions to manage preferences in account settings

## SMTP Configuration

### Required Environment Variables

Add these to your `.env` file or environment:

```env
# SMTP Email Configuration (Required for email notifications)
SMTP_HOST=smtp.gmail.com           # SMTP server hostname
SMTP_PORT=587                       # SMTP port (587 for TLS, 465 for SSL)
SMTP_USER=your-email@gmail.com     # SMTP username
SMTP_PASSWORD=your-app-password    # SMTP password or app-specific password
SMTP_FROM=noreply@disasterwatch.com # From email address (optional, defaults to SMTP_USER)

# Optional SMTP Settings
SMTP_TLS=true                       # Use TLS (default: true)
SMTP_SSL=false                      # Use SSL instead of TLS (default: false)
SMTP_TIMEOUT=20                     # Connection timeout in seconds (default: 20)
```

### Gmail Configuration Example

For Gmail, you need to:

1. Enable 2-factor authentication on your Google account
2. Generate an **App Password**: https://myaccount.google.com/apppasswords
3. Use the app password as `SMTP_PASSWORD`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM=DisasterWatch <your-email@gmail.com>
SMTP_TLS=true
```

### Other Email Providers

**Outlook/Office365**:

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_TLS=true
```

**SendGrid**:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

**Mailgun**:

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-smtp-password
```

## User Notification Preferences

Users can enable/disable email notifications in their account settings:

1. Go to **Settings** → **Notifications**
2. Under **Notification Methods**, check/uncheck **Email**
3. For targeted alerts, also configure:
   - **Disaster Types**: Which disasters to receive alerts for
   - **Locations**: Which areas to monitor

Database storage:

```sql
-- user_subscriptions table
notification_methods: 'web,email,sms'  -- Comma-separated list
disaster_types: '["Flood","Landslide"]'  -- JSON array
locations: '["Kuala Lumpur","Selangor"]'  -- JSON array
```

## API Response Format

### System Notification Response

```json
{
  "message": "System notification sent to 150 users",
  "users_notified": 150,
  "notifications_sent": 150,
  "emails_sent": 75,
  "emails_failed": 2
}
```

### Targeted Notification Response

```json
{
  "message": "Notifications sent to 25 users",
  "users_notified": 25,
  "emails_sent": 18,
  "emails_failed": 0,
  "errors": null
}
```

## Frontend Display

The admin notification management page shows email stats when creating notifications:

**Success message example**:

```
Notification sent successfully! (150 users notified, 75 emails sent, 2 emails failed)
```

## Troubleshooting

### No emails are being sent

1. **Check SMTP configuration**:

   ```python
   # In backend terminal
   python
   >>> import os
   >>> os.getenv("SMTP_HOST")
   # Should return your SMTP host, not None
   ```

2. **Verify email subscriptions**:

   ```sql
   SELECT u.email, s.notification_methods
   FROM users u
   JOIN user_subscriptions s ON u.user_id = s.user_id
   WHERE s.notification_methods LIKE '%email%';
   ```

3. **Check backend logs**:
   - Look for: `"SMTP not configured, skipping email notification"`
   - Or: `"Email notification sent to {email}"`
   - Or: `"Error sending email notification: ..."`

### Emails marked as spam

1. Configure SPF and DKIM records for your domain
2. Use a verified "From" address
3. Include unsubscribe link in email footer
4. Avoid spam trigger words in subject/body

### Authentication errors

- **Gmail**: Must use app password, not regular password
- **Office365**: May need to enable "Allow less secure apps"
- **SendGrid/Mailgun**: Use API key as password

## Code Architecture

### Files Modified

1. **`services/email_notification_service.py`** (NEW)

   - `send_system_notification_emails()`: Send to all subscribed users
   - `send_targeted_notification_emails()`: Send to users matching criteria
   - `send_notification_email()`: Send individual email with formatted content

2. **`services/notification_service.py`**

   - `create_system_notification()`: Integrated email sending
   - Returns email stats in response

3. **`services/subscription_service.py`**

   - `create_targeted_disaster_notification()`: Integrated email sending
   - Returns email stats in response

4. **`utils/email_sender.py`** (Existing)

   - Low-level SMTP email sending
   - Used by email_notification_service

5. **`frontend/src/pages/admin/NotificationManagement.jsx`**
   - Updated success message to show email stats
   - Displays emails_sent and emails_failed counts

### Database Schema

```sql
-- user_subscriptions table (already exists)
CREATE TABLE user_subscriptions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    disaster_types NVARCHAR(500),        -- JSON: ["Flood","Landslide"]
    locations NVARCHAR(500),              -- JSON: ["KL","Selangor"]
    notification_methods NVARCHAR(200),   -- Comma-separated: "web,email,sms"
    is_active BIT DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- users table (already exists)
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(100) UNIQUE NOT NULL,
    name NVARCHAR(100),
    ...
);
```

## Testing

### Manual Test

1. **Configure SMTP** (use Gmail app password for quick testing)
2. **Create user subscription** with email enabled:
   ```sql
   UPDATE user_subscriptions
   SET notification_methods = 'web,email'
   WHERE user_id = 1;
   ```
3. **Create notification** via admin panel
4. **Check inbox** for email from DisasterWatch
5. **Verify backend logs** show "Email notification sent to ..."

### Automated Test

```python
# tests/unit/test_email_notification.py
from services.email_notification_service import send_system_notification_emails

def test_email_notification_sending():
    result = send_system_notification_emails(
        title="Test Alert",
        message="This is a test notification",
        notification_type="info",
        user_ids=[1, 2, 3]
    )

    assert result["total_users"] > 0
    assert result["emails_sent"] >= 0
    # If SMTP configured, emails_sent should be > 0
```

## Future Enhancements

1. **Email Templates**: HTML email templates with branding
2. **Attachments**: Include maps, images, or PDFs
3. **Email Queue**: Use Celery or RQ for async sending
4. **Bounce Handling**: Track bounced emails and invalid addresses
5. **Unsubscribe Link**: One-click unsubscribe in footer
6. **Email Analytics**: Track open rates, click rates
7. **Rate Limiting**: Prevent spam and stay within provider limits
8. **Batch Sending**: Send in batches to avoid overwhelming SMTP server

## Security Considerations

1. **Password Protection**: Never commit SMTP passwords to git
2. **Use App Passwords**: Don't use primary account passwords
3. **TLS/SSL**: Always use encrypted connections
4. **Validate Emails**: Prevent email injection attacks
5. **Rate Limiting**: Limit emails per user/hour to prevent abuse
6. **Logging**: Log email sends but not content for privacy
