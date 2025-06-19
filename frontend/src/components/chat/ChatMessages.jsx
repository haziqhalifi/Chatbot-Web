import React, { forwardRef } from 'react';
import UserAvatar from './UserAvatar';

const ChatMessages = forwardRef(
  (
    { displayMessages, userProfile, isListening, isTranscribing, chatEndRef, height, width },
    ref
  ) => {
    // Calculate responsive message width based on chat window width
    const getMessageMaxWidth = () => {
      if (!width) return '75%';
      if (width < 400) return '85%';
      if (width < 500) return '80%';
      if (width < 600) return '75%';
      return '70%';
    };

    return (
      <div
        ref={ref}
        className="flex-1 overflow-y-auto px-4 py-4 chat-messages"
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
              <div className="flex-shrink-0">
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
            )}

            <div
              className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
              style={{ maxWidth: getMessageMaxWidth() }}
            >
              <div
                className={`relative px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-md'
                    : 'bg-white text-[#333333] rounded-2xl rounded-bl-md border border-gray-200 shadow-sm'
                }`}
                style={{
                  wordBreak: 'break-word',
                  position: 'relative',
                  minWidth: '60px',
                }}
              >
                {/* Message tail */}
                <div
                  className={`absolute ${
                    message.sender === 'user'
                      ? 'bottom-0 -right-2 border-l-[10px] border-l-indigo-600 border-t-[10px] border-t-transparent'
                      : 'bottom-0 -left-2 border-r-[10px] border-r-white border-t-[10px] border-t-transparent'
                  }`}
                  style={{
                    bottom: '2px',
                  }}
                ></div>

                <div
                  className={`text-sm leading-relaxed ${
                    message.sender === 'user' ? 'text-white' : 'text-[#333333]'
                  }`}
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {message.sender === 'bot' ? (
                    <span dangerouslySetInnerHTML={{ __html: message.text }} />
                  ) : (
                    message.text
                  )}
                </div>
              </div>

              {/* Message timestamp */}
              <div
                className={`text-xs text-gray-500 mt-1 ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                {message.timestamp
                  ? new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
              </div>
            </div>

            {message.sender === 'user' && (
              <div className="flex-shrink-0">
                <UserAvatar userProfile={userProfile} />
              </div>
            )}
          </div>
        ))}

        {/* Voice recording indicator */}
        {isListening && (
          <div className="flex justify-start items-end space-x-2">
            <div className="flex-shrink-0">
              <img
                src="/images/tiara.png"
                alt="Tiara Bot Avatar"
                className="w-[43px] h-[43px] rounded-full object-cover bg-[#0a4974]"
              />
            </div>
            <div className="bg-white text-[#333333] rounded-2xl rounded-bl-md border border-gray-100 px-4 py-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">Listening...</span>
              </div>
            </div>
          </div>
        )}

        {/* Transcribing indicator */}
        {isTranscribing && (
          <div className="flex justify-start items-end space-x-2">
            <div className="flex-shrink-0">
              <img
                src="/images/tiara.png"
                alt="Tiara Bot Avatar"
                className="w-[43px] h-[43px] rounded-full object-cover bg-[#0a4974]"
              />
            </div>
            <div className="bg-white text-[#333333] rounded-2xl rounded-bl-md border border-gray-100 px-4 py-3 shadow-sm">
              <span className="text-sm text-gray-600">Transcribing your voice...</span>
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={chatEndRef} />
      </div>
    );
  }
);

export default ChatMessages;
