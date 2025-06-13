import React, { useState, useRef, useEffect } from 'react';
import api from '../../api';

const ChatInterface = () => {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [savedChat, setSavedChat] = useState(() => {
    const saved = localStorage.getItem('tiara_last_chat');
    return saved ? JSON.parse(saved) : null;
  });
  const [chatKey, setChatKey] = useState(0); // To force ChatBox remount on new chat

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

  return (
    <div className="fixed bottom-0 right-0 z-50">
      {/* Chat interface - Expanded */}
      {isChatOpen && (
        <div className="mb-4 mr-4 transition-all duration-300 ease-in-out">
          <ChatBox
            key={chatKey}
            onClose={handleClose}
            onNewChat={handleNewChat}
            savedChat={savedChat}
          />
        </div>
      )}

      {/* Chat button - Collapsed */}
      {!isChatOpen && (
        <button
          onClick={handleOpen}
          className="mb-6 mr-6 bg-[#0a4974] hover:bg-[#083757] text-white rounded-full p-4 shadow-lg transition-all duration-200 transform hover:scale-105"
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
    </div>
  );
};

// Chat Interface Component
const ChatBox = ({ onClose, onNewChat, savedChat }) => {
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
    <div className="bg-[#a1a1a1] rounded-[22px] w-[380px] h-[600px] flex flex-col shadow-2xl">
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
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Listening indicator with waveform */}
        {isListening && (
          <div className="flex flex-col items-center mb-2">
            <div className="flex items-center space-x-2 animate-pulse">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="#0a4974"
                stroke="#0a4974"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
              <span className="text-[#0a4974] font-semibold">Tiara is listening...</span>
            </div>
            {/* Waveform visualization */}
            <div className="w-full flex justify-center mt-2">
              <div className="flex items-end h-6 space-x-1">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 rounded bg-[#0a4974] transition-all duration-100"
                    style={{
                      height: `${4 + audioLevel * (i % 3 === 0 ? 2 : 1)}px`,
                      opacity: 0.7 + 0.3 * Math.random(),
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'bot' && (
              <img
                src="/images/tiara.png"
                alt="Tiara Bot Avatar"
                className="w-[43px] h-[43px] rounded-full object-cover bg-[#0a4974]"
              />
            )}
            <div
              className={`rounded-[15px] p-3 max-w-[250px] ${
                message.sender === 'user'
                  ? 'bg-[#d0e8ff] text-[#333333]'
                  : 'bg-[#f0f0f0] text-[#333333]'
              }`}
            >
              {message.sender === 'bot' ? (
                <p
                  className="text-sm leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: message.text }}
                />
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
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
            className="flex-1 bg-transparent text-sm outline-none px-2"
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
