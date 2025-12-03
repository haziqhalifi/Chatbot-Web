import React from 'react';
import api from '../../api';
import VoiceInput from './VoiceInput';

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
            try {
              const res = await api.post('/transcribe', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
              const transcript = res.data.transcript;
              onInputChange({ target: { value: transcript } });

              if (transcript.trim()) {
                onSendMessageWithText(transcript, 'voice');
              }
            } catch (err) {
              console.error('Voice transcription failed:', err);
              alert('Voice transcription failed. Please try again.');
            } finally {
              setIsTranscribing(false);
            }
          };

          mediaRecorder.start();
          setIsListening(true);
        } catch (err) {
          alert('Microphone access denied or not available.');
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
      {/* Voice recording indicator */}
      {isListening && <VoiceInput audioLevel={audioLevel} />}

      <div className="bg-gray-50 rounded-[16px] flex items-center p-2 border border-gray-200">
        <input
          type="text"
          placeholder={
            !canSendMessage
              ? 'Sending message...'
              : isListening
                ? 'Recording... Tap microphone to stop'
                : 'Type your message...'
          }
          value={inputValue}
          onChange={onInputChange}
          onKeyPress={onKeyPress}
          disabled={isListening || !canSendMessage}
          className={`flex-1 bg-transparent text-sm outline-none px-2 min-w-0 transition-all duration-200 ${
            isListening || !canSendMessage ? 'text-gray-400 cursor-not-allowed' : 'text-gray-800'
          }`}
          style={{ width: '100%' }}
        />

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
            !canSendMessage ? 'Sending message...' : isListening ? 'Stop recording' : 'Voice input'
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

        <button
          onClick={onSendMessage}
          disabled={isListening || inputValue.trim() === '' || !canSendMessage}
          className={`p-2 ml-1 rounded-full transition-all duration-200 ${
            isListening || inputValue.trim() === '' || !canSendMessage
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-md'
          }`}
          style={{ padding: isCompact ? '6px' : '8px' }}
          aria-label="Send message"
          title={
            !canSendMessage
              ? 'Sending message...'
              : isListening
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
