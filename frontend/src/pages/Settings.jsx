import React from 'react';

const SettingsPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-lg w-full border-2 border-blue-200">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Settings</h1>
        <p className="text-gray-700 mb-2">Customize your preferences and application settings.</p>
        {/* Add settings controls here */}
        <div className="mt-6">
          <p className="text-sm text-gray-500">
            Notification settings, theme, and more coming soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
