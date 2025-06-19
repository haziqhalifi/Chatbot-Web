import { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../api';

// Browser storage keys
const STORAGE_KEYS = {
  NOTIFICATIONS: 'app_notifications',
  UNREAD_COUNT: 'app_unread_count',
  LAST_SYNC: 'app_last_notification_sync',
};

// Custom event for cross-tab communication
const NOTIFICATION_EVENT = 'notificationUpdate';

export const useEventDrivenNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load from localStorage
  const loadFromStorage = useCallback(() => {
    try {
      const storedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const storedUnreadCount = localStorage.getItem(STORAGE_KEYS.UNREAD_COUNT);
      
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
      if (storedUnreadCount) {
        setUnreadCount(parseInt(storedUnreadCount, 10));
      }
    } catch (err) {
      console.error('Failed to load notifications from storage:', err);
    }
  }, []);

  // Save to localStorage and broadcast change
  const saveToStorage = useCallback((notifs, count) => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
      localStorage.setItem(STORAGE_KEYS.UNREAD_COUNT, count.toString());
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
      
      // Broadcast to other tabs
      window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, {
        detail: { notifications: notifs, unreadCount: count }
      }));
    } catch (err) {
      console.error('Failed to save notifications to storage:', err);
    }
  }, []);

  // Sync with server only when needed
  const syncWithServer = useCallback(async (force = false) => {
    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    const now = Date.now();
    
    // Sync every 5 minutes or when forced
    if (!force && lastSync && (now - parseInt(lastSync, 10)) < 5 * 60 * 1000) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await notificationAPI.getNotifications({ 
        limit: 20,
        since: lastSync ? new Date(parseInt(lastSync, 10)).toISOString() : undefined
      });
      
      const newNotifications = response.data.notifications;
      const newUnreadCount = response.data.unread_count;
      
      setNotifications(newNotifications);
      setUnreadCount(newUnreadCount);
      saveToStorage(newNotifications, newUnreadCount);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to sync notifications');
    } finally {
      setLoading(false);
    }
  }, [saveToStorage]);

  // Update local state and storage
  const updateNotifications = useCallback((updater, countUpdater) => {
    setNotifications(prev => {
      const updated = updater(prev);
      setUnreadCount(currentCount => {
        const newCount = countUpdater ? countUpdater(currentCount) : currentCount;
        saveToStorage(updated, newCount);
        return newCount;
      });
      return updated;
    });
  }, [saveToStorage]);

  // API actions with local updates
  const markAsRead = useCallback(async (notificationId) => {
    // Update locally first
    updateNotifications(
      prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n),
      prev => Math.max(0, prev - 1)
    );

    try {
      await notificationAPI.markAsRead(notificationId);
    } catch (err) {
      // Revert on error
      updateNotifications(
        prev => prev.map(n => n.id === notificationId ? { ...n, read: false } : n),
        prev => prev + 1
      );
      setError(err.response?.data?.detail || 'Failed to mark as read');
      throw err;
    }
  }, [updateNotifications]);

  const markAllAsRead = useCallback(async () => {
    const previousNotifications = notifications;

    // Update locally first
    updateNotifications(
      prev => prev.map(n => ({ ...n, read: true })),
      () => 0
    );

    try {
      await notificationAPI.markAllAsRead();
    } catch (err) {
      // Revert on error
      setNotifications(previousNotifications);
      setUnreadCount(previousNotifications.filter(n => !n.read).length);
      setError(err.response?.data?.detail || 'Failed to mark all as read');
      throw err;
    }
  }, [notifications, updateNotifications]);

  const deleteNotification = useCallback(async (notificationId) => {
    const notificationToDelete = notifications.find(n => n.id === notificationId);
    const wasUnread = notificationToDelete && !notificationToDelete.read;

    // Update locally first
    updateNotifications(
      prev => prev.filter(n => n.id !== notificationId),
      prev => wasUnread ? Math.max(0, prev - 1) : prev
    );

    try {
      await notificationAPI.deleteNotification(notificationId);
    } catch (err) {
      // Revert on error
      if (notificationToDelete) {
        updateNotifications(
          prev => [...prev, notificationToDelete],
          prev => wasUnread ? prev + 1 : prev
        );
      }
      setError(err.response?.data?.detail || 'Failed to delete notification');
      throw err;
    }
  }, [notifications, updateNotifications]);

  const clearAllNotifications = useCallback(async () => {
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    // Update locally first
    updateNotifications(() => [], () => 0);

    try {
      await notificationAPI.clearAll();
    } catch (err) {
      // Revert on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      saveToStorage(previousNotifications, previousUnreadCount);
      setError(err.response?.data?.detail || 'Failed to clear all notifications');
      throw err;
    }
  }, [notifications, unreadCount, updateNotifications, saveToStorage]);

  // Add new notification (for real-time updates)
  const addNotification = useCallback((notification) => {
    updateNotifications(
      prev => [notification, ...prev.slice(0, 19)], // Keep only 20 most recent
      prev => prev + 1
    );
  }, [updateNotifications]);

  // Listen for cross-tab updates
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.NOTIFICATIONS || e.key === STORAGE_KEYS.UNREAD_COUNT) {
        loadFromStorage();
      }
    };

    const handleNotificationEvent = (e) => {
      setNotifications(e.detail.notifications);
      setUnreadCount(e.detail.unreadCount);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(NOTIFICATION_EVENT, handleNotificationEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(NOTIFICATION_EVENT, handleNotificationEvent);
    };
  }, [loadFromStorage]);

  // Initialize
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadFromStorage();
      
      // Sync with server on app start
      const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      if (!lastSync || (Date.now() - parseInt(lastSync, 10)) > 5 * 60 * 1000) {
        syncWithServer(true);
      }
    }
  }, [loadFromStorage, syncWithServer]);

  // Periodic sync when app is active
  useEffect(() => {
    let interval;
    
    const handleFocus = () => {
      // Sync when app regains focus
      syncWithServer();
      
      // Setup periodic sync while app is active
      interval = setInterval(() => {
        if (!document.hidden) {
          syncWithServer();
        }
      }, 5 * 60 * 1000); // 5 minutes
    };

    const handleBlur = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Start if already focused
    if (document.hasFocus()) {
      handleFocus();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [syncWithServer]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
    syncWithServer: () => syncWithServer(true),
    clearError: () => setError(null),
  };
};
