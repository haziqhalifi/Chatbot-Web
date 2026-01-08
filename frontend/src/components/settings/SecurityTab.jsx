import React from 'react';
import PasswordChangeForm from './PasswordChangeForm';
import ToggleRow from './ToggleRow';
import DeleteAccountModal from './DeleteAccountModal';

const SecurityTab = ({
  passwordForm,
  setPasswordForm,
  onChangePassword,
  passwordStatus,
  passwordMessage,
  privacy,
  setPrivacy,
  showDeleteConfirm,
  setShowDeleteConfirm,
  onDeleteAccount,
}) => {
  const handleLogoutAll = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tiara_current_session');
    window.location.href = '/signin';
  };

  return (
    <div>
      <PasswordChangeForm
        passwordForm={passwordForm}
        setPasswordForm={setPasswordForm}
        onSubmit={onChangePassword}
        passwordStatus={passwordStatus}
        passwordMessage={passwordMessage}
      />

      <ToggleRow
        label="Two-Factor Authentication"
        description="Not available in this version."
        checked={false}
        onChange={() => {}}
        disabled
      />

      <div className="mb-4">
        <button
          className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors mb-2"
          onClick={handleLogoutAll}
        >
          Log out of all devices
        </button>
        <ToggleRow
          label="Public Profile"
          description="Allow others to see your profile information."
          checked={privacy}
          onChange={(next) => setPrivacy(next)}
        />
      </div>

      <div className="mb-4">
        <button
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete My Account
        </button>
      </div>

      <DeleteAccountModal
        show={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={onDeleteAccount}
      />
    </div>
  );
};

export default SecurityTab;
