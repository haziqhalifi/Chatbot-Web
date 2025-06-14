# Notification System Documentation

## Backend Implementation

### Database Schema

The notification system uses a SQL Server table with the following structure:

```sql
CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(1000) NOT NULL,
    type NVARCHAR(50) DEFAULT 'info', -- info, warning, danger, success
    read_status BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

### API Endpoints

#### User Notification Endpoints (Require Bearer Token)

- **GET /notifications** - Get user notifications with pagination

  - Query params: `limit`, `offset`, `unread_only`
  - Returns: `{notifications: [], total: number, unread_count: number}`

- **GET /notifications/unread-count** - Get count of unread notifications

  - Returns: `{unread_count: number}`

- **POST /notifications** - Create a notification for the authenticated user

  - Body: `{title: string, message: string, type: string}`

- **PUT /notifications/{id}/read** - Mark a notification as read

- **PUT /notifications/mark-all-read** - Mark all notifications as read

- **DELETE /notifications/{id}** - Delete a specific notification

- **DELETE /notifications** - Clear all notifications for the user

#### Admin Endpoints (Require API Key)

- **POST /admin/notifications/system** - Create system notifications
  - Header: `X-API-KEY: your_api_key`
  - Body: `{title: string, message: string, type: string, user_ids?: number[]}`

### Backend Functions

Key functions in `notifications.py`:

- `create_notification()` - Create a new notification
- `get_user_notifications()` - Fetch user notifications with filters
- `mark_notification_as_read()` - Mark single notification as read
- `mark_all_notifications_as_read()` - Mark all as read
- `delete_notification()` - Delete single notification
- `clear_all_notifications()` - Clear all user notifications
- `create_system_notification()` - Create system-wide notifications

### Auto-Generated Notifications

The system automatically creates notifications for:

1. **Welcome Notification** - When a user signs up
2. **Report Confirmation** - When a disaster report is submitted
3. **Emergency Alerts** - For disaster warnings (admin-triggered)

## Frontend Implementation

### API Integration

The `api.js` file includes:

```javascript
// Notification API endpoints
export const notificationAPI = {
  getNotifications: (params) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/mark-all-read"),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete("/notifications"),
};
```

### React Hook

The `useNotifications` hook provides:

```javascript
const {
  notifications, // Array of notification objects
  unreadCount, // Number of unread notifications
  loading, // Loading state
  error, // Error message
  fetchNotifications, // Refetch notifications
  markAsRead, // Mark single as read
  markAllAsRead, // Mark all as read
  deleteNotification, // Delete single notification
  clearAll, // Clear all notifications
  createNotification, // Create new notification
} = useNotifications();
```

### Components

1. **NotificationSystem.jsx** - Complete notification bell with dropdown
2. **NotificationDropdown.jsx** - Dropdown component showing notifications

### Usage Example

```jsx
import NotificationSystem from "./components/NotificationSystem";

function App() {
  return (
    <div className="app">
      <header>
        <h1>My App</h1>
        <NotificationSystem />
      </header>
      {/* Rest of your app */}
    </div>
  );
}
```

## Features

### Real-time Updates

- Auto-refresh unread count every 30 seconds
- Real-time state updates when marking as read/deleting

### Notification Types

- **info** (blue) - General information
- **success** (green) - Positive actions/confirmations
- **warning** (orange) - Warnings and alerts
- **danger** (red) - Critical alerts and errors

### User Experience

- Visual indicators for unread notifications
- Proper loading states
- Error handling with user feedback
- Optimistic UI updates

### Security

- JWT token authentication for all user endpoints
- API key protection for admin endpoints
- User isolation (users only see their own notifications)

## Development & Testing

### Environment Setup

1. Backend: Activate virtual environment and start FastAPI server
2. Frontend: Start React development server
3. Database: Ensure SQL Server connection is configured

### Testing Endpoints

Use the development controls in `NotificationSystem.jsx` or test with curl:

```bash
# Get notifications (replace TOKEN with actual JWT)
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/notifications

# Create test notification
curl -X POST -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test","message":"Test message","type":"info"}' \
     http://localhost:8000/notifications
```

## Error Handling

The system includes comprehensive error handling:

- Database connection errors
- Authentication failures
- Validation errors
- Network timeouts

All errors are properly logged and user-friendly messages are displayed in the UI.
