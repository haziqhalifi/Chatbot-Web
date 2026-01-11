import React from 'react';
import api from '../../api';
import VoiceInput from './VoiceInput';
import useAppSettings from '../../hooks/useAppSettings';

const ChatInput = ({
  inputValue,
  onInputChange,
  onKeyPress,
  onSendMessage,
  onSendMessageWithText,
  isListening,
  setIsListening,
  audioLevel,
  setAudioLevel,
  canSendMessage,
  mediaRecorderRef,
  audioChunksRef,
  audioContextRef,
  analyserRef,
  sourceRef,
  animationFrameRef,
  width,
  isTranscribing,
  setIsTranscribing,
}) => {
  const settings = useAppSettings();
  const voiceInputEnabled = settings?.voiceInputEnabled !== false;
  const [transcriptionError, setTranscriptionError] = React.useState('');

  const handleVoiceClick = async () => {
    if (!isListening) {
      // Start recording
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new window.MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          // Audio context for waveform
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
          analyserRef.current = audioContextRef.current.createAnalyser();
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.fftSize = 32;
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const updateWave = () => {
            analyserRef.current.getByteTimeDomainData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += Math.abs(dataArray[i] - 128);
            }
            setAudioLevel(sum / bufferLength);
            animationFrameRef.current = requestAnimationFrame(updateWave);
          };
          updateWave();

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          mediaRecorder.onstop = async () => {
            if (audioContextRef.current) {
              audioContextRef.current.close();
              audioContextRef.current = null;
            }
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
            }
            setAudioLevel(0);
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

            const formData = new FormData();
            formData.append('file', audioBlob, 'voice.wav');

            setIsTranscribing(true);
            setTranscriptionError('');
            try {
              // Get user's preferred language from localStorage (default to auto-detect)
              const voiceLanguage = localStorage.getItem('voiceLanguage') || 'auto';

              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

              const res = await api.post('/transcribe', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                params: {
                  language: voiceLanguage,
                  method: 'auto',
                },
                signal: controller.signal,
              });

              clearTimeout(timeoutId);

              const transcript = res.data.transcript;
              const method = res.data.method || 'unknown';
              console.log(`Transcription successful using ${method}`);

              if (!transcript || transcript.trim() === '') {
                setTranscriptionError('No speech detected. Please try again.');
                return;
              }

              onInputChange({ target: { value: transcript } });

              if (transcript.trim()) {
                onSendMessageWithText(transcript, 'voice');
              }
            } catch (err) {
              console.error('Voice transcription failed:', err);

              let errorMsg = 'Voice transcription failed. Please try again.';

              if (err.name === 'AbortError') {
                errorMsg = 'Transcription timeout. Please try recording a shorter message.';
              } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
                errorMsg = 'Request timeout. Please check your internet connection.';
              } else if (err.message.includes('Network Error')) {
                errorMsg = 'Network error. Please check your internet connection.';
              } else if (err.response) {
                if (err.response.status === 503) {
                  errorMsg = 'Transcription service unavailable. Please try again later.';
                } else if (err.response.status === 413) {
                  errorMsg = 'Audio file too large. Please record a shorter message.';
                } else if (err.response.data?.detail) {
                  errorMsg = err.response.data.detail;
                }
              }

              setTranscriptionError(errorMsg);
            } finally {
              setIsTranscribing(false);
            }
          };

          mediaRecorder.start();
          setIsListening(true);
          setTranscriptionError('');
        } catch (err) {
          console.error('Microphone access error:', err);

          let errorMsg = 'Microphone access denied or not available.';

          if (err.name === 'NotAllowedError') {
            errorMsg =
              'Microphone permission denied. Please allow microphone access in your browser settings.';
          } else if (err.name === 'NotFoundError') {
            errorMsg = 'No microphone found. Please connect a microphone and try again.';
          } else if (err.name === 'NotReadableError') {
            errorMsg = 'Microphone is in use by another application.';
          }

          setTranscriptionError(errorMsg);
        }
      }
    } else {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsListening(false);
      }
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
      {voiceInputEnabled && isListening && <VoiceInput audioLevel={audioLevel} />}

      <div className="bg-gray-50 rounded-[16px] flex items-center p-2 border border-gray-200">
        <input
          type="text"
          placeholder={
            !canSendMessage
              ? 'Sending message...'
              : voiceInputEnabled && isListening
                ? 'Recording... Tap microphone to stop'
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
                  ? 'Stop recording'
                  : 'Hold to record voice message'
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
