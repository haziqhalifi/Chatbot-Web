import React from 'react';

const AccountStatusCard = ({ lastLogin }) => {
  if (!lastLogin) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 text-[#0a4974] border-b-2 border-[#0a4974] border-opacity-20 pb-2 flex items-center">
        <span className="mr-2">📊</span>
        Account Status
      </h2>
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong className="text-gray-900">Last Login:</strong>{' '}
          {new Date(lastLogin).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default AccountStatusCard;
