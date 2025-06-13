import React, { useState, useRef, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const ChatInterface = () => {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [savedChat, setSavedChat] = useState(() => {
    const saved = localStorage.getItem('tiara_last_chat');
    return saved ? JSON.parse(saved) : null;
  });
  const [chatKey, setChatKey] = useState(0); // To force ChatBox remount on new chat
  const [chatSize, setChatSize] = useState({ width: 380, height: 600 });
  // Fixed position - always anchored to bottom-right
  const fixedPosition = { right: 16, bottom: 16 };
  const resizingRef = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleClose = (messages) => {
    setIsChatOpen(false);
    if (messages) {
      setSavedChat(messages);
      localStorage.setItem('tiara_last_chat', JSON.stringify(messages));
    }
  };

  const handleOpen = () => {
    setIsChatOpen(true);
  };

  const handleNewChat = () => {
    setSavedChat(null);
    localStorage.removeItem('tiara_last_chat');
    setChatKey((k) => k + 1); // Force ChatBox remount
  };

  // Mouse event handlers for resizing (top-left, anchored bottom-right)
  const handleResizeMouseDown = (e) => {
    resizingRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: chatSize.width,
      startHeight: chatSize.height,
    };
    document.body.style.userSelect = 'none';
    e.stopPropagation();
    e.preventDefault();
  };
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingRef.current) return;
      // Calculate size changes - expanding to top and left
      const dx = resizingRef.current.startX - e.clientX; // positive when dragging left
      const dy = resizingRef.current.startY - e.clientY; // positive when dragging up

      const newWidth = Math.max(300, resizingRef.current.startWidth + dx);
      const newHeight = Math.max(400, resizingRef.current.startHeight + dy);

      // Clamp so chat doesn't exceed viewport bounds
      const maxWidth = window.innerWidth - fixedPosition.right;
      const maxHeight = window.innerHeight - fixedPosition.bottom;

      setChatSize({
        width: Math.min(newWidth, maxWidth),
        height: Math.min(newHeight, maxHeight),
      });
    };

    const handleMouseUp = () => {
      resizingRef.current = false;
      document.body.style.userSelect = '';
    };

    // Handle window resize to keep chat in bounds
    const handleWindowResize = () => {
      setChatSize((prevSize) => {
        const maxWidth = window.innerWidth - fixedPosition.right;
        const maxHeight = window.innerHeight - fixedPosition.bottom;
        return {
          width: Math.min(prevSize.width, maxWidth),
          height: Math.min(prevSize.height, maxHeight),
        };
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  return (
    <>
      {/* Chat interface - Expanded */}
      {isChatOpen && (
        <div
          className="fixed z-50 transition-all duration-300 ease-in-out"
          style={{
            right: `${fixedPosition.right}px`,
            bottom: `${fixedPosition.bottom}px`,
            width: chatSize.width,
            height: chatSize.height,
          }}
        >
          {/* Resize handle (top-left) */}
          <div
            onMouseDown={handleResizeMouseDown}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 20,
              height: 20,
              cursor: 'nwse-resize',
              zIndex: 10,
              background: 'transparent',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <polyline points="0,20 20,0" stroke="#0a4974" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <ChatBox
            key={chatKey}
            onClose={handleClose}
            onNewChat={handleNewChat}
            savedChat={savedChat}
            width={chatSize.width}
            height={chatSize.height}
          />
        </div>
      )}

      {/* Chat button - Collapsed - Fixed position */}
      {!isChatOpen && (
        <button
          onClick={handleOpen}
          className="fixed z-50 bg-[#0a4974] hover:bg-[#083757] text-white rounded-full p-4 shadow-lg transition-all duration-200 transform hover:scale-105"
          style={{
            right: '16px',
            bottom: '16px',
          }}
          aria-label="Open chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}
    </>
  );
};

// Chat Interface Component
const ChatBox = ({ onClose, onNewChat, savedChat, width, height }) => {
  const { token } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [messages, setMessages] = useState(
    () =>
      savedChat || [
        {
          id: 1,
          sender: 'bot',
          text: 'Hi there! How can I help you today with disaster management?',
        },
      ]
  );
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // For waveform
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const chatEndRef = useRef(null);

  // Fetch user profile for avatar
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) return;

      try {
        const response = await api.get('/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 5000,
        });
        setUserProfile(response.data);

        // Update welcome message with user's name if available and it's the default message
        if (
          response.data.name &&
          messages.length === 1 &&
          messages[0].sender === 'bot' &&
          messages[0].text.includes('Hi there!')
        ) {
          setMessages([
            {
              id: 1,
              sender: 'bot',
              text: `Hi ${response.data.name}! How can I help you today with disaster management?`,
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch user profile for chat:', error);
      }
    };

    fetchUserProfile();
  }, [token]); // Removed messages dependency to avoid infinite loop

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isListening]);

  // Clean up audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => setInputValue(e.target.value);

  const sendMessageToLlama = async (message) => {
    try {
      const response = await api.post(
        '/generate',
        { prompt: message },
        {
          headers: {
            'x-api-key': 'secretkey', // Replace with your actual API key
          },
        }
      );
      return response.data.response || 'No response from Llama.';
    } catch (error) {
      console.error('Llama API error:', error);
      return 'Sorry, there was an error contacting the Tiara.';
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const newUserMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputValue,
    };

    // Add user message and a temporary typing indicator
    setMessages((prevMessages) => [
      ...prevMessages,
      newUserMessage,
      {
        id: prevMessages.length + 2,
        sender: 'bot',
        text: 'Tiara is typing...',
      },
    ]);
    setInputValue('');

    // Get Llama AI response from backend
    const llamaReply = await sendMessageToLlama(inputValue);
    setMessages((prevMessages) => {
      // Replace the last message (typing indicator) with the real reply
      const updated = [...prevMessages];
      updated[updated.length - 1] = {
        id: updated.length,
        sender: 'bot',
        text: llamaReply,
      };
      return updated;
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

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
            // Calculate average amplitude
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
            // Send audioBlob to backend for transcription
            const formData = new FormData();
            formData.append('file', audioBlob, 'voice.wav');
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                sender: 'user',
                text: '🎤 Transcribing voice message...',
                isTranscribing: true,
              },
            ]);
            try {
              const res = await api.post('/transcribe', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
              const transcript = res.data.transcript;
              setMessages((prev) => prev.slice(0, -1));
              setInputValue(transcript);
              handleSendMessageWithText(transcript);
            } catch (err) {
              setMessages((prev) => [
                ...prev.slice(0, -1),
                { id: prev.length, sender: 'bot', text: 'Voice transcription failed.' },
              ]);
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

  // Helper to send a specific text (used for voice transcript)
  const handleSendMessageWithText = async (text) => {
    if (text.trim() === '') return;
    const newUserMessage = {
      id: messages.length + 1,
      sender: 'user',
      text,
    };
    setMessages((prevMessages) => [
      ...prevMessages,
      newUserMessage,
      {
        id: prevMessages.length + 2,
        sender: 'bot',
        text: 'Tiara is typing...',
      },
    ]);
    setInputValue('');
    const llamaReply = await sendMessageToLlama(text);
    setMessages((prevMessages) => {
      const updated = [...prevMessages];
      updated[updated.length - 1] = {
        id: updated.length,
        sender: 'bot',
        text: llamaReply,
      };
      return updated;
    });
  };

  // New Chat button handler
  const handleNewChatClick = () => {
    const userName = userProfile?.name || 'there';
    const newChat = [
      {
        id: 1,
        sender: 'bot',
        text: `Hi ${userName}! How can I help you today with disaster management?`,
      },
    ];
    setMessages(newChat);
    if (onNewChat) onNewChat();
  };

  // User Avatar Component with fallback
  const UserAvatar = () => {
    const [imageError, setImageError] = useState(false);

    if (userProfile?.profile_picture && !imageError) {
      return (
        <img
          src={userProfile.profile_picture}
          alt="User Avatar"
          className="w-8 h-8 rounded-full object-cover bg-[#0a4974] ring-2 ring-white shadow-sm"
          onError={() => {
            console.log('User profile picture failed to load, using fallback');
            setImageError(true);
          }}
        />
      );
    }

    // Fallback to default image or user initials
    if (userProfile?.name) {
      const initials = userProfile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      return (
        <div className="w-8 h-8 rounded-full bg-[#0a4974] flex items-center justify-center text-white font-semibold text-xs ring-2 ring-white shadow-sm">
          {initials}
        </div>
      );
    }

    // Ultimate fallback - default profile image
    return (
      <img
        src="/images/profile.JPG"
        alt="User Avatar"
        className="w-8 h-8 rounded-full object-cover bg-[#0a4974] ring-2 ring-white shadow-sm"
        onError={(e) => {
          // If even the default image fails, show a generic avatar
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  };

  return (
    <div
      className="bg-[#a1a1a1] rounded-[22px] flex flex-col shadow-2xl"
      style={{
        width: width || 380,
        height: height || 600,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-300">
        <div className="flex items-center">
          {/* Bot Avatar - Using image instead of CSS */}
          <div className="flex items-center">
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
          <h2 className="text-xl font-bold text-[#0a4974] ml-3">Ask Tiara</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleNewChatClick}
            className="bg-[#0a4974] hover:bg-[#083757] text-white rounded-full p-2 transition-colors duration-200"
            aria-label="New Chat"
            title="Start a new chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button
            onClick={() => onClose(messages)}
            className="bg-[#0a4974] hover:bg-[#083757] text-white rounded-full p-2 transition-colors duration-200"
            aria-label="Minimize chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
      </div>
      {/* Chat messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{
          minHeight: 0,
          maxHeight: height ? height - 170 : 430,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          scrollBehavior: 'smooth'
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-2`}
            style={{ width: '100%' }}
          >
            {message.sender === 'bot' && (
              <div className="flex items-end mb-1">
                <div className="relative">
                  <img
                    src="/images/tiara.png"
                    alt="Tiara Bot Avatar"
                    className={`w-8 h-8 rounded-full object-cover bg-[#0a4974] transition-all duration-300 ${
                      message.text === 'Tiara is typing...'
                        ? 'ring-2 ring-blue-300 ring-offset-1'
                        : ''
                    }`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {message.text === 'Tiara is typing...' && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div
                  className="w-8 h-8 rounded-full bg-[#0a4974] flex items-center justify-center text-white font-semibold text-xs"
                  style={{ display: 'none' }}
                >
                  🤖
                </div>
              </div>
            )}
            
            <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}>
              <div
                className={`relative px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-br from-[#0a4974] to-[#083757] text-white rounded-2xl rounded-br-md' 
                    : 'bg-white text-[#333333] rounded-2xl rounded-bl-md border border-gray-100'
                }`}
                style={{ 
                  wordBreak: 'break-word',
                  position: 'relative'
                }}
              >
                {/* Message tail */}
                <div 
                  className={`absolute ${
                    message.sender === 'user'
                      ? 'bottom-0 -right-2 border-l-[10px] border-l-[#083757] border-t-[10px] border-t-transparent'
                      : 'bottom-0 -left-2 border-r-[10px] border-r-white border-t-[10px] border-t-transparent'
                  }`}
                  style={{
                    bottom: '2px'
                  }}
                ></div>

                {message.sender === 'bot' ? (
                  message.text === 'Tiara is typing...' ? (
                    // Animated typing indicator
                    <div className="flex items-center space-x-2 py-1">
                      <span className="text-sm text-gray-600 font-medium">Tiara is typing</span>
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <p
                      className="text-sm leading-relaxed whitespace-pre-line"
                      dangerouslySetInnerHTML={{ __html: message.text }}
                      style={{ wordBreak: 'break-word' }}
                    />
                  )
                ) : message.isTranscribing ? (
                  // Animated transcription indicator
                  <div className="flex items-center space-x-2 py-1">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-white font-medium italic">
                      Transcribing...
                    </span>
                  </div>
                ) : (
                  <p
                    className="text-sm leading-relaxed whitespace-pre-line font-medium"
                    style={{ wordBreak: 'break-word' }}
                  >
                    {message.text}
                  </p>
                )}
              </div>
              
              {/* Timestamp */}
              <div className={`text-xs text-gray-500 mt-1 px-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>

            {message.sender === 'user' && (
              <div className="flex items-end mb-1">
                <UserAvatar />
                {/* Fallback div for when default image also fails */}
                <div
                  className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold text-xs"
                  style={{ display: 'none' }}
                >
                  👤
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      {/* Input area */}
      <div className="p-4 border-t border-gray-300">
        {/* Voice recording indicator */}
        {isListening && (
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
        )}

        <div className="bg-[#fafafa] rounded-[16px] flex items-center p-2">
          <input
            type="text"
            placeholder={
              isListening ? 'Recording... Tap microphone to stop' : 'Type your message...'
            }
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isListening}
            className={`flex-1 bg-transparent text-sm outline-none px-2 min-w-0 transition-all duration-200 ${
              isListening ? 'text-gray-400 cursor-not-allowed' : 'text-gray-800'
            }`}
            style={{ width: '100%' }}
          />
          <button
            onClick={handleVoiceClick}
            className={`p-2 rounded-full transition-all duration-200 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white ring-2 ring-red-300 ring-offset-2 scale-110'
                : 'hover:bg-gray-200 text-gray-600'
            }`}
            aria-label={isListening ? 'Stop recording' : 'Voice input'}
            title={isListening ? 'Stop recording' : 'Hold to record voice message'}
          >
            {isListening ? (
              // Stop recording icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              // Microphone icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
            onClick={handleSendMessage}
            disabled={isListening || inputValue.trim() === ''}
            className={`p-2 ml-1 rounded-full transition-all duration-200 ${
              isListening || inputValue.trim() === ''
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#0a4974] hover:bg-[#083757] text-white hover:scale-105'
            }`}
            aria-label="Send message"
            title={isListening ? 'Stop recording first' : 'Send message'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
