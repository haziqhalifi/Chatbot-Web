import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook for Web Speech API with language support
 * Supports Chrome/Edge browsers (and other Chromium-based browsers)
 *
 * Supported languages:
 * - English (en-US, en-GB, etc.)
 * - Malay/Bahasa Melayu (ms-MY)
 * - Auto-detect (uses browser default)
 */
const useWebSpeechAPI = () => {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isFinal, setIsFinal] = useState(false);
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  // Initialize Web Speech API
  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError(
        'Web Speech API is not supported in this browser. Please use Chrome, Edge, or another Chromium-based browser.'
      );
      return;
    }

    setIsSupported(true);
    recognitionRef.current = new SpeechRecognition();

    // Configure recognition
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = localStorage.getItem('voiceLanguage') || 'en-US';

    // Handle results
    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError('');
      setTranscript('');
      setIsFinal(false);
    };

    recognitionRef.current.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          final += transcriptSegment + ' ';
        } else {
          interim += transcriptSegment;
        }
      }

      setTranscript(final || interim);
      setIsFinal(final.length > 0);
    };

    recognitionRef.current.onerror = (event) => {
      let errorMessage = 'Voice recognition error occurred.';

      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please speak clearly and try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Ensure that your microphone is connected.';
          break;
        case 'not-allowed':
          errorMessage =
            'Microphone permission denied. Please allow microphone access in your browser settings.';
          break;
        case 'network':
          errorMessage = 'Network error occurred during speech recognition.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }

      setError(errorMessage);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;

    // Update language from localStorage
    const voiceLanguage = localStorage.getItem('voiceLanguage') || 'en-US';
    recognitionRef.current.lang = voiceLanguage;

    setTranscript('');
    setError('');
    setIsFinal(false);
    recognitionRef.current.start();
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.abort();
    setIsListening(false);
  }, []);

  // Abort recognition
  const abort = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.abort();
    setIsListening(false);
    setTranscript('');
    setError('');
  }, []);

  return {
    isListening,
    transcript,
    isFinal,
    error,
    isSupported,
    startListening,
    stopListening,
    abort,
  };
};

export default useWebSpeechAPI;
