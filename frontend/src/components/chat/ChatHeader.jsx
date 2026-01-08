import React from 'react';
import ExportDropdown from './ExportDropdown';

const ChatHeader = ({
  onClose,
  onNewChat,
  showExportDropdown,
  setShowExportDropdown,
  isExporting,
  setIsExporting,
  messages,
  width,
  mapView,
  exportType,
  setExportType,
  onOpenHistory,
  displayMode = 'popup',
  onToggleDisplayMode,
}) => {
  // Responsive design based on chat width
  const isCompact = width && width < 400;

  return (
    <div
      className={`flex justify-between items-center p-4 border-b border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 ${
        displayMode === 'sidebar' ? 'rounded-none' : 'rounded-t-[22px]'
      }`}
    >
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
        <div className="ml-3 min-w-0">
          <h2 className={`${isCompact ? 'text-lg' : 'text-xl'} font-bold text-white truncate`}>
            Ask Tiara
          </h2>
          <p className={`text-xs text-blue-100 ${isCompact ? 'mt-0.5' : 'mt-1'} truncate`}>
            Using ChatGPT
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1 flex-shrink-0">
        {/* History Button */}
        <button
          onClick={onOpenHistory}
          className="bg-white hover:bg-gray-100 text-blue-600 rounded-full transition-colors duration-200 shadow-md"
          style={{ padding: isCompact ? '6px' : '8px' }}
          aria-label="Chat History"
          title="View chat history"
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        {/* Export Dropdown - Always visible */}
        <ExportDropdown
          showExportDropdown={showExportDropdown}
          setShowExportDropdown={setShowExportDropdown}
          isExporting={isExporting}
          setIsExporting={setIsExporting}
          messages={messages}
          exportType={exportType}
          setExportType={setExportType}
          mapView={mapView}
        />

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

        {/* Toggle Display Mode Button */}
        {onToggleDisplayMode && (
          <button
            onClick={onToggleDisplayMode}
            className="bg-white hover:bg-gray-100 text-blue-600 rounded-full transition-colors duration-200 shadow-md"
            style={{ padding: isCompact ? '6px' : '8px' }}
            aria-label={displayMode === 'popup' ? 'Switch to Sidebar' : 'Switch to Popup'}
            title={displayMode === 'popup' ? 'Switch to Sidebar' : 'Switch to Popup'}
          >
            {displayMode === 'popup' ? (
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
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
            ) : (
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
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="3" y2="21"></line>
              </svg>
            )}
          </button>
        )}

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
