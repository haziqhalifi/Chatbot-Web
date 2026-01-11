import api from './client';

// Notification API endpoints
const notificationAPI = {
  // Get notifications with optional filters
  getNotifications: (params = {}) => {
    const { limit = 50, offset = 0, unread_only = false } = params;
    return api.get('/notifications', {
      params: { limit, offset, unread_only },
    });
  },

  // Get unread notification count
  getUnreadCount: () => {
    return api.get('/notifications/unread-count');
  },

  // Create a notification
  createNotification: (data) => {
    return api.post('/notifications', data);
  },

  // Create a test enhanced notification (development)
  createTestEnhancedNotification: () => {
    return api.post('/dev/test-enhanced-notification');
  },

  // Mark notification as read
  markAsRead: (notificationId) => {
    return api.put(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    return api.put('/notifications/mark-all-read');
  },

  // Delete a notification
  deleteNotification: (notificationId) => {
    return api.delete(`/notifications/${notificationId}`);
  },

  // Clear all notifications
  clearAll: () => {
    console.log('API: clearAll called');
    const token = localStorage.getItem('token');
    console.log('API: token exists:', !!token);
    return api.delete('/notifications');
  },
};

export default notificationAPI;
