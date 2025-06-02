import React, { useState, useRef } from 'react';

const Sidebar = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hi Haziq! How can I help you today with disaster management?'
    },
    {
      id: 2,
      sender: 'user',
      text: 'Show me flood prone area near to Bandar Kinrara'
    },
    {
      id: 3,
      sender: 'bot',
      text: 'There are 5 spot that is recognised as flood prone area in Bukit Kinrara. Let me show in the map.\n\nWould you like to know when floods usually happen?'
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputValue
    };
    
    setMessages([...messages, newUserMessage]);
    setInputValue('');
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        sender: 'bot',
        text: 'I am analyzing the data for your request. Please wait a moment while I gather information about flood patterns in this area.'
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="bg-[#a1a1a1] rounded-[22px] w-[379px] h-[656px] flex flex-col relative">
      {/* Header */}
      <div className="flex justify-between items-center p-2">
        <img 
          src="/images/img_screenshot20250516143016removebgpreview_1.png" 
          alt="Logo" 
          className="w-[28px] h-[24px] ml-3"
        />
        <button className="p-2">
          <img src="/images/img_image_10.png" alt="Close" className="w-5 h-5" />
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
                message.sender === 'user' ?'bg-[#d0e8ff] text-[#333333]' :'bg-[#f0f0f0] text-[#333333]'
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
            ref={inputRef}
            className="flex-1 bg-transparent text-xs outline-none px-2"
          />
          <button onClick={handleSendMessage} className="p-1">
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

export default Sidebar;