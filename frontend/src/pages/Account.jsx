import React from 'react';

const AccountPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-lg w-full border-2 border-blue-200">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">My Account</h1>
        <p className="text-gray-700 mb-2">View and manage your account details here.</p>
        {/* Add more account info and edit options as needed */}
        <div className="mt-6">
          <p className="text-sm text-gray-500">
            Email: <span className="font-medium text-gray-800">(your@email.com)</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Change password, update profile, and more coming soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
