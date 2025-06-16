import React from 'react';

const ChatButton = ({ onClick, isOpen }) => {
  if (isOpen) return null;

  return (
    <button
      onClick={onClick}
      className="fixed z-50 bg-[#0a4974] hover:bg-[#083757] text-white rounded-full p-4 shadow-lg transition-all duration-200 transform hover:scale-105"
      style={{
        right: '16px',
        bottom: '16px',
      }}
      aria-label="Open chat"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
  );
};

export default ChatButton;
