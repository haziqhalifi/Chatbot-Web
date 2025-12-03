import React, { useState, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';

const ChatHistory = ({ isOpen, onClose, currentSessionId }) => {
  const { sessions, fetchSessions, loadSession, deleteSession, loading } = useChat();
  const [deletingId, setDeletingId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchSessions(50, 0); // Fetch up to 50 recent sessions
    }
  }, [isOpen, fetchSessions]);

  const handleLoadSession = async (sessionId) => {
    if (sessionId === currentSessionId) {
      onClose();
      return;
    }

    try {
      setLoadingId(sessionId);
      await loadSession(sessionId);
      onClose();
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      setDeletingId(sessionId);
      await deleteSession(sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="text-lg font-bold text-white flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Chat History
          </h2>
          <button
            onClick={onClose}
            className="bg-white hover:bg-gray-100 text-blue-600 rounded-full p-1.5 transition-colors duration-200"
            aria-label="Close history"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && sessions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-3 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-sm">No chat history yet</p>
              <p className="text-xs mt-1">Start a conversation to see it here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleLoadSession(session.id)}
                  className={`group relative p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                    session.id === currentSessionId
                      ? 'bg-blue-50 border-blue-300 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  } ${loadingId === session.id ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {/* Session Content */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-8">
                      <h3 className="font-medium text-gray-900 truncate text-sm">
                        {session.title || 'Untitled Chat'}
                      </h3>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <span>{formatDate(session.updated_at || session.created_at)}</span>
                        {session.ai_provider && (
                          <>
                            <span className="mx-1.5">•</span>
                            <span className="capitalize">{session.ai_provider}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      disabled={deletingId === session.id}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 disabled:opacity-50"
                      aria-label="Delete chat"
                      title="Delete this chat"
                    >
                      {deletingId === session.id ? (
                        <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Current Session Indicator */}
                  {session.id === currentSessionId && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-lg"></div>
                  )}

                  {/* Loading Indicator */}
                  {loadingId === session.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {sessions.length} {sessions.length === 1 ? 'conversation' : 'conversations'}
          </p>
        </div>
      </div>
    </>
  );
};

export default ChatHistory;
