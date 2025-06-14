import React from 'react';
import { Bell, Plus } from 'lucide-react';
import NotificationDropdown from '../ui/NotificationDropdown';

const NotificationCenter = ({
  unreadCount,
  isDropdownOpen,
  notifications,
  onToggleDropdown,
  onTestNotification,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
}) => {
  return (
    <div className="flex items-center space-x-4">
      {/* Notification */}
      <div className="relative">
        <button
          className="flex items-center notification-btn relative p-2 rounded-lg hover:bg-gray-700 transition-colors"
          onClick={onToggleDropdown}
        >
          <Bell className="w-6 h-6 text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <NotificationDropdown
          isOpen={isDropdownOpen}
          notifications={notifications}
          onClose={onClose}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onDelete={onDelete}
          onClearAll={onClearAll}
        />
      </div>
    </div>
  );
};

export default NotificationCenter;
