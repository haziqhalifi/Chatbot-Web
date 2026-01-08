import React from 'react';

const DataTab = ({
  showChatHistory,
  setShowChatHistory,
  chatSessions,
  chatSessionsLoading,
  chatSessionsError,
  onFetchChatHistory,
  onDownloadActivityPdf,
  onClearChatHistory,
  navigate,
  setActiveTab,
}) => {
  const handleToggleChatHistory = async () => {
    const next = !showChatHistory;
    setShowChatHistory(next);
    if (next) {
      await onFetchChatHistory();
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-gray-700 font-medium">View Chat History</span>
        <button className="text-blue-600 hover:underline" onClick={handleToggleChatHistory}>
          {showChatHistory ? 'Hide' : 'View'}
        </button>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-gray-700 font-medium">Download Activity Log (PDF)</span>
        <button
          className="text-blue-600 hover:underline disabled:opacity-50"
          onClick={onDownloadActivityPdf}
          disabled={chatSessionsLoading}
        >
          Download
        </button>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-gray-700 font-medium">Clear Chat History</span>
        <button
          className="text-red-600 hover:underline disabled:opacity-50"
          onClick={onClearChatHistory}
          disabled={chatSessionsLoading}
        >
          Clear
        </button>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-gray-700 font-medium">Delete My Account</span>
        <button className="text-red-600 hover:underline" onClick={() => setActiveTab('security')}>
          Go to Security
        </button>
      </div>

      {chatSessionsError && <div className="text-red-600 text-sm">{chatSessionsError}</div>}
      {chatSessionsLoading && <div className="text-gray-600 text-sm">Loading...</div>}

      {showChatHistory && !chatSessionsLoading && (
        <div className="mt-3 border rounded p-3 bg-gray-50">
          <div className="text-sm font-semibold mb-2">Recent Sessions</div>
          {chatSessions.length === 0 ? (
            <div className="text-sm text-gray-600">No chat sessions found.</div>
          ) : (
            <div className="space-y-2">
              {chatSessions.slice(0, 10).map((s) => (
                <div key={s.id} className="text-sm flex justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{s.title || `Session ${s.id}`}</div>
                    <div className="text-xs text-gray-500 truncate">{s.updated_at || ''}</div>
                  </div>
                  <button
                    className="text-blue-600 hover:underline whitespace-nowrap"
                    onClick={() => navigate('/dashboard')}
                  >
                    Open Chat
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataTab;
