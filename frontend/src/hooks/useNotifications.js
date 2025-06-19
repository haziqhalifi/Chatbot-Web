import { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../api';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications - only called when dropdown is opened
  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationAPI.getNotifications({
        ...params,
        limit: 15, // Limit to reduce payload
      });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unread_count);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Lightweight unread count fetch
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.unread_count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  // Mark notification as read with optimistic update
  const markAsRead = useCallback(async (notificationId) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationAPI.markAsRead(notificationId);
    } catch (err) {
      // Revert optimistic update on error
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, read: false } : notification
        )
      );
      setUnreadCount((prev) => prev + 1);
      setError(err.response?.data?.detail || 'Failed to mark as read');
      throw err;
    }
  }, []);

  // Mark all notifications as read with optimistic update
  const markAllAsRead = useCallback(async () => {
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    // Optimistic update
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    setUnreadCount(0);

    try {
      await notificationAPI.markAllAsRead();
    } catch (err) {
      // Revert optimistic update on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      setError(err.response?.data?.detail || 'Failed to mark all as read');
      throw err;
    }
  }, [notifications, unreadCount]);

  // Delete notification with optimistic update
  const deleteNotification = useCallback(
    async (notificationId) => {
      const notificationToDelete = notifications.find((n) => n.id === notificationId);
      const wasUnread = notificationToDelete && !notificationToDelete.read;

      // Optimistic update
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );

      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        await notificationAPI.deleteNotification(notificationId);
      } catch (err) {
        // Revert optimistic update on error
        if (notificationToDelete) {
          setNotifications((prev) => [...prev, notificationToDelete]);
          if (wasUnread) {
            setUnreadCount((prev) => prev + 1);
          }
        }
        setError(err.response?.data?.detail || 'Failed to delete notification');
        throw err;
      }
    },
    [notifications]
  );

  // Clear all notifications with optimistic update
  const clearAll = useCallback(async () => {
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    // Optimistic update
    setNotifications([]);
    setUnreadCount(0);

    try {
      await notificationAPI.clearAll();
    } catch (err) {
      // Revert optimistic update on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      setError(err.response?.data?.detail || 'Failed to clear all notifications');
      throw err;
    }
  }, [notifications, unreadCount]);

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

  // Intelligent polling - only when necessary
  useEffect(() => {
    let interval;
    let isVisible = true;
    let lastActivity = Date.now();

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastActivity = Date.now();
        // Fetch unread count when tab becomes visible
        if (localStorage.getItem('token')) {
          fetchUnreadCount();
        }
      }
    };

    const handleUserActivity = () => {
      lastActivity = Date.now();
    };

    // Only poll if document is visible and user was active recently
    const startPolling = () => {
      interval = setInterval(() => {
        const now = Date.now();
        const inactiveTime = now - lastActivity;
        
        // Only poll if:
        // - User is authenticated
        // - Document is visible
        // - User was active in the last 5 minutes
        if (
          localStorage.getItem('token') &&
          isVisible &&
          inactiveTime < 5 * 60 * 1000
        ) {
          fetchUnreadCount();
        }
      }, 2 * 60 * 1000); // Poll every 2 minutes instead of 30 seconds
    };

    // Event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('click', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('mousemove', handleUserActivity);

    // Start polling
    startPolling();

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('mousemove', handleUserActivity);
    };
  }, [fetchUnreadCount]);

  // Initial unread count fetch - don't fetch all notifications on mount
  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchUnreadCount();
    }
  }, [fetchUnreadCount]);

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
