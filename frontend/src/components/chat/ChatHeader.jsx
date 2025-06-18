import React from 'react';
import ExportDropdown from './ExportDropdown';

const ChatHeader = ({
  onClose,
  onNewChat,
  onRagToggle,
  isRagEnabled,
  showExportDropdown,
  setShowExportDropdown,
  isExporting,
  setIsExporting,
  messages,
  width,
}) => {
  // Responsive design based on chat width
  const isCompact = width && width < 400;
  const isMedium = width && width < 500;

  return (
    <div className="flex justify-between items-center p-4 border-b border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-[22px]">
      <div className="flex items-center min-w-0 flex-1">
        {/* Bot Avatar */}
        <div className="flex items-center flex-shrink-0">
          <img
            src="/images/tiara.png"
            alt="Tiara Bot Avatar"
            className={`${isCompact ? 'w-8 h-8' : 'w-[43px] h-[43px]'} rounded-full object-cover bg-white shadow-md`}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div
            className={`${isCompact ? 'w-8 h-8' : 'w-[43px] h-[43px]'} rounded-full bg-white flex items-center justify-center text-blue-600 font-semibold text-sm shadow-md`}
            style={{ display: 'none' }}
          >
            🤖
          </div>
        </div>
        <h2 className={`${isCompact ? 'text-lg' : 'text-xl'} font-bold text-white ml-3 truncate`}>
          Ask Tiara
        </h2>
      </div>

      <div className="flex items-center space-x-1 flex-shrink-0">
        {/* Export Dropdown - Hide on very small screens */}
        {!isCompact && (
          <ExportDropdown
            showExportDropdown={showExportDropdown}
            setShowExportDropdown={setShowExportDropdown}
            isExporting={isExporting}
            setIsExporting={setIsExporting}
            messages={messages}
          />
        )}

        {/* RAG Toggle Button */}
        <div className="relative">
          <button
            onClick={onRagToggle}
            className={`${
              isRagEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'
            } text-white rounded-full p-2 transition-colors duration-200 ${
              isCompact ? 'p-1.5' : 'p-2'
            }`}
            aria-label={`RAG ${isRagEnabled ? 'Enabled' : 'Disabled'}`}
            title={`RAG (Retrieval-Augmented Generation) is ${isRagEnabled ? 'ON' : 'OFF'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={isCompact ? '14' : '16'}
              height={isCompact ? '14' : '16'}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isRagEnabled ? (
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              ) : (
                <>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  <path d="m14.5 7-5 5" />
                  <path d="m9.5 7 5 5" />
                </>
              )}
            </svg>
          </button>
          <div
            className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
              isRagEnabled ? 'bg-green-400' : 'bg-red-400'
            }`}
          ></div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="bg-white hover:bg-gray-100 text-blue-600 rounded-full transition-colors duration-200 shadow-md"
          style={{ padding: isCompact ? '6px' : '8px' }}
          aria-label="New Chat"
          title="Start a new chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={isCompact ? '14' : '16'}
            height={isCompact ? '14' : '16'}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="bg-white hover:bg-gray-100 text-blue-600 rounded-full transition-colors duration-200 shadow-md"
          style={{ padding: isCompact ? '6px' : '8px' }}
          aria-label="Minimize chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={isCompact ? '14' : '16'}
            height={isCompact ? '14' : '16'}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
