import React, { useState, useRef, useEffect, useMemo } from 'react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../hooks/useChat';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ExportDropdown from './ExportDropdown';

const ChatBox = ({ onClose, onNewChat, width, height, mapView }) => {
  const { token } = useAuth();
  const {
    currentSession,
    messages,
    loading,
    error,
    sendMessageWithSessionHandling,
    startNewChat,
    clearError,
    isSending,
    isCreatingSession,
    canSendMessage,
    loadSession,
  } = useChat();

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('tiara_user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isRagEnabled, setIsRagEnabled] = useState(() => {
    const savedRagPreference = localStorage.getItem('tiara_rag_enabled');
    return savedRagPreference !== null ? JSON.parse(savedRagPreference) : true;
  });

  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState('chat');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Computed messages with personalized welcome message
  const displayMessages = useMemo(() => {
    if (messages.length === 0) return messages;

    const firstMessage = messages[0];
    if (firstMessage.sender === 'bot' && firstMessage.text.includes('Greetings! I am Tiara.')) {
      if (userProfile?.name) {
        return [
          {
            ...firstMessage,
            text: `Greetings ${userProfile.name}! I am Tiara. 👋 How may I assist you today?`,
          },
          ...messages.slice(1),
        ];
      }
    }
    return messages;
  }, [messages, userProfile]);

  // Handle RAG toggle changes
  const handleRagToggle = () => {
    const newRagState = !isRagEnabled;
    setIsRagEnabled(newRagState);
    localStorage.setItem('tiara_rag_enabled', JSON.stringify(newRagState));
  };

  // Handle new chat button
  const handleNewChatClick = async () => {
    try {
      await startNewChat();
      onNewChat && onNewChat();
    } catch (error) {
      console.error('Failed to start new chat:', error);
    }
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || !canSendMessage) return;

    const messageToSend = inputValue.trim();
    setInputValue('');

    try {
      await sendMessageWithSessionHandling(messageToSend, isRagEnabled);
    } catch (error) {
      console.error('Failed to send message:', error);
      setInputValue(messageToSend);
    }
  };

  // Handle voice message with text
  const handleSendMessageWithText = async (text) => {
    if (text.trim() === '' || !canSendMessage) return;

    const messageToSend = text.trim();
    setInputValue('');

    try {
      await sendMessageWithSessionHandling(messageToSend, isRagEnabled);
    } catch (error) {
      console.error('Failed to send voice message:', error);
      setInputValue(messageToSend);
    }
  };

  // Fetch user profile for avatar
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) return;

      const savedProfile = localStorage.getItem('tiara_user_profile');
      const profileTimestamp = localStorage.getItem('tiara_user_profile_timestamp');
      const now = Date.now();
      const CACHE_DURATION = 24 * 60 * 60 * 1000;

      if (savedProfile && profileTimestamp && now - parseInt(profileTimestamp) < CACHE_DURATION) {
        const cachedProfile = JSON.parse(savedProfile);
        setUserProfile(cachedProfile);
        return;
      }

      try {
        console.log('Fetching fresh user profile data...');
        const response = await api.get('/profile', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        });

        const profileData = response.data;
        setUserProfile(profileData);
        localStorage.setItem('tiara_user_profile', JSON.stringify(profileData));
        localStorage.setItem('tiara_user_profile_timestamp', now.toString());
        console.log('User profile cached in localStorage');
      } catch (error) {
        console.error('Failed to fetch user profile for chat:', error);
        if (savedProfile) {
          console.log('Using expired cached profile data as fallback');
          const cachedProfile = JSON.parse(savedProfile);
          setUserProfile(cachedProfile);
        }
      }
    };

    fetchUserProfile();
  }, [token]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayMessages, isListening]);

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

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.export-dropdown')) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

  useEffect(() => {
    if (currentSession) {
      loadSession(currentSession.id);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && canSendMessage) handleSendMessage();
  };

  return (
    <div
      className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-[22px] flex flex-col shadow-2xl overflow-hidden border border-blue-200"
      style={{
        width: width || 380,
        height: height || 600,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 320,
        minHeight: 450,
      }}
    >
      <ChatHeader
        onClose={() => onClose(messages)}
        onNewChat={handleNewChatClick}
        onRagToggle={handleRagToggle}
        isRagEnabled={isRagEnabled}
        showExportDropdown={showExportDropdown}
        setShowExportDropdown={setShowExportDropdown}
        isExporting={isExporting}
        setIsExporting={setIsExporting}
        messages={messages}
        width={width}
        mapView={mapView}
        exportType={exportType}
        setExportType={setExportType}
      />

      <ChatMessages
        ref={chatContainerRef}
        displayMessages={displayMessages}
        userProfile={userProfile}
        isListening={isListening}
        chatEndRef={chatEndRef}
        height={height}
        width={width}
      />

      <ChatInput
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onSendMessage={handleSendMessage}
        onSendMessageWithText={handleSendMessageWithText}
        isListening={isListening}
        setIsListening={setIsListening}
        audioLevel={audioLevel}
        setAudioLevel={setAudioLevel}
        canSendMessage={canSendMessage}
        mediaRecorderRef={mediaRecorderRef}
        audioChunksRef={audioChunksRef}
        audioContextRef={audioContextRef}
        analyserRef={analyserRef}
        sourceRef={sourceRef}
        animationFrameRef={animationFrameRef}
        width={width}
      />
    </div>
  );
};

export default ChatBox;
