import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationAPI } from '../api';

// Cache for notifications to avoid unnecessary re-renders
const notificationCache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000, // 5 minutes
};

export const useOptimizedNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const pollIntervalRef = useRef(null);
  const lastFetchRef = useRef(0);
  const isDocumentVisible = useRef(true);
  const hasInteracted = useRef(false);

  // Smart polling - only when needed
  const shouldPoll = useCallback(() => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchRef.current;
    
    // Don't poll if:
    // - Document is not visible
    // - User hasn't interacted recently
    // - Too soon since last fetch
    return (
      isDocumentVisible.current &&
      hasInteracted.current &&
      timeSinceLastFetch > 30000 // 30 seconds minimum
    );
  }, []);

  // Fetch only unread count (lightweight)
  const fetchUnreadCount = useCallback(async () => {
    if (!shouldPoll()) return;

    try {
      const response = await notificationAPI.getUnreadCount();
      const newCount = response.data.unread_count;
      
      // Only update if count changed
      if (newCount !== unreadCount) {
        setUnreadCount(newCount);
      }
      
      lastFetchRef.current = Date.now();
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
      // Don't show error for background polling
    }
  }, [unreadCount, shouldPoll]);

  // Fetch notifications with caching
  const fetchNotifications = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Use cache if available and not expired
    if (!forceRefresh && notificationCache.data && (now - notificationCache.timestamp < notificationCache.ttl)) {
      setNotifications(notificationCache.data.notifications);
      setUnreadCount(notificationCache.data.unread_count);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch recent notifications only (limit to 15)
      const response = await notificationAPI.getNotifications({ 
        limit: 15,
        include_read: true 
      });
      
      const data = response.data;
      
      // Update cache
      notificationCache.data = data;
      notificationCache.timestamp = now;
      
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
      lastFetchRef.current = now;
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimistic updates for better UX
  const markAsRead = useCallback(async (notificationId) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Invalidate cache
    notificationCache.data = null;

    try {
      await notificationAPI.markAsRead(notificationId);
    } catch (err) {
      // Revert optimistic update
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
      );
      setUnreadCount(prev => prev + 1);
      setError(err.response?.data?.detail || 'Failed to mark as read');
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    // Invalidate cache
    notificationCache.data = null;

    try {
      await notificationAPI.markAllAsRead();
    } catch (err) {
      // Revert optimistic update
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      setError(err.response?.data?.detail || 'Failed to mark all as read');
      throw err;
    }
  }, [notifications, unreadCount]);

  const deleteNotification = useCallback(async (notificationId) => {
    const notificationToDelete = notifications.find(n => n.id === notificationId);
    const wasUnread = notificationToDelete && !notificationToDelete.read;

    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Invalidate cache
    notificationCache.data = null;

    try {
      await notificationAPI.deleteNotification(notificationId);
    } catch (err) {
      // Revert optimistic update
      if (notificationToDelete) {
        setNotifications(prev => [...prev, notificationToDelete]);
        if (wasUnread) {
          setUnreadCount(prev => prev + 1);
        }
      }
      setError(err.response?.data?.detail || 'Failed to delete notification');
      throw err;
    }
  }, [notifications]);

  const clearAllNotifications = useCallback(async () => {
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    // Optimistic update
    setNotifications([]);
    setUnreadCount(0);

    // Invalidate cache
    notificationCache.data = null;

    try {
      await notificationAPI.clearAll();
    } catch (err) {
      // Revert optimistic update
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      setError(err.response?.data?.detail || 'Failed to clear all notifications');
      throw err;
    }
  }, [notifications, unreadCount]);

  // Document visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      isDocumentVisible.current = !document.hidden;
      
      // Fetch when document becomes visible after being hidden
      if (!document.hidden && hasInteracted.current) {
        const timeSinceLastFetch = Date.now() - lastFetchRef.current;
        if (timeSinceLastFetch > 60000) { // 1 minute
          fetchUnreadCount();
        }
      }
    };

    const handleUserInteraction = () => {
      hasInteracted.current = true;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [fetchUnreadCount]);

  // Smart polling setup
  useEffect(() => {
    if (!localStorage.getItem('token')) return;

    // Initial fetch
    fetchNotifications();
    hasInteracted.current = true;

    // Setup intelligent polling
    const startPolling = () => {
      if (pollIntervalRef.current) return;
      
      pollIntervalRef.current = setInterval(() => {
        if (shouldPoll()) {
          fetchUnreadCount();
        }
      }, 60000); // Check every minute, but only poll if conditions are met
    };

    const stopPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };

    startPolling();

    return () => {
      stopPolling();
    };
  }, [fetchNotifications, fetchUnreadCount, shouldPoll]);

  // Manual refresh for user-initiated actions
  const refreshNotifications = useCallback(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications,
    clearError: () => setError(null),
  };
};
