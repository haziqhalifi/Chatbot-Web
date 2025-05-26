import React, { useState } from 'react';

const ChatInterface = () => {
  const [isChatOpen, setIsChatOpen] = useState(true);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="fixed bottom-0 right-0 z-50">
      {/* Chat interface - Expanded */}
      {isChatOpen && (
        <div className="mb-4 mr-4 transition-all duration-300 ease-in-out">
          <ChatBox onClose={toggleChat} />
        </div>
      )}

      {/* Chat button - Collapsed */}
      {!isChatOpen && (
        <button
          onClick={toggleChat}
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
const ChatBox = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hi Haziq! How can I help you today with disaster management?',
    },
    {
      id: 2,
      sender: 'user',
      text: 'Show me flood prone area near to Bandar Kinrara',
    },
    {
      id: 3,
      sender: 'bot',
      text: 'There are 5 spots that are recognised as flood prone areas in Bukit Kinrara. Let me show them on the map.\n\nWould you like to know when floods usually happen?',
    },
  ]);

  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const newUserMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputValue,
    };

    setMessages([...messages, newUserMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        sender: 'bot',
        text: 'I am analyzing the data for your request. Please wait a moment while I gather information about flood patterns in this area.',
      };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <div className="bg-[#a1a1a1] rounded-[22px] w-[380px] h-[600px] flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-300">
        <div className="flex items-center">
          {/* Bot Avatar - Using CSS instead of image */}
          <div className="w-[43px] h-[43px] rounded-full bg-[#0a4974] flex items-center justify-center text-white font-bold text-lg">
            T
          </div>
          <h2 className="text-xl font-bold text-[#0a4974] ml-3">Ask Tiara</h2>
        </div>
        <button
          onClick={onClose}
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

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'bot' && (
              <div className="w-[35px] h-[35px] rounded-full bg-[#0a4974] flex items-center justify-center text-white font-bold text-sm mr-2 flex-shrink-0">
                T
              </div>
            )}
            <div
              className={`rounded-[15px] p-3 max-w-[250px] ${
                message.sender === 'user'
                  ? 'bg-[#d0e8ff] text-[#333333]'
                  : 'bg-[#f0f0f0] text-[#333333]'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
            </div>
            {message.sender === 'user' && (
              <div className="w-[35px] h-[35px] rounded-full bg-[#083757] flex items-center justify-center text-white font-bold text-sm ml-2 flex-shrink-0">
                H
              </div>
            )}
          </div>
        ))}
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
            onClick={handleSendMessage}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
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
