import React from 'react';
import VoiceInput from './VoiceInput';
import useAppSettings from '../../hooks/useAppSettings';
import useWebSpeechAPI from '../../hooks/useWebSpeechAPI';

const ChatInput = ({
  inputValue,
  onInputChange,
  onKeyPress,
  onSendMessage,
  onSendMessageWithText,
  canSendMessage,
  width,
}) => {
  const settings = useAppSettings();
  const voiceInputEnabled = settings?.voiceInputEnabled !== false;
  const {
    isListening,
    transcript,
    isFinal,
    error,
    isSupported,
    startListening,
    stopListening,
    abort,
  } = useWebSpeechAPI();
  const [transcriptionError, setTranscriptionError] = React.useState('');
  const lastSentTranscriptRef = React.useRef('');

  // Handle voice input using Web Speech API
  React.useEffect(() => {
    if (!isListening && isFinal && transcript && transcript.trim()) {
      // Only send if this is a new transcript (not already sent)
      if (transcript !== lastSentTranscriptRef.current) {
        lastSentTranscriptRef.current = transcript;
        onInputChange({ target: { value: transcript } });
        if (transcript.trim()) {
          onSendMessageWithText(transcript, 'voice');
        }
      }
    }
  }, [isListening, isFinal, transcript, onInputChange, onSendMessageWithText]);

  // Update transcription error from Web Speech API
  React.useEffect(() => {
    if (error) {
      setTranscriptionError(error);
    }
  }, [error]);

  const handleVoiceClick = () => {
    if (!isSupported) {
      setTranscriptionError(
        'Web Speech API is not supported in your browser. Please use Chrome, Edge, or another Chromium-based browser.'
      );
      return;
    }

    if (!isListening) {
      // Start listening
      setTranscriptionError('');
      startListening();
    } else {
      // Stop listening
      stopListening();
    }
  };

  // Responsive design based on chat width
  const isCompact = width && width < 400;

  return (
    <div className="bg-white rounded-b-[22px] p-4 border-t border-blue-200 shadow-inner">
      {/* Transcription error message */}
      {transcriptionError && (
        <div className="mb-2 bg-red-50 border border-red-200 rounded-lg p-2 text-red-700 text-xs flex items-start">
          <svg
            className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <span>{transcriptionError}</span>
            <button
              onClick={() => setTranscriptionError('')}
              className="ml-2 text-red-500 hover:text-red-700 font-semibold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Voice recording indicator */}
      {voiceInputEnabled && isListening && <VoiceInput isListening={isListening} />}

      <div className="bg-gray-50 rounded-[16px] flex items-center p-2 border border-gray-200">
        <input
          type="text"
          placeholder={
            !canSendMessage
              ? 'Sending message...'
              : voiceInputEnabled && isListening
                ? 'Listening... Tap microphone to stop'
                : 'Type your message...'
          }
          value={inputValue}
          onChange={onInputChange}
          onKeyPress={onKeyPress}
          disabled={(voiceInputEnabled && isListening) || !canSendMessage}
          className={`flex-1 bg-transparent text-sm outline-none px-2 min-w-0 transition-all duration-200 ${
            isListening || !canSendMessage ? 'text-gray-400 cursor-not-allowed' : 'text-gray-800'
          }`}
          style={{ width: '100%' }}
        />

        {voiceInputEnabled && (
          <button
            onClick={handleVoiceClick}
            disabled={!canSendMessage}
            className={`p-2 rounded-full transition-all duration-200 ${
              !canSendMessage
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white ring-2 ring-red-300 ring-offset-2 scale-110'
                  : 'hover:bg-blue-100 text-blue-600'
            }`}
            style={{ padding: isCompact ? '6px' : '8px' }}
            aria-label={
              !canSendMessage
                ? 'Sending message...'
                : isListening
                  ? 'Stop recording'
                  : 'Voice input'
            }
            title={
              !canSendMessage
                ? 'Sending message...'
                : isListening
                  ? 'Stop listening'
                  : 'Tap to start voice input'
            }
          >
            {isListening ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={isCompact ? '16' : '20'}
                height={isCompact ? '16' : '20'}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={isCompact ? '16' : '20'}
                height={isCompact ? '16' : '20'}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            )}
          </button>
        )}

        <button
          onClick={onSendMessage}
          disabled={
            (voiceInputEnabled && isListening) || inputValue.trim() === '' || !canSendMessage
          }
          className={`p-2 ml-1 rounded-full transition-all duration-200 ${
            (voiceInputEnabled && isListening) || inputValue.trim() === '' || !canSendMessage
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-md'
          }`}
          style={{ padding: isCompact ? '6px' : '8px' }}
          aria-label="Send message"
          title={
            !canSendMessage
              ? 'Sending message...'
              : voiceInputEnabled && isListening
                ? 'Stop recording first'
                : 'Send message'
          }
        >
          {!canSendMessage ? (
            <svg
              className="animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              width={isCompact ? '16' : '20'}
              height={isCompact ? '16' : '20'}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={isCompact ? '16' : '20'}
              height={isCompact ? '16' : '20'}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
            </svg>
          )}
        </button>
      </div>

      {/* Disclaimer message */}
      <div className="mt-2 text-center">
        <p className={`${isCompact ? 'text-xs' : 'text-xs'} text-gray-500`}>
          Tiara can make mistakes, so double-check it.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
