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
  const handleLogout = () => {
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

      <div className="mb-4">
        <button
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-2"
          onClick={handleLogout}
        >
          Log Out
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
