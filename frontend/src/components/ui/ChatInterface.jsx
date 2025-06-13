import React, { useState, useRef, useEffect } from 'react';
import api from '../../api';

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
  const [messages, setMessages] = useState(
    () =>
      savedChat || [
        {
          id: 1,
          sender: 'bot',
          text: 'Hi Haziq! How can I help you today with disaster management?',
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
              { id: prev.length + 1, sender: 'user', text: '[Voice message: transcribing...]' },
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
    const newChat = [
      {
        id: 1,
        sender: 'bot',
        text: 'Hi Haziq! How can I help you today with disaster management?',
      },
    ];
    setMessages(newChat);
    if (onNewChat) onNewChat();
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
          <img
            src="/images/tiara.png"
            alt="Tiara Bot Avatar"
            className="w-[43px] h-[43px] rounded-full object-cover bg-[#0a4974]"
          />
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
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{
          minHeight: 0,
          maxHeight: height ? height - 170 : 430,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{ width: '100%' }}
          >
            {message.sender === 'bot' && (
              <img
                src="/images/tiara.png"
                alt="Tiara Bot Avatar"
                className="w-[43px] h-[43px] rounded-full object-cover bg-[#0a4974]"
              />
            )}
            <div
              className={`rounded-[15px] p-3 ${message.sender === 'user' ? 'bg-[#d0e8ff] text-[#333333]' : 'bg-[#f0f0f0] text-[#333333]'}`}
              style={{ maxWidth: '80%', wordBreak: 'break-word', width: 'fit-content' }}
            >
              {message.sender === 'bot' ? (
                <p
                  className="text-sm leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: message.text }}
                  style={{ wordBreak: 'break-word' }}
                />
              ) : (
                <p
                  className="text-sm leading-relaxed whitespace-pre-line"
                  style={{ wordBreak: 'break-word' }}
                >
                  {message.text}
                </p>
              )}
            </div>
            {message.sender === 'user' && (
              <img
                src="/images/profile.JPG"
                alt="Tiara Bot Avatar"
                className="w-[43px] h-[43px] rounded-full object-cover bg-[#0a4974]"
              />
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      {/* Input area */}
      <div className="p-4 border-t border-gray-300">
        <div className="bg-[#fafafa] rounded-[16px] flex items-center p-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent text-sm outline-none px-2 min-w-0"
            style={{ width: '100%' }}
          />
          <button
            onClick={handleVoiceClick}
            className={`p-2 hover:bg-gray-200 rounded-full transition-colors duration-200 ${isListening ? 'ring-2 ring-[#0a4974]' : ''}`}
            aria-label="Voice input"
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
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </button>
          <button
            onClick={handleSendMessage}
            className="p-2 ml-1 bg-[#0a4974] hover:bg-[#083757] text-white rounded-full transition-colors duration-200"
            aria-label="Send message"
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
