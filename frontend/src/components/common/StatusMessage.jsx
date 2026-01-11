import React from 'react';

const StatusMessage = ({ status, message, error }) => {
  if (!status && !message && !error) return null;

  const getStatusClass = () => {
    if (error || status === 'error') {
      return 'text-red-700 bg-red-50 border border-red-200';
    }
    if (status === 'saved' || status === 'success') {
      return 'text-green-800 bg-green-50 border border-green-200';
    }
    return 'text-gray-700 bg-gray-50 border border-gray-200';
  };

  return (
    <div className="px-6 pt-4">
      <div className={`mb-3 text-sm rounded-lg px-3 py-2 ${getStatusClass()}`}>
        {error || message}
      </div>
    </div>
  );
};

export default StatusMessage;
