import React from 'react';

const LoadingState = ({ onClose }) => {
  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[600px] max-w-4xl w-full mx-4 border border-gray-100 relative max-h-[90vh] overflow-y-auto">
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 z-10"
        onClick={onClose}
        aria-label="Close account modal"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a4974] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading account information...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
