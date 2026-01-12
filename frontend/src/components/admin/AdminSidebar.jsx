import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  FileText,
  Users,
  Bell,
  HelpCircle,
  Database,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminSidebar } from '../../contexts/AdminSidebarContext';

const AdminSidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isCollapsed, toggleSidebar } = useAdminSidebar();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      label: t('admin.sidebar.dashboard', 'Dashboard'),
      key: 'dashboard',
    },
    {
      path: '/admin/reports',
      icon: FileText,
      label: t('admin.sidebar.reports', 'Reports'),
      key: 'reports',
    },
    {
      path: '/admin/users',
      icon: Users,
      label: t('admin.sidebar.users', 'Manage Users'),
      key: 'users',
    },
    {
      path: '/admin/notifications',
      icon: Bell,
      label: t('admin.sidebar.notifications', 'Notifications'),
      key: 'notifications',
    },
    {
      path: '/admin/faq',
      icon: HelpCircle,
      label: t('admin.sidebar.faq', 'Manage FAQ'),
      key: 'faq',
    },
    {
      path: '/admin/nadma-history',
      icon: Database,
      label: t('admin.sidebar.nadmaHistory', 'NADMA History'),
      key: 'nadma',
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`
        ${isCollapsed ? 'w-16' : 'w-64'}
        bg-white flex flex-col
        transition-all duration-300 ease-in-out
        border-r border-gray-200 shadow-sm
        fixed left-0 top-16 bottom-0 overflow-hidden
      `}
    >
      {/* Menu Items */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.key}
              to={item.path}
              className={`
                flex items-center px-3 py-2.5 mx-2 my-0.5 rounded-lg
                transition-all duration-200 group
                ${
                  active
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : ''}
            >
              <Icon
                className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0 ${active ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'}`}
              />
              {!isCollapsed && <span className="text-sm truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <div className="border-t border-gray-200 p-3 flex items-center justify-center">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700"
          title={
            isCollapsed
              ? t('admin.sidebar.expand', 'Expand')
              : t('admin.sidebar.collapse', 'Collapse')
          }
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Profile Section at Bottom */}
      <div className="border-t border-gray-200 p-3 relative">
        {!isCollapsed ? (
          <div>
            {/* Profile Button */}
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-full flex items-center space-x-3 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <div className="flex-shrink-0 h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || user?.email || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-all duration-200 text-sm font-medium"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  <span>{t('admin.logout', 'Logout')}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* Collapsed Profile Icon */}
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-all duration-200 mx-auto"
            >
              <UserIcon className="h-5 w-5 text-blue-700" />
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden whitespace-nowrap">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-all duration-200 text-sm font-medium"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>{t('admin.logout', 'Logout')}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
