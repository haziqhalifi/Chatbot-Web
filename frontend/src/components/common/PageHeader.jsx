import React from 'react';

const PageHeader = ({ title, description, onClose, isModal, children }) => {
  return (
    <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-100">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>

      <div className="flex items-center gap-2">
        {children}
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
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
        )}
      </div>
    </div>
  );
};

export default PageHeader;
