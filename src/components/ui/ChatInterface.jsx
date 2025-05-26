// src/pages/disaster-watch-flood-map/index.jsx
import React, { useState } from 'react';
import Header from '../common/Header';
import MapView from '../../pages/Dashboard/MapView';
// import MapControls from '../DisasterMap/MapControls';

const ChatInterface = () => {
  const [isChatOpen, setIsChatOpen] = useState(true);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="relative">
      {/* Chat interface - Expanded */}
      {isChatOpen && (
        <div className="absolute top-[147px] left-[17px] transition-all duration-300 ease-in-out z-50">
          <ChatBox onClose={toggleChat} />
        </div>
      )}

      {/* Chat button - Collapsed */}
      {!isChatOpen && (
        <button
          onClick={toggleChat}
          className="absolute bottom-6 right-6 bg-[#0a4974] hover:bg-[#083757] text-white rounded-full p-4 shadow-lg transition-all duration-200 transform hover:scale-105"
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
      text: 'There are 5 spot that is recognised as flood prone area in Bukit Kinrara. Let me show in the map.\n\nWould you like to know when floods usually happen?',
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
    <div className="bg-[#a1a1a1] rounded-[22px] w-[379px] h-[656px] flex flex-col relative shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center p-2">
        <div className="flex items-center">
          <img
            src="/images/img_image_2.png"
            alt="Tiara"
            className="w-[43px] h-[43px] rounded-full"
          />
          <h2 className="text-2xl font-bold text-[#0a4974] ml-2">Ask Tiara</h2>
        </div>
        <button
          onClick={onClose}
          className="bg-[#0a4974] hover:bg-[#083757] text-white rounded-full p-2 transition-colors duration-200 ml-2"
          aria-label="Minimize chat"
        >
          {/* X (close) icon */}
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
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            {message.sender === 'bot' && (
              <img
                src="/images/img_image_2.png"
                alt="Bot"
                className="w-[43px] h-[43px] rounded-full mr-2"
              />
            )}
            <div
              className={`rounded-[15px] p-3 max-w-[258px] ${
                message.sender === 'user'
                  ? 'bg-[#d0e8ff] text-[#333333]'
                  : 'bg-[#f0f0f0] text-[#333333]'
              }`}
            >
              <p className="text-xs leading-[14px] whitespace-pre-line">{message.text}</p>
            </div>
            {message.sender === 'user' && (
              <img
                src="/images/img_image_3.png"
                alt="User"
                className="w-[50px] h-[50px] rounded-full ml-2"
              />
            )}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="p-3">
        <div className="bg-[#fafafa] rounded-[16px] flex items-center p-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent text-xs outline-none px-2"
          />
          <button className="p-1">
            <img src="/images/img_image_5.png" alt="Voice" className="w-[31px] h-[31px]" />
          </button>
          <button onClick={handleSendMessage} className="p-1">
            <img src="/images/img_image_6.png" alt="Send" className="w-[31px] h-[31px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
