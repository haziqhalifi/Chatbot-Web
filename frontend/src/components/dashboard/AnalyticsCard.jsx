import React from 'react';

const AnalyticsCard = ({ title, value, icon: Icon, iconColor = 'text-blue-500' }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={iconColor} size={40} />
      </div>
    </div>
  );
};

export default AnalyticsCard;
