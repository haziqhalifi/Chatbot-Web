import React from 'react';

const AccountPage = ({ onClose }) => {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState('Public'); // or "Government Officer"
  const [language, setLanguage] = React.useState('English');

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement profile update logic
    alert('Profile updated (not implemented)');
  };

  const handleLogoutAll = () => {
    // TODO: Implement logout from all devices
    alert('Logged out from all devices (not implemented)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative bg-white shadow-xl rounded-lg p-8 max-w-lg w-full border-2 border-blue-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
        <h1 className="text-2xl font-bold mb-4 text-blue-700">My Account</h1>
        <form onSubmit={handleProfileSubmit} className="mb-8">
          <h2 className="text-lg font-semibold mb-2">🧍‍♂️ Profile Information</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">User Role</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
              value={role}
              disabled
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Preferred Language</label>
            <select
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="English">English</option>
              <option value="Bahasa Melayu">Bahasa Melayu</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </form>
        <button
          onClick={handleLogoutAll}
          className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition mb-2"
        >
          Logout from all devices
        </button>
      </div>
    </div>
  );
};

export default AccountPage;
