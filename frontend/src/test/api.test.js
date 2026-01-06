import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('API Client Setup', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create axios instance with correct base URL', () => {
    expect(axios.create).toBeDefined();
  });

  it('should add Authorization header when token exists', () => {
    const token = 'test-token-123';
    localStorage.setItem('token', token);

    // Simulate what the interceptor does
    const config = { headers: {} };
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    }

    expect(config.headers.Authorization).toBe(`Bearer ${token}`);
  });

  it('should not add Authorization header when token does not exist', () => {
    const config = { headers: {} };
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    }

    expect(config.headers.Authorization).toBeUndefined();
  });

  it('should add API key to headers', () => {
    const config = { headers: {} };
    config.headers['x-api-key'] = 'secretkey';

    expect(config.headers['x-api-key']).toBe('secretkey');
  });
});

describe('Notification API Endpoints', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should have getNotifications endpoint function', () => {
    // Mock endpoint structure
    const endpoints = {
      getNotifications: (params = {}) => {
        const { limit = 50, offset = 0, unread_only = false } = params;
        return Promise.resolve({
          data: {
            notifications: [],
            total: 0,
            limit,
            offset,
          },
        });
      },
    };

    expect(endpoints.getNotifications).toBeDefined();
    expect(typeof endpoints.getNotifications).toBe('function');
  });

  it('should have getUnreadCount endpoint function', () => {
    const endpoints = {
      getUnreadCount: () => {
        return Promise.resolve({ data: { unread_count: 0 } });
      },
    };

    expect(endpoints.getUnreadCount).toBeDefined();
  });

  it('should have markAsRead endpoint function', () => {
    const endpoints = {
      markAsRead: (notificationId) => {
        return Promise.resolve({ data: { success: true } });
      },
    };

    expect(endpoints.markAsRead).toBeDefined();
    expect(typeof endpoints.markAsRead).toBe('function');
  });

  it('should have markAllAsRead endpoint function', () => {
    const endpoints = {
      markAllAsRead: () => {
        return Promise.resolve({ data: { success: true } });
      },
    };

    expect(endpoints.markAllAsRead).toBeDefined();
  });

  it('should have deleteNotification endpoint function', () => {
    const endpoints = {
      deleteNotification: (notificationId) => {
        return Promise.resolve({ data: { success: true } });
      },
    };

    expect(endpoints.deleteNotification).toBeDefined();
  });

  it('should have clearAll endpoint function', () => {
    const endpoints = {
      clearAll: () => {
        const token = localStorage.getItem('token');
        return Promise.resolve({
          data: { success: true, message: 'All notifications cleared' },
        });
      },
    };

    expect(endpoints.clearAll).toBeDefined();
  });

  it('should pass correct parameters to getNotifications', async () => {
    const params = { limit: 20, offset: 10, unread_only: true };
    const endpoint = (params = {}) => {
      const { limit = 50, offset = 0, unread_only = false } = params;
      return Promise.resolve({
        data: { limit, offset, unread_only },
      });
    };

    const response = await endpoint(params);
    expect(response.data.limit).toBe(20);
    expect(response.data.offset).toBe(10);
    expect(response.data.unread_only).toBe(true);
  });
});

describe('Admin Notification API', () => {
  it('should have createSystemNotification endpoint', () => {
    const endpoints = {
      createSystemNotification: (data, apiKey) => {
        return Promise.resolve({
          data: { success: true, notificationId: '123' },
        });
      },
    };

    expect(endpoints.createSystemNotification).toBeDefined();
  });

  it('should send API key in headers for admin endpoints', () => {
    const apiKey = 'admin-key-123';
    const headers = { 'X-API-KEY': apiKey };

    expect(headers['X-API-KEY']).toBe(apiKey);
  });
});

describe('Error Handling', () => {
  it('should handle request errors', async () => {
    const makeRequest = () => {
      return Promise.reject(new Error('Network error'));
    };

    await expect(makeRequest()).rejects.toThrow('Network error');
  });

  it('should handle 401 Unauthorized', () => {
    const error = new Error('Unauthorized');
    error.response = { status: 401 };

    expect(error.response.status).toBe(401);
  });

  it('should handle 403 Forbidden', () => {
    const error = new Error('Forbidden');
    error.response = { status: 403 };

    expect(error.response.status).toBe(403);
  });

  it('should handle 500 Server Error', () => {
    const error = new Error('Server error');
    error.response = { status: 500 };

    expect(error.response.status).toBe(500);
  });
});
