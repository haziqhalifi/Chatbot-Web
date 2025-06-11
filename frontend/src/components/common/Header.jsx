import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AccountPage from '../../pages/Account';
import ReportModal from '../../pages/ReportModal';
import EmergencySupport from '../../pages/EmergencySupport';
import ReportDisaster from '../../pages/ReportDisaster';
import SettingsPage from '../../pages/Settings';

const Header = () => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = React.useState('English');
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Notification state
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([
    { id: 1, text: 'Flood warning in your area', read: false },
    { id: 2, text: 'Evacuation center opened nearby', read: false },
  ]);
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [showAccountModal, setShowAccountModal] = React.useState(false);
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [showEmergencySupportModal, setShowEmergencySupportModal] = React.useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setDropdownOpen(false);
  };

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleLogout = () => {
    // Remove token from localStorage/sessionStorage
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    // Optionally clear all storage (uncomment if needed)
    // localStorage.clear();
    // sessionStorage.clear();
    // Redirect to sign-in page
    window.location.href = '/signin';
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
          {/* Notification */}
          <div className="relative">
            <button
              className="flex items-center notification-btn"
              onClick={() => setNotifOpen((open) => !open)}
            >
              <img src="/images/img_image.png" alt="Notification" className="w-[26px] h-[23px]" />
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-0 right-0 bg-red-500 rounded-full w-3 h-3"></span>
              )}
            </button>
            {notifOpen && (
              <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-white rounded shadow-lg z-20 p-4">
                <h3 className="font-bold mb-2">{t('notifications')}</h3>
                {notifications.length === 0 ? (
                  <div className="text-gray-500">{t('noNotifications')}</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex justify-between items-center mb-2 p-2 rounded ${notif.read ? 'bg-gray-100' : 'bg-blue-50'}`}
                    >
                      <span className={notif.read ? 'text-gray-400' : 'font-semibold'}>
                        {notif.text}
                      </span>
                      <div className="flex space-x-2">
                        {!notif.read && (
                          <button
                            className="text-xs text-blue-600 hover:underline"
                            onClick={() => markAsRead(notif.id)}
                          >
                            Mark as Read
                          </button>
                        )}
                        <button
                          className="text-xs text-red-600 hover:underline"
                          onClick={() => deleteNotification(notif.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
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
              <img
                src="/images/profile.JPG"
                alt="User Profile"
                className="w-[50px] h-[50px] rounded-full"
              />
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
