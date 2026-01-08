import React from 'react';
import { RefreshCw, AlertTriangle, User } from 'lucide-react';

const EmptyState = ({ type, onAction, actionLabel, message }) => {
  const getIcon = () => {
    switch (type) {
      case 'loading':
        return <RefreshCw className="animate-spin text-blue-600" size={40} />;
      case 'error':
        return <AlertTriangle size={24} className="text-red-600" />;
      case 'no-data':
        return <AlertTriangle size={24} className="text-gray-400" />;
      case 'no-reports':
        return <User size={48} className="text-gray-400" />;
      default:
        return <AlertTriangle size={24} className="text-gray-400" />;
    }
  };

  const getContainerClass = () => {
    if (type === 'no-reports') {
      return 'flex flex-col items-center justify-center py-12 text-gray-600';
    }
    return 'flex items-center justify-center py-12';
  };

  const getTextColor = () => {
    if (type === 'error') return 'text-red-600';
    if (type === 'loading') return 'text-gray-600';
    return 'text-gray-600';
  };

  return (
    <div className={getContainerClass()}>
      {getIcon()}
      <div className={`ml-3 ${type === 'no-reports' ? 'ml-0 text-center' : ''}`}>
        {type === 'no-reports' ? (
          <>
            <p className="text-lg font-medium mb-2">{message || 'No reports found'}</p>
            <p className="text-sm text-gray-500 mb-4">
              You haven't submitted any disaster reports yet
            </p>
            {onAction && (
              <button
                onClick={onAction}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {actionLabel || 'Submit a Report'}
              </button>
            )}
          </>
        ) : (
          <span className={getTextColor()}>{message}</span>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
