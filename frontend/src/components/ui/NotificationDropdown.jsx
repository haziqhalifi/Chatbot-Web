import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, X, Check, AlertTriangle, Info, CheckCircle, MapPin } from 'lucide-react';

const NotificationDropdown = ({
  isOpen,
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [processingNotifications, setProcessingNotifications] = useState(new Set());

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  // Handle marking notification as read with visual feedback
  const handleMarkAsRead = async (notificationId, e) => {
    if (e) {
      e.stopPropagation(); // Prevent dropdown from closing
    }
    setProcessingNotifications((prev) => new Set(prev).add(notificationId));
    try {
      await onMarkAsRead(notificationId);
    } finally {
      // Keep the processing state for a brief moment to show the animation
      setTimeout(() => {
        setProcessingNotifications((prev) => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
      }, 500);
    }
  };
  // Handle delete with event stopping
  const handleDelete = async (notificationId, e) => {
    if (e) {
      e.stopPropagation(); // Prevent dropdown from closing
      e.preventDefault(); // Prevent any default behavior
    }
    try {
      await onDelete(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  // Handle mark all as read
  const handleMarkAllAsRead = async (e) => {
    console.log('handleMarkAllAsRead called', e);
    if (e) {
      e.stopPropagation(); // Prevent dropdown from closing
      e.preventDefault(); // Also prevent default behavior
    }
    try {
      console.log('Calling onMarkAllAsRead...');
      await onMarkAllAsRead();
      console.log('onMarkAllAsRead completed successfully');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };
  // Handle keyboard navigation
  const handleKeyDown = (e, notification) => {
    e.stopPropagation(); // Prevent dropdown from closing
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!notification.read) {
        handleMarkAsRead(notification.id, e);
      }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      handleDelete(notification.id, e);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationBorderColor = (type) => {
    switch (type) {
      case 'warning':
        return 'border-l-orange-500';
      case 'danger':
        return 'border-l-red-500';
      case 'success':
        return 'border-l-green-500';
      case 'info':
      default:
        return 'border-l-blue-500';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notifTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };
  return (
    <div
      className="notification-dropdown absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
      onClick={(e) => e.stopPropagation()} // Prevent any clicks inside from bubbling up
      onMouseDown={(e) => e.stopPropagation()} // Prevent mousedown from bubbling up
      onScroll={(e) => e.stopPropagation()} // Prevent scroll events from bubbling up
      onWheel={(e) => e.stopPropagation()} // Prevent wheel events from bubbling up
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">{t('disaster.notifications')}</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {' '}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>{' '}
      {/* Notifications List */}
      <div
        className="max-h-80 overflow-y-auto"
        onScroll={(e) => e.stopPropagation()} // Prevent scroll events from bubbling up
        onMouseDown={(e) => e.stopPropagation()} // Prevent mousedown events from bubbling up
        onMouseUp={(e) => e.stopPropagation()} // Prevent mouseup events from bubbling up
        onWheel={(e) => e.stopPropagation()} // Prevent wheel events from bubbling up
      >
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Bell className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-sm">{t('disaster.noNotifications')}</p>
            <p className="text-xs text-gray-400">
              When you get notifications, they'll show up here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-l-4 ${getNotificationBorderColor(notification.type)} ${
                  !notification.read ? 'bg-blue-50' : 'bg-white'
                } transition-colors relative group`}
              >
                {' '}
                {/* Main clickable area - marks as read */}{' '}
                <div
                  onClick={(e) => !notification.read && handleMarkAsRead(notification.id, e)}
                  onKeyDown={(e) => handleKeyDown(e, notification)}
                  className={`p-4 ${!notification.read ? 'cursor-pointer hover:bg-blue-100' : 'hover:bg-gray-50'} transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset`}
                  title={!notification.read ? 'Click to mark as read' : ''}
                  tabIndex={0}
                  role="button"
                  aria-label={`${notification.read ? 'Read' : 'Unread'} notification: ${notification.title}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0 pr-8">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p
                              className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span
                                className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"
                                title="Unread"
                              ></span>
                            )}{' '}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>

                          {/* Disaster Type and Location Info */}
                          {(notification.disaster_type || notification.location) && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {notification.disaster_type && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  {notification.disaster_type}
                                </span>
                              )}
                              {notification.location && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {notification.location}
                                </span>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-gray-400 mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>{' '}
                {/* Delete button - positioned absolutely */}{' '}
                <button
                  onClick={(e) => handleDelete(notification.id, e)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  title="Delete notification"
                  aria-label={`Delete notification: ${notification.title}`}
                >
                  <X className="w-4 h-4" />
                </button>
                {/* Read indicator for screen readers */}
                {notification.read && (
                  <div className="absolute top-2 right-8 opacity-60">
                    <Check className="w-4 h-4 text-green-500" title="Read" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>{' '}
      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          {' '}
          <button
            onClick={(e) => {
              console.log('Clear all button clicked');
              e.stopPropagation();
              e.preventDefault();
              onClearAll();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full text-sm text-red-600 hover:text-red-800 font-medium py-2 hover:bg-red-50 rounded transition-colors"
          >
            Clear all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
