import React from 'react';

const TabButton = ({ id, icon: Icon, label, isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {Icon ? <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} /> : null}
      <span>{label}</span>
    </button>
  );
};

export default TabButton;
