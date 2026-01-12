import api from './client';

// Admin notification API endpoints
const adminNotificationAPI = {
  // Get all notifications (admin only)
  getAllNotifications: (params) => {
    return api.get('/admin/notifications', { params });
  },

  // Get users for a specific notification (admin only)
  getNotificationUsers: (params) => {
    return api.get('/admin/notifications/users', { params });
  },

  // Get notification statistics (admin only)
  getNotificationStats: () => {
    return api.get('/admin/notifications/stats');
  },

  // Delete notification (admin only)
  deleteNotification: (notificationId) => {
    return api.delete(`/admin/notifications/${notificationId}`);
  },

  // Create system notification (admin only)
  createSystemNotification: (data) => {
    return api.post('/admin/notifications/system', data);
  },

  // Create targeted notification (admin only)
  createTargetedNotification: (data) => {
    return api.post('/admin/notifications/targeted', data);
  },
};

export default adminNotificationAPI;
