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
}) => {
  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-300">
      <div className="flex items-center">
        {/* Bot Avatar */}
        <div className="flex items-center">
          <img
            src="/images/tiara.png"
            alt="Tiara Bot Avatar"
            className="w-[43px] h-[43px] rounded-full object-cover bg-[#0a4974]"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div
            className="w-[43px] h-[43px] rounded-full bg-[#0a4974] flex items-center justify-center text-white font-semibold text-sm"
            style={{ display: 'none' }}
          >
            🤖
          </div>
        </div>
        <h2 className="text-xl font-bold text-[#0a4974] ml-3">Ask Tiara</h2>
      </div>

      <div className="flex items-center space-x-2">
        {/* Export Dropdown */}
        <ExportDropdown
          showExportDropdown={showExportDropdown}
          setShowExportDropdown={setShowExportDropdown}
          isExporting={isExporting}
          setIsExporting={setIsExporting}
          messages={messages}
        />

        {/* RAG Toggle Button */}
        <div className="relative">
          <button
            onClick={onRagToggle}
            className={`${
              isRagEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'
            } text-white rounded-full p-2 transition-colors duration-200`}
            aria-label={`RAG ${isRagEnabled ? 'Enabled' : 'Disabled'}`}
            title={`RAG (Retrieval-Augmented Generation) is ${isRagEnabled ? 'ON' : 'OFF'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
          className="bg-[#0a4974] hover:bg-[#083757] text-white rounded-full p-2 transition-colors duration-200"
          aria-label="New Chat"
          title="Start a new chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
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
          className="bg-[#0a4974] hover:bg-[#083757] text-white rounded-full p-2 transition-colors duration-200"
          aria-label="Minimize chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
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
