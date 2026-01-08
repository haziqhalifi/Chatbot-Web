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
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Language Preference</label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>English</option>
          <option>Bahasa Melayu</option>
        </select>
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
