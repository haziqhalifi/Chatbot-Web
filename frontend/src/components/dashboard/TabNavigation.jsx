import React from 'react';
import { AlertTriangle, User } from 'lucide-react';

const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <div className="mb-6 border-b border-gray-200">
      <nav className="flex space-x-8">
        <button
          onClick={() => onTabChange('disasters')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'disasters'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            NADMA Disasters
          </div>
        </button>
        <button
          onClick={() => onTabChange('myreports')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'myreports'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <User size={18} />
            My Reports
          </div>
        </button>
      </nav>
    </div>
  );
};

export default TabNavigation;
