import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationDropdown from '../components/ui/NotificationDropdown';

const NotificationSystem = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const notificationRef = useRef(null);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    createNotification,
    clearError,
  } = useNotifications();
  // Handle clicks outside the notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log('Outside click detected', event.target);
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        console.log('Closing dropdown due to outside click');
        setIsDropdownOpen(false);
      } else {
        console.log('Click was inside notification area');
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  const handleMarkAllAsRead = async () => {
    console.log('NotificationSystem: handleMarkAllAsRead called');
    try {
      await markAllAsRead();
      console.log('NotificationSystem: markAllAsRead completed');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  const handleClearAll = async () => {
    console.log('handleClearAll called');
    try {
      console.log('Calling clearAll API...');
      await clearAll();
      console.log('clearAll completed successfully');
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  // Example function to create a test notification
  const handleCreateTestNotification = async () => {
    try {
      await createNotification({
        title: 'Test Notification',
        message: 'This is a test notification from the frontend.',
        type: 'info',
      });
    } catch (error) {
      console.error('Error creating test notification:', error);
    }
  };
  return (
    <div className="relative" ref={notificationRef}>
      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="ml-2 text-red-700 hover:text-red-900">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Notification Bell Icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsDropdownOpen(!isDropdownOpen);
        }}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <NotificationDropdown
        isOpen={isDropdownOpen}
        notifications={notifications}
        loading={loading}
        onClose={() => setIsDropdownOpen(false)}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDelete={handleDelete}
        onClearAll={handleClearAll}
      />

      {/* Development/Testing Controls */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
          <h3 className="text-sm font-semibold mb-2">Notification Testing</h3>
          <button
            onClick={handleCreateTestNotification}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            Create Test Notification
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
