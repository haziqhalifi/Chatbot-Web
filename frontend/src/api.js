import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Notification API endpoints
export const notificationAPI = {
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

// Admin notification API endpoints
export const adminNotificationAPI = {
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

// Subscription API endpoints
export const subscriptionAPI = {
  // Get user's subscription preferences
  getSubscription: () => {
    return api.get('/subscriptions');
  },

  // Create or update subscription
  updateSubscription: (data) => {
    return api.post('/subscriptions', data);
  },

  // Delete subscription
  deleteSubscription: () => {
    return api.delete('/subscriptions');
  },

  // Get available disaster types
  getDisasterTypes: () => {
    return api.get('/subscriptions/disaster-types');
  },

  // Get popular locations
  getLocations: () => {
    return api.get('/subscriptions/locations');
  },
};

// FAQ API endpoints
export const faqAPI = {
  // Get all FAQs
  getFAQs: () => {
    return api.get('/faqs');
  },

  // Get specific FAQ by ID
  getFAQ: (faqId) => {
    return api.get(`/faqs/${faqId}`);
  },

  // Admin endpoints (require API key)
  createFAQ: (data, apiKey) => {
    return api.post('/admin/faqs', data, {
      headers: { 'X-API-Key': apiKey },
    });
  },

  updateFAQ: (faqId, data, apiKey) => {
    return api.put(`/admin/faqs/${faqId}`, data, {
      headers: { 'X-API-Key': apiKey },
    });
  },

  deleteFAQ: (faqId, apiKey) => {
    return api.delete(`/admin/faqs/${faqId}`, {
      headers: { 'X-API-Key': apiKey },
    });
  },
};

export default api;
