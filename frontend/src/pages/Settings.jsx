import React from 'react';

const SettingsPage = () => {
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const handlePasswordChange = (e) => {
    e.preventDefault();
    // TODO: Implement password change logic
    alert('Password change (not implemented)');
  };

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

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">🔒 Change Password</h2>
          <form onSubmit={handlePasswordChange}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
