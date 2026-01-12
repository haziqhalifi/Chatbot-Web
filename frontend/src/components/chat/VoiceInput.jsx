import React from 'react';

const VoiceInput = ({ isListening }) => {
  if (!isListening) return null;

  return (
    <div className="mb-3 flex items-center justify-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75"></div>
        </div>
        <span className="text-blue-700 font-medium">Listening... Tap to stop</span>
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-blue-400 rounded-full animate-pulse"
              style={{
                height: `${8 + Math.sin(i) * 4}px`,
                animationDelay: `${i * 100}ms`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;
