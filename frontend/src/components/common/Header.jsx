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

  // Handle ESC key to close modals
  React.useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (showAccountModal) setShowAccountModal(false);
        if (showReportModal) setShowReportModal(false);
        if (showSettingsModal) setShowSettingsModal(false);
        if (showEmergencySupportModal) setShowEmergencySupportModal(false);
        if (profileDropdownOpen) setProfileDropdownOpen(false);
        if (notifOpen) setNotifOpen(false);
        if (dropdownOpen) setDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [
    showAccountModal,
    showReportModal,
    showSettingsModal,
    showEmergencySupportModal,
    profileDropdownOpen,
    notifOpen,
    dropdownOpen,
  ]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    const anyModalOpen =
      showAccountModal || showReportModal || showSettingsModal || showEmergencySupportModal;
    if (anyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAccountModal, showReportModal, showSettingsModal, showEmergencySupportModal]);

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
              className="flex items-center text-xl text-[#f0f0f0] focus:outline-none language-btn px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              {language}
              <svg
                className={`ml-2 w-4 h-4 transform transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="language-dropdown absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
                <div className="py-1">
                  <button
                    className={`block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 ${
                      language === 'English'
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-700'
                    }`}
                    onClick={() => {
                      handleLanguageChange('English');
                      i18n.changeLanguage('en');
                    }}
                  >
                    <div className="flex items-center">
                      <span className="mr-3">🇺🇸</span>
                      English
                    </div>
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 ${
                      language === 'Malay'
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-700'
                    }`}
                    onClick={() => {
                      handleLanguageChange('Malay');
                      i18n.changeLanguage('ms');
                    }}
                  >
                    <div className="flex items-center">
                      <span className="mr-3">🇲🇾</span>
                      Malay
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Profile */}
          <div className="relative">
            <button
              className="profile-img focus:outline-none p-1 rounded-lg hover:bg-gray-700 transition-colors duration-200"
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
              <div className="profile-dropdown absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 z-30 overflow-hidden">
                <div className="py-1">
                  <button
                    className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors duration-150"
                    onClick={() => {
                      setShowAccountModal(true);
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      My Account
                    </div>
                  </button>
                  <button
                    className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors duration-150"
                    onClick={() => {
                      setShowSettingsModal(true);
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Settings
                    </div>
                  </button>
                  <div className="border-t border-gray-100"></div>
                  <a
                    href="/help-faq"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors duration-150"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Help & FAQ
                    </div>
                  </a>
                  <button
                    className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors duration-150"
                    onClick={() => {
                      setShowReportModal(true);
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Report Disaster
                    </div>
                  </button>
                  <div className="border-t border-gray-100"></div>
                  <button
                    className="block w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 transition-colors duration-150"
                    onClick={handleLogout}
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="animate-in fade-in duration-200 scale-95 animate-in">
            <AccountPage onClose={() => setShowAccountModal(false)} />
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="animate-in fade-in duration-200 scale-95 animate-in">
            <ReportDisaster onClose={() => setShowReportModal(false)} />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="animate-in fade-in duration-200 scale-95 animate-in">
            <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[400px] max-w-2xl w-full mx-4 border border-gray-100 relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                onClick={() => setShowSettingsModal(false)}
                aria-label="Close settings"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <SettingsPage onClose={() => setShowSettingsModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Emergency Support Modal */}
      {showEmergencySupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="animate-in fade-in duration-200 scale-95 animate-in">
            <EmergencySupport onClose={() => setShowEmergencySupportModal(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
