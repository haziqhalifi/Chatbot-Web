import React from 'react';

const AnalyticsCard = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-blue-500',
  bgColor = 'from-blue-50 to-blue-100',
  borderColor = 'border-blue-200',
}) => {
  return (
    <div className={`bg-gradient-to-br ${bgColor} rounded-lg border ${borderColor} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={iconColor} size={40} />
      </div>
    </div>
  );
};

export default AnalyticsCard;
