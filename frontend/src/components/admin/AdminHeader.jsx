import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Settings, BarChart3, Users, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Navigation from '../common/Navigation';
import LanguageDropdown from '../common/LanguageDropdown';
import { useLayer } from '../../contexts/LayerContext';
import { useLayerEffects } from '../../hooks/useLayerEffects';

const AdminHeader = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Get current language display name based on i18n language
  const getCurrentLanguageDisplay = () => {
    return i18n.language === 'ms' ? 'Malay' : 'English';
  };

  // Layer management
  const { isLayerActive, toggleLayer, openLayer, closeLayer } = useLayer();

  // Use layer effects for ESC key, click outside, etc.
  useLayerEffects();

  // Event handlers
  const handleLanguageChange = (lang) => {
    closeLayer(); // Close language dropdown after selection
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <header className="bg-[#2c2c2c] h-20 w-full flex items-center justify-between px-11">
      <div className="flex items-center">
        <Link to="/admin" className="flex items-center">
          <Shield className="h-8 w-8 text-red-500 mr-3" />
          <h1 className="text-2xl font-bold text-[#f0f0f0] mr-16">DisasterWatch Admin</h1>
        </Link>

        {/* Admin Navigation */}
        <nav className="flex items-center space-x-6">
          <Link
            to="/admin"
            className="text-[#f0f0f0] hover:text-red-400 transition-colors duration-200 flex items-center"
          >
            <Home className="h-4 w-4 mr-2" />
            {t('admin.home', 'Admin Home')}
          </Link>
          <Link
            to="/admin/dashboard"
            className="text-[#f0f0f0] hover:text-red-400 transition-colors duration-200 flex items-center"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {t('admin.dashboard', 'Dashboard')}
          </Link>
          <Link
            to="/admin/reports"
            className="text-[#f0f0f0] hover:text-red-400 transition-colors duration-200 flex items-center"
          >
            <Users className="h-4 w-4 mr-2" />
            {t('admin.reports', 'Reports')}
          </Link>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <LanguageDropdown
          isOpen={isLayerActive('LANGUAGE_DROPDOWN')}
          language={getCurrentLanguageDisplay()}
          onLanguageChange={handleLanguageChange}
          onToggle={() => toggleLayer('LANGUAGE_DROPDOWN')}
        />

        {/* Admin Profile Section */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-[#f0f0f0]">
            {t('admin.welcome', 'Welcome')}, {user?.name || user?.email || 'Admin'}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center text-[#f0f0f0] hover:text-red-400 transition-colors duration-200"
            title={t('admin.logout', 'Logout')}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
