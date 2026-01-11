import api from './client';

// Admin notification API endpoints
const adminNotificationAPI = {
  // Create system notification (admin only)
  createSystemNotification: (data, apiKey) => {
    return api.post('/admin/notifications/system', data, {
      headers: {
        'X-API-KEY': apiKey,
      },
    });
  },

  // Create targeted notification (admin only)
  createTargetedNotification: (data, apiKey) => {
    return api.post('/admin/notifications/targeted', data, {
      headers: {
        'X-API-KEY': apiKey,
      },
    });
  },
};

export default adminNotificationAPI;
