import React from 'react';

const ProfileTab = ({
  profileLoading,
  fullName,
  setFullName,
  email,
  setEmail,
  roleLabel,
  createdAt,
  language,
  setLanguage,
  profile,
  navigate,
  onSaveProfile,
}) => {
  if (profileLoading) {
    return <div className="text-gray-600">Loading profile...</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Full Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Language Preference</label>
        <div className="w-full px-4 py-3 border border-blue-200 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700 mb-2">
            For more reliable and full language coverage, we recommend using{' '}
            <strong>Google Translate</strong> to translate the entire page.
          </p>
          <a
            href="https://youtu.be/ZoUrkKe58Jk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
            Watch tutorial: How to use Google Translate
          </a>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Email Address</label>
        <input
          type="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          readOnly
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">User Role</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          value={roleLabel}
          readOnly
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Date Registered</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          value={createdAt}
          readOnly
        />
      </div>

      {roleLabel === 'Government Officer' && (
        <>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Assigned Department / Agency
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              value={profile?.department || ''}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Access Scope</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              value={profile?.accessScope || ''}
              readOnly
            />
          </div>
          <div className="mb-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => navigate('/admin')}
            >
              Go to Admin Dashboard
            </button>
          </div>
        </>
      )}

      <div className="flex justify-end">
        <button
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          onClick={onSaveProfile}
          disabled={profileLoading}
        >
          Save Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileTab;
