import React from 'react';

const VoiceInput = ({ isListening, audioLevel }) => {
  if (!isListening) return null;

  return (
    <div className="mb-3 flex items-center justify-center p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></div>
        </div>
        <span className="text-red-700 font-medium">Recording... Tap to stop</span>
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-red-400 rounded-full animate-pulse"
              style={{
                height: `${Math.max(4, (audioLevel / 10) * 20 + Math.random() * 10)}px`,
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
