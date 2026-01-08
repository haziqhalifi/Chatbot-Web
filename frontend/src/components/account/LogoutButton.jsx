import React from 'react';

const LogoutButton = ({ onLogout }) => {
  return (
    <div className="border-t pt-6 mt-6">
      <button
        onClick={onLogout}
        className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-all duration-200 font-medium flex items-center justify-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        Logout from all devices
      </button>
    </div>
  );
};

export default LogoutButton;
