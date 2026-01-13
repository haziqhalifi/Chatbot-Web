import React, { forwardRef, useState } from 'react';
import UserAvatar from './UserAvatar';
import renderMarkdown from '../../utils/renderMarkdown';
import MapCommandDetails from './MapCommandDetails';
import ReportIssueModal from './ReportIssueModal';

const ChatMessages = forwardRef(
  (
    {
      displayMessages,
      userProfile,
      isListening,
      isTranscribing,
      isSending,
      chatEndRef,
      height,
      width,
    },
    ref
  ) => {
    const [reportMessage, setReportMessage] = useState(null);
    const [showCopyToast, setShowCopyToast] = useState(false);

    const handleCopyMessage = (text) => {
      navigator.clipboard.writeText(text);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    };

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
          flex: '1 1 auto',
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
                    whiteSpace: message.sender === 'bot' ? 'normal' : 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {message.sender === 'bot' ? (
                    <div
                      className="prose prose-sm prose-headings:font-semibold prose-headings:text-slate-900 prose-p:my-1 prose-ol:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:font-semibold prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:p-3 prose-pre:rounded-md max-w-none"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }}
                    />
                  ) : (
                    message.text
                  )}
                </div>

                {/* Map Command Details - Only for bot messages with map commands */}
                {message.sender === 'bot' &&
                  message.mapCommands &&
                  message.mapCommands.length > 0 && (
                    <MapCommandDetails
                      commands={message.mapCommands}
                      results={message.mapCommandResults}
                      isProcessing={message.isProcessingCommands}
                    />
                  )}

                {/* Action buttons - only for bot messages */}
                {message.sender === 'bot' && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleCopyMessage(message.text)}
                      className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-xs transition-colors"
                      title="Copy message"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={() => setReportMessage(message)}
                      className="flex items-center gap-1 text-gray-500 hover:text-red-600 text-xs transition-colors"
                      title="Report an issue"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                        />
                      </svg>
                      <span>Report</span>
                    </button>
                  </div>
                )}
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

        {/* Tiara typing indicator */}
        {isSending && (
          <div className="flex justify-start items-end space-x-2">
            <div className="flex-shrink-0">
              <img
                src="/images/tiara.png"
                alt="Tiara Bot Avatar"
                className="w-[43px] h-[43px] rounded-full object-cover bg-[#0a4974]"
              />
            </div>
            <div className="bg-white text-[#333333] rounded-2xl rounded-bl-md border border-gray-100 px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Tiara is typing</span>
                <div className="flex gap-1 items-center">
                  <span className="typing-dot"></span>
                  <span className="typing-dot" style={{ animationDelay: '0.2s' }}></span>
                  <span className="typing-dot" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={chatEndRef} />

        {/* Copy Toast Notification */}
        {showCopyToast && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 z-50 animate-fadeIn">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Text copied!
          </div>
        )}

        {/* Report Issue Modal */}
        {reportMessage && (
          <ReportIssueModal message={reportMessage} onClose={() => setReportMessage(null)} />
        )}
      </div>
    );
  }
);

export default ChatMessages;
