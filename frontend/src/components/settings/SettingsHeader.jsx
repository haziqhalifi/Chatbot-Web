import React from 'react';

const SettingsHeader = ({ isModal, onClose, saveStatus, saveMessage, profileError }) => {
  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-100">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-500">Manage your profile, preferences, and security.</p>
        </div>

        {isModal ? (
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {/* Status / errors */}
      <div className="px-6 pt-4">
        {(saveStatus || saveMessage) && (
          <div
            className={`mb-3 text-sm ${
              saveStatus === 'error'
                ? 'text-red-700 bg-red-50 border border-red-200'
                : saveStatus === 'saved'
                  ? 'text-green-800 bg-green-50 border border-green-200'
                  : 'text-gray-700 bg-gray-50 border border-gray-200'
            } rounded-lg px-3 py-2`}
          >
            {saveMessage}
          </div>
        )}
        {profileError && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {profileError}
          </div>
        )}
      </div>
    </>
  );
};

export default SettingsHeader;
