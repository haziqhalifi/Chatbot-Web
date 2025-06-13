import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Plus } from 'lucide-react';
import AccountPage from '../../pages/Account';
import ReportModal from '../../pages/ReportModal';
import EmergencySupport from '../../pages/EmergencySupport';
import ReportDisaster from '../../pages/ReportDisaster';
import SettingsPage from '../../pages/Settings';
import NotificationDropdown from '../ui/NotificationDropdown';
import { useNotifications } from '../../hooks/useNotifications';
import { useNotificationService } from '../../services/notificationService';

const Header = () => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = React.useState('English');
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState(() => {
    // Load profile from localStorage on initialization
    const savedProfile = localStorage.getItem('tiara_user_profile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });

  // Notification state using custom hook
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const notificationService = useNotificationService();

  const [notifOpen, setNotifOpen] = React.useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [showAccountModal, setShowAccountModal] = React.useState(false);
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [showEmergencySupportModal, setShowEmergencySupportModal] = React.useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    // Clear profile cache on logout
    localStorage.removeItem('tiara_user_profile');
    localStorage.removeItem('tiara_user_profile_timestamp');
    // Remove token from localStorage/sessionStorage
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    // Optionally clear all storage (uncomment if needed)
    // localStorage.clear();
    // sessionStorage.clear();
    // Redirect to sign-in page
    window.location.href = '/signin';
  };

  // Listen for profile updates from other components
  React.useEffect(() => {
    const handleStorageChange = () => {
      const savedProfile = localStorage.getItem('tiara_user_profile');
      setUserProfile(savedProfile ? JSON.parse(savedProfile) : null);
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom profile update events
    window.addEventListener('profileUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleStorageChange);
    };
  }, []);

  // Demo function to test notifications
  const testNotification = () => {
    const notifications = [
      () =>
        notificationService.showFloodWarning(
          'Water levels rising rapidly in downtown area',
          'Downtown District'
        ),
      () =>
        notificationService.showEvacuationNotice(
          'Immediate evacuation required for Zone A residents',
          'Zone A'
        ),
      () =>
        notificationService.showWeatherUpdate('Severe thunderstorm warning extended until 6 PM'),
      () =>
        notificationService.showShelterAvailable(
          'Emergency shelter opened at Community Center',
          'Main Street'
        ),
      () => notificationService.showAllClear('Storm warning lifted, safe to return home'),
    ];

    const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
    randomNotification();
  };

  // Profile Avatar Component with fallback
  const ProfileAvatar = () => {
    const [imageError, setImageError] = React.useState(false);

    if (userProfile?.profile_picture && !imageError) {
      return (
        <img
          src={userProfile.profile_picture}
          alt="User Profile"
          className="w-[50px] h-[50px] rounded-full object-cover border-2 border-gray-300"
          onError={() => {
            console.log('Profile picture failed to load, using fallback');
            setImageError(true);
          }}
        />
      );
    }

    // Fallback to user initials if available
    if (userProfile?.name) {
      const initials = userProfile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      return (
        <div className="w-[50px] h-[50px] rounded-full bg-[#0a4974] flex items-center justify-center text-white font-semibold text-lg border-2 border-gray-300">
          {initials}
        </div>
      );
    }

    // Ultimate fallback - default profile image
    return (
      <img
        src="/images/profile.JPG"
        alt="User Profile"
        className="w-[50px] h-[50px] rounded-full object-cover border-2 border-gray-300"
        onError={(e) => {
          // If even the default image fails, show a generic avatar
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  };

  // Optional: Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown') && !event.target.closest('.profile-img')) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close notification dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest('.notification-dropdown') &&
        !event.target.closest('.notification-btn')
      ) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close language dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.language-dropdown') && !event.target.closest('.language-btn')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-[#2c2c2c] h-20 w-full flex items-center justify-between px-11">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-[#f0f0f0] mr-16">DisasterWatch</h1>
          </Link>
          <nav className="flex space-x-8">
            <button
              type="button"
              className="text-base font-semibold text-[#f0f0f0] focus:outline-none"
              onClick={() => setShowReportModal(true)}
            >
              {t('reportDisaster')}
            </button>
            <button
              type="button"
              className="text-base font-semibold text-[#f0f0f0] focus:outline-none"
              onClick={() => setShowEmergencySupportModal(true)}
            >
              {t('emergencySupport')}
            </button>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {/* Test Notification Button (for demo purposes) */}
          <button
            onClick={testNotification}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
            title="Test Notification (Demo)"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Notification */}
          <div className="relative">
            <button
              className="flex items-center notification-btn relative p-2 rounded-lg hover:bg-gray-700 transition-colors"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell className="w-6 h-6 text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <NotificationDropdown
              isOpen={notifOpen}
              notifications={notifications}
              onClose={() => setNotifOpen(false)}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDelete={deleteNotification}
              onClearAll={clearAllNotifications}
            />
          </div>
          {/* Language */}
          <div className="relative flex items-center">
            <button
              className="flex items-center text-xl text-[#f0f0f0] focus:outline-none language-btn"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              {language}
            </button>
            {dropdownOpen && (
              <div className="language-dropdown absolute right-0 mt-2 w-32 bg-white rounded shadow-lg z-10">
                <button
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                    language === 'English' ? 'font-bold' : ''
                  }`}
                  onClick={() => {
                    handleLanguageChange('English');
                    i18n.changeLanguage('en');
                  }}
                >
                  English
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                    language === 'Malay' ? 'font-bold' : ''
                  }`}
                  onClick={() => {
                    handleLanguageChange('Malay');
                    i18n.changeLanguage('ms');
                  }}
                >
                  Malay
                </button>
              </div>
            )}
          </div>
          {/* Profile */}
          <div className="relative">
            <button
              className="profile-img focus:outline-none"
              onClick={() => setProfileDropdownOpen((open) => !open)}
            >
              <ProfileAvatar />
              {/* Fallback div for when default image also fails */}
              <div
                className="w-[50px] h-[50px] rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold text-lg border-2 border-gray-300"
                style={{ display: 'none' }}
              >
                👤
              </div>
            </button>
            {profileDropdownOpen && (
              <div className="profile-dropdown absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-30">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                  onClick={() => {
                    setShowAccountModal(true);
                    setProfileDropdownOpen(false);
                  }}
                >
                  My account
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                  onClick={() => {
                    setShowSettingsModal(true);
                    setProfileDropdownOpen(false);
                  }}
                >
                  Setting
                </button>
                <a
                  href="/help-faq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 hover:bg-gray-100 text-gray-800"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  Help and FAQ
                </a>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                  onClick={() => {
                    setShowReportModal(true);
                    setProfileDropdownOpen(false);
                  }}
                >
                  Report
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {showAccountModal && <AccountPage onClose={() => setShowAccountModal(false)} />}
      {showReportModal && <ReportDisaster onClose={() => setShowReportModal(false)} />}
      {showSettingsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 min-w-[350px] relative max-w-xl w-full">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowSettingsModal(false)}
            >
              ✕
            </button>
            <SettingsPage onClose={() => setShowSettingsModal(false)} />
          </div>
        </div>
      )}
      {showEmergencySupportModal && (
        <EmergencySupport onClose={() => setShowEmergencySupportModal(false)} />
      )}
    </>
  );
};

export default Header;
