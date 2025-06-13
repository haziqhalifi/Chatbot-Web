import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navigation from './Navigation';
import NotificationCenter from './NotificationCenter';
import LanguageDropdown from './LanguageDropdown';
import ProfileDropdown from './ProfileDropdown';
import ModalsContainer from './ModalsContainer';
import useUserProfile from '../../hooks/useUserProfile';
import { useNotifications } from '../../hooks/useNotifications';
import { useNotificationService } from '../../services/notificationService';
import { useLayer } from '../../contexts/LayerContext';
import { useLayerEffects } from '../../hooks/useLayerEffects';

const Header = () => {
  const { t, i18n } = useTranslation();
  
  // Get current language display name based on i18n language
  const getCurrentLanguageDisplay = () => {
    return i18n.language === 'ms' ? 'Malay' : 'English';
  };

  // Custom hooks
  const { userProfile, logout } = useUserProfile();

  // Layer management
  const { isLayerActive, toggleLayer, openLayer, closeLayer } = useLayer();

  // Use layer effects for ESC key, click outside, etc.
  useLayerEffects();

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

  // Event handlers
  const handleLanguageChange = (lang) => {
    // The LanguageDropdown component will handle i18n.changeLanguage
    // We just need to close the layer
    closeLayer(); // Close language dropdown after selection
  };

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

  return (
    <>
      <header className="bg-[#2c2c2c] h-20 w-full flex items-center justify-between px-11">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-[#f0f0f0] mr-16">DisasterWatch</h1>
          </Link>
          <Navigation
            onOpenReport={() => openLayer('REPORT_MODAL')}
            onOpenEmergency={() => openLayer('EMERGENCY_MODAL')}
          />
        </div>

        <div className="flex items-center space-x-4">
          <NotificationCenter
            unreadCount={unreadCount}
            isDropdownOpen={isLayerActive('NOTIFICATION_DROPDOWN')}
            notifications={notifications}
            onToggleDropdown={() => toggleLayer('NOTIFICATION_DROPDOWN')}
            onTestNotification={testNotification}
            onClose={closeLayer}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDelete={deleteNotification}
            onClearAll={clearAllNotifications}
          />

          <LanguageDropdown
            isOpen={isLayerActive('LANGUAGE_DROPDOWN')}
            language={getCurrentLanguageDisplay()}
            onLanguageChange={handleLanguageChange}
            onToggle={() => toggleLayer('LANGUAGE_DROPDOWN')}
          />

          <ProfileDropdown
            isOpen={isLayerActive('PROFILE_DROPDOWN')}
            userProfile={userProfile}
            onToggle={() => toggleLayer('PROFILE_DROPDOWN')}
            onOpenAccount={() => openLayer('ACCOUNT_MODAL')}
            onOpenSettings={() => openLayer('SETTINGS_MODAL')}
            onOpenReport={() => openLayer('REPORT_MODAL')}
            onLogout={logout}
            onClose={closeLayer}
          />
        </div>
      </header>

      <ModalsContainer
        isAccountOpen={isLayerActive('ACCOUNT_MODAL')}
        isReportOpen={isLayerActive('REPORT_MODAL')}
        isSettingsOpen={isLayerActive('SETTINGS_MODAL')}
        isEmergencyOpen={isLayerActive('EMERGENCY_MODAL')}
        onClose={closeLayer}
      />
    </>
  );
};

export default Header;
