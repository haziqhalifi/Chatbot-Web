import React, { forwardRef } from 'react';
import UserAvatar from './UserAvatar';

const ChatMessages = forwardRef(
  ({ displayMessages, userProfile, isListening, chatEndRef, height }, ref) => {
    return (
      <div
        ref={ref}
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{
          minHeight: 0,
          maxHeight: height ? height - 170 : 430,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          scrollBehavior: 'smooth',
        }}
      >
        {displayMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-2`}
            style={{ width: '100%' }}
          >
            {message.sender === 'bot' && (
              <div className="flex items-end mb-1">
                <div className="relative">
                  <img
                    src="/images/tiara.png"
                    alt="Tiara Bot Avatar"
                    className={`w-8 h-8 rounded-full object-cover bg-[#0a4974] transition-all duration-300 ${
                      message.text === 'Tiara is typing...'
                        ? 'ring-2 ring-blue-300 ring-offset-1'
                        : ''
                    }`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {message.text === 'Tiara is typing...' && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div
                  className="w-8 h-8 rounded-full bg-[#0a4974] flex items-center justify-center text-white font-semibold text-xs"
                  style={{ display: 'none' }}
                >
                  🤖
                </div>
              </div>
            )}

            <div
              className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}
            >
              <div
                className={`relative px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-[#0a4974] to-[#083757] text-white rounded-2xl rounded-br-md'
                    : 'bg-white text-[#333333] rounded-2xl rounded-bl-md border border-gray-100'
                }`}
                style={{
                  wordBreak: 'break-word',
                  position: 'relative',
                }}
              >
                {/* Message tail */}
                <div
                  className={`absolute ${
                    message.sender === 'user'
                      ? 'bottom-0 -right-2 border-l-[10px] border-l-[#083757] border-t-[10px] border-t-transparent'
                      : 'bottom-0 -left-2 border-r-[10px] border-r-white border-t-[10px] border-t-transparent'
                  }`}
                  style={{
                    bottom: '2px',
                  }}
                ></div>

                {message.sender === 'bot' ? (
                  message.text === 'Tiara is typing...' ? (
                    <div className="flex items-center space-x-2 py-1">
                      <span className="text-sm text-gray-600 font-medium">Tiara is typing</span>
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <p
                      className="text-sm leading-relaxed whitespace-pre-line"
                      dangerouslySetInnerHTML={{ __html: message.text }}
                      style={{ wordBreak: 'break-word' }}
                    />
                  )
                ) : message.isTranscribing ? (
                  <div className="flex items-center space-x-2 py-1">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-white font-medium italic">Transcribing...</span>
                  </div>
                ) : (
                  <p
                    className="text-sm leading-relaxed whitespace-pre-line font-medium"
                    style={{ wordBreak: 'break-word' }}
                  >
                    {message.text}
                  </p>
                )}
              </div>

              {/* Timestamp */}
              <div
                className={`text-xs text-gray-500 mt-1 px-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {message.sender === 'user' && (
              <div className="flex items-end mb-1">
                <UserAvatar userProfile={userProfile} />
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    );
  }
);

ChatMessages.displayName = 'ChatMessages';

export default ChatMessages;
