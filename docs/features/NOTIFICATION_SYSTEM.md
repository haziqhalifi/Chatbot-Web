# Notification System Documentation

## Recent Update: Subscription-Based Notifications

### Overview

The notification system now supports subscription-based notifications, allowing users to customize which disaster alerts they receive based on:

- **Disaster Types**: Subscribe to specific types like floods, earthquakes, landslides, etc.
- **Locations**: Subscribe to specific geographic areas (states, cities, regions)
- **Alert Radius**: Set the radius (in km) for location-based alerts
- **Notification Methods**: Choose how to receive notifications (currently web-based, email/SMS coming soon)

### Key Features

1. **Smart Targeting**: Notifications are only sent to users who have subscribed to the relevant disaster type AND location
2. **Flexible Preferences**: Users can subscribe to all types/locations or be selective
3. **Real-time Filtering**: When disasters are reported, the system automatically notifies only subscribed users
4. **Admin Controls**: Administrators can send targeted notifications to specific subscriber groups

### User Interface

- **Subscription Badge**: Visual indicator showing subscription status in the notification area
- **Full Management Interface**: Complete subscription management page at `/notification-settings`
- **Automatic Notifications**: Users receive alerts when disasters match their preferences
- **Confirmation Notifications**: Users are notified when their preferences are updated

### Admin Features

- **Targeted Notifications**: Send alerts to users subscribed to specific disaster types and locations
- **Testing Interface**: Admin panel at `/admin/notifications` for testing targeted notifications
- **Subscriber Analytics**: See how many users were notified for each alert

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
    disaster_type NVARCHAR(100) NULL, -- Type of disaster (flood, earthquake, etc.)
    location NVARCHAR(255) NULL, -- Location of the disaster/event
    read_status BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

### Subscription Schema

The subscription system uses an additional table for managing user preferences:

```sql
CREATE TABLE user_subscriptions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    disaster_types NVARCHAR(500), -- JSON array of disaster types
    locations NVARCHAR(500), -- JSON array of locations/areas
    notification_methods NVARCHAR(200) DEFAULT 'web', -- web, email, sms (future)
    radius_km INT DEFAULT 10, -- Alert radius in kilometers for location-based alerts
    is_active BIT DEFAULT 1,
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

- **POST /admin/notifications/targeted** - Create targeted notifications based on subscriptions
  - Header: `X-API-KEY: your_api_key`
  - Body: `{disaster_type: string, location: string, title: string, message: string, type: string}`

#### Subscription Endpoints (Require Bearer Token)

- **GET /subscriptions** - Get user's notification subscription preferences

  - Returns: `{id: number, disaster_types: string[], locations: string[], notification_methods: string[], radius_km: number, is_active: boolean}`

- **POST /subscriptions** - Create or update subscription preferences

  - Body: `{disaster_types: string[], locations: string[], notification_methods: string[], radius_km: number}`

- **DELETE /subscriptions** - Delete user's subscription preferences

- **GET /subscriptions/disaster-types** - Get available disaster types

  - Returns: `{disaster_types: string[]}`

- **GET /subscriptions/locations** - Get popular locations
  - Returns: `{locations: string[]}`

### Backend Functions

Key functions in `notifications.py`:

- `create_notification()` - Create a new notification
- `get_user_notifications()` - Fetch user notifications with filters
- `mark_notification_as_read()` - Mark single notification as read
- `mark_all_notifications_as_read()` - Mark all as read
- `delete_notification()` - Delete single notification
- `clear_all_notifications()` - Clear all user notifications
- `create_system_notification()` - Create system-wide notifications

Key functions in `subscriptions.py`:

- `create_or_update_subscription()` - Create or update user subscription preferences
- `get_user_subscription()` - Get user's subscription settings
- `delete_subscription()` - Delete user's subscription
- `get_subscribed_users_for_alert()` - Get users who should receive specific alerts
- `create_targeted_disaster_notification()` - Send notifications to subscribed users
- `get_available_disaster_types()` - Get list of disaster types
- `get_popular_locations()` - Get list of popular locations

### Auto-Generated Notifications

The system automatically creates notifications for:

1. **Welcome Notification** - When a user signs up
2. **Report Confirmation** - When a disaster report is submitted
3. **Emergency Alerts** - For disaster warnings (admin-triggered)
4. **Targeted Disaster Alerts** - When disasters are reported, subscribed users are notified
5. **Subscription Confirmation** - When users update their notification preferences

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

// Subscription API endpoints
export const subscriptionAPI = {
  getSubscription: () => api.get("/subscriptions"),
  updateSubscription: (data) => api.post("/subscriptions", data),
  deleteSubscription: () => api.delete("/subscriptions"),
  getDisasterTypes: () => api.get("/subscriptions/disaster-types"),
  getLocations: () => api.get("/subscriptions/locations"),
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

The `useSubscriptions` hook provides:

```javascript
const {
  subscription, // User's subscription preferences
  disasterTypes, // Available disaster types
  locations, // Available locations
  loading, // Loading state
  error, // Error message
  updateSubscription, // Update preferences
  deleteSubscription, // Delete subscription
  isSubscribedToType, // Check if subscribed to disaster type
  isSubscribedToLocation, // Check if subscribed to location
} = useSubscriptions();
```

### Components

1. **NotificationSystem.jsx** - Complete notification bell with dropdown
2. **NotificationDropdown.jsx** - Dropdown component showing notifications
3. **SubscriptionManager.jsx** - Full subscription management interface
4. **SubscriptionBadge.jsx** - Simple subscription status indicator
5. **AdminNotificationPanel.jsx** - Admin interface for sending targeted notifications

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

### Subscription-Based Notifications

- **Disaster Type Filtering** - Users can subscribe to specific disaster types (flood, earthquake, etc.)
- **Location-Based Alerts** - Users can subscribe to specific geographic areas
- **Smart Matching** - Notifications are sent only to users who match both disaster type and location criteria
- **Flexible Preferences** - Users can subscribe to all types/locations or be selective
- **Radius-Based Alerts** - Configurable alert radius for location-based notifications

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
- Subscription status badge
- Proper loading states
- Error handling with user feedback
- Optimistic UI updates

### Security

- JWT token authentication for all user endpoints
- API key protection for admin endpoints
- User isolation (users only see their own notifications)

## Development & Testing

### API Key Setup

For admin functionality, you need an API key:

1. **Development**: Use the default key `"secretkey"` from `backend/.env`
2. **Get Key Programmatically**: `GET http://localhost:8000/dev/api-key` (development only)
3. **Admin Panel**: Use the "Get Key" button in the notification admin panel

**Default API Key**: `secretkey` (from `backend/.env` → `API_KEY="secretkey"`)

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

# Get subscription preferences
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/subscriptions

# Update subscription preferences
curl -X POST -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"disaster_types":["Flood","Earthquake"],"locations":["Kuala Lumpur"],"notification_methods":["web"],"radius_km":15}' \
     http://localhost:8000/subscriptions

# Send targeted notification (replace API_KEY with actual key)
curl -X POST -H "X-API-KEY: API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"disaster_type":"Flood","location":"Kuala Lumpur","title":"Flash Flood Warning","message":"Heavy rain expected. Stay safe!","type":"warning"}' \
     http://localhost:8000/admin/notifications/targeted
```

## Error Handling

The system includes comprehensive error handling:

- Database connection errors
- Authentication failures
- Validation errors
- Network timeouts

All errors are properly logged and user-friendly messages are displayed in the UI.
