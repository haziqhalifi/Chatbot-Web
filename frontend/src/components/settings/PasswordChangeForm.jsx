import React from 'react';

const PasswordChangeForm = ({
  passwordForm,
  setPasswordForm,
  onSubmit,
  passwordStatus,
  passwordMessage,
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Change Password</h2>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="block text-gray-700 mb-1">Current Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
            autoComplete="current-password"
          />
        </div>
        <div className="mb-3">
          <label className="block text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
            autoComplete="new-password"
          />
        </div>
        <div className="mb-3">
          <label className="block text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={passwordStatus === 'saving'}
        >
          {passwordStatus === 'saving' ? 'Changing...' : 'Change Password'}
        </button>

        {passwordMessage && (
          <div
            className={`mt-2 text-sm ${
              passwordStatus === 'error' ? 'text-red-600' : 'text-green-700'
            }`}
          >
            {passwordMessage}
          </div>
        )}
      </form>
    </div>
  );
};

export default PasswordChangeForm;
