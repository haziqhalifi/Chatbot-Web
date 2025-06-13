import React from 'react';
import ProfileAvatar from './ProfileAvatar';

const ProfileDropdown = ({
  isOpen,
  userProfile,
  onToggle,
  onOpenAccount,
  onOpenSettings,
  onOpenReport,
  onLogout,
  onClose,
}) => {
  return (
    <div className="relative">
      <button
        className="profile-img focus:outline-none p-1 rounded-lg hover:bg-gray-700 transition-colors duration-200"
        onClick={onToggle}
      >
        <ProfileAvatar userProfile={userProfile} />
        {/* Fallback div for when default image also fails */}
        <div
          className="w-[50px] h-[50px] rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold text-lg border-2 border-gray-300"
          style={{ display: 'none' }}
        >
          👤
        </div>
      </button>
      {isOpen && (
        <div className="profile-dropdown absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 z-30 overflow-hidden">
          <div className="py-1">
            <button
              className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors duration-150"
              onClick={onOpenAccount}
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
              onClick={onOpenSettings}
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
              onClick={onClose}
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
              onClick={onOpenReport}
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
              onClick={onLogout}
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
  );
};

export default ProfileDropdown;
