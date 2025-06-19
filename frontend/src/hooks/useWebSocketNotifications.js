import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationAPI } from '../api';

export const useWebSocketNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initial data fetch (only unread count and recent notifications)
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch only unread count and recent notifications (limit to 10)
      const [countResponse, recentResponse] = await Promise.all([
        notificationAPI.getUnreadCount(),
        notificationAPI.getNotifications({ limit: 10, unread_only: false })
      ]);
      
      setUnreadCount(countResponse.data.unread_count);
      setNotifications(recentResponse.data.notifications);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Adjust WebSocket URL based on your backend
      const wsUrl = `ws://localhost:8000/ws/notifications?token=${token}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectWebSocket();
          }, delay);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
      };

    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setError('Failed to establish real-time connection');
    }
  }, []);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'notification_created':
        setNotifications(prev => [data.notification, ...prev.slice(0, 9)]);
        setUnreadCount(prev => prev + 1);
        break;
        
      case 'notification_read':
        setNotifications(prev => 
          prev.map(n => n.id === data.notification_id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        break;
        
      case 'notification_deleted':
        setNotifications(prev => {
          const notification = prev.find(n => n.id === data.notification_id);
          if (notification && !notification.read) {
            setUnreadCount(count => Math.max(0, count - 1));
          }
          return prev.filter(n => n.id !== data.notification_id);
        });
        break;
        
      case 'notifications_cleared':
        setNotifications([]);
        setUnreadCount(0);
        break;
        
      case 'unread_count_updated':
        setUnreadCount(data.count);
        break;
        
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }, []);

  // Disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (ws.current) {
      ws.current.close(1000, 'Component unmounting');
      ws.current = null;
    }
    setIsConnected(false);
  }, []);

  // API actions with optimistic updates
  const markAsRead = useCallback(async (notificationId) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await notificationAPI.markAsRead(notificationId);
    } catch (err) {
      // Revert optimistic update on error
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

  const deleteNotification = useCallback(async (notificationId) => {
    const notificationToDelete = notifications.find(n => n.id === notificationId);
    const wasUnread = notificationToDelete && !notificationToDelete.read;

    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      await notificationAPI.deleteNotification(notificationId);
    } catch (err) {
      // Revert optimistic update on error
      setNotifications(prev => [...prev, notificationToDelete]);
      if (wasUnread) {
        setUnreadCount(prev => prev + 1);
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

  // Load more notifications (for dropdown expansion)
  const loadMoreNotifications = useCallback(async () => {
    try {
      const response = await notificationAPI.getNotifications({
        offset: notifications.length,
        limit: 20
      });
      setNotifications(prev => [...prev, ...response.data.notifications]);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load more notifications');
    }
  }, [notifications.length]);

  // Effects
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchInitialData();
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [fetchInitialData, connectWebSocket, disconnectWebSocket]);

  // Reconnect when token changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (e.newValue) {
          fetchInitialData();
          connectWebSocket();
        } else {
          disconnectWebSocket();
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchInitialData, connectWebSocket, disconnectWebSocket]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    loadMoreNotifications,
    clearError: () => setError(null),
  };
};
