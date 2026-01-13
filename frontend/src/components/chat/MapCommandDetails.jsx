import React, { useState } from 'react';

/**
 * MapCommandDetails Component
 * Displays the map commands executed by OpenAI in a simple, clean list format
 */
const MapCommandDetails = ({ commands, results, isProcessing }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!commands || commands.length === 0) {
    return null;
  }

  const successCount = results?.filter((r) => r.success).length || 0;
  const failureCount = (results?.length || 0) - successCount;
  const processingCount = commands.length - (results?.length || 0);

  // Format arguments for display
  const formatArguments = (args) => {
    if (!args || typeof args !== 'object') return '';
    
    return Object.entries(args)
      .map(([key, value]) => {
        if (typeof value === 'object') {
          return `${key}=${JSON.stringify(value)}`;
        }
        return `${key}=${value}`;
      })
      .join(', ');
  };

  return (
    <div className="mt-2 mb-1 border border-gray-300 rounded overflow-hidden bg-gray-50">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-700">
            Show Process
          </span>
          <span className="text-xs text-gray-500">
            ({commands.length} {commands.length === 1 ? 'operation' : 'operations'})
          </span>
          {isProcessing && (
            <span className="text-xs text-blue-600 flex items-center gap-1">
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                <circle strokeDasharray="164.93361431346415 56.97787143782138" r="35" strokeWidth="10" stroke="currentColor" fill="none" cy="50" cx="50">
                  <animateTransform keyTimes="0;1" values="0 50 50;360 50 50" dur="1s" repeatCount="indefinite" type="rotate" attributeName="transform"></animateTransform>
                </circle>
              </svg>
              Processing...
            </span>
          )}
        </div>
        <svg
          className={`w-3 h-3 text-gray-500 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-3 pb-2 border-t border-gray-200">
          <div className="space-y-1 mt-2">
            {commands.map((command, index) => {
              const result = results?.[index];
              const hasError = result && !result.success;
              const isSuccess = result && result.success;
              
              return (
                <div
                  key={index}
                  className="text-xs bg-white border border-gray-200 rounded p-2"
                >
                  {/* Process */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1">
                      <span className="text-gray-500">Process:</span>
                      <span className="font-mono text-gray-700 ml-1 font-semibold">
                        {command.function}
                      </span>
                      {command.arguments && Object.keys(command.arguments).length > 0 && (
                        <span className="text-gray-500 ml-1">
                          ({formatArguments(command.arguments)})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Result */}
                  {result && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500">Result:</span>
                      {isSuccess && result.result?.message && (
                        <div className="text-gray-700 flex-1">
                          {result.result.message}
                        </div>
                      )}
                      {hasError && (
                        <div className="text-red-600 flex-1">
                          {result.error}
                        </div>
                      )}
                      {!result.result?.message && !hasError && isSuccess && (
                        <div className="text-green-600 flex-1">Completed</div>
                      )}
                    </div>
                  )}
                  {!result && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500">Result:</span>
                      <span className="text-gray-400 flex-1">Processing...</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapCommandDetails;
