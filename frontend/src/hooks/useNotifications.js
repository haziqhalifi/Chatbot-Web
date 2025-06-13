import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

// Sample notifications data - in a real app, this would come from an API
const initialNotifications = [
  {
    id: 1,
    title: 'Flood Warning Alert',
    message: 'Heavy rainfall expected in your area. Water levels rising rapidly.',
    type: 'warning',
    read: false,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
  },
  {
    id: 2,
    title: 'Evacuation Center Opened',
    message: 'Emergency shelter available at Community Center on Main Street.',
    type: 'info',
    read: false,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
  {
    id: 3,
    title: 'Weather Update',
    message: 'Storm warning has been lifted for your region.',
    type: 'success',
    read: true,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 4,
    title: 'Emergency Alert',
    message: 'Landslide risk detected. Avoid mountainous areas.',
    type: 'danger',
    read: false,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  },
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Initialize notifications
  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      setNotifications(initialNotifications);
      setIsLoading(false);
    }, 500);

    // Listen for new notifications from the service
    const unsubscribe = notificationService.addListener((notification) => {
      addNotification(notification);
    });

    return unsubscribe;
  }, []);

  // Mark a single notification as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  };

  // Delete a single notification
  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Add a new notification (for real-time updates)
  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(), // Simple ID generation
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Get unread notifications count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Get notifications sorted by timestamp (newest first)
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return {
    notifications: sortedNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
  };
};
