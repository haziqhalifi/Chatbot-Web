import { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../api';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationAPI.getNotifications(params);
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unread_count);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count only
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.unread_count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to mark as read');
      throw err;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to mark all as read');
      throw err;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId) => {
      try {
        await notificationAPI.deleteNotification(notificationId);
        const notificationToDelete = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId)
        );

        // Update unread count if the deleted notification was unread
        if (notificationToDelete && !notificationToDelete.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to delete notification');
        throw err;
      }
    },
    [notifications]
  );
  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      console.log('useNotifications: clearAll called');
      const response = await notificationAPI.clearAll();
      console.log('useNotifications: clearAll API response:', response);
      setNotifications([]);
      setUnreadCount(0);
      console.log('useNotifications: state updated after clearAll');
    } catch (err) {
      console.error('useNotifications: clearAll error:', err);
      setError(err.response?.data?.detail || 'Failed to clear all notifications');
      throw err;
    }
  }, []);

  // Create notification (for testing purposes)
  const createNotification = useCallback(
    async (data) => {
      try {
        await notificationAPI.createNotification(data);
        // Refresh notifications after creating
        fetchNotifications();
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to create notification');
        throw err;
      }
    },
    [fetchNotifications]
  );

  // Auto-refresh unread count every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (localStorage.getItem('token')) {
        fetchUnreadCount();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Initial load
  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    createNotification,
    clearError: () => setError(null),
  };
};
