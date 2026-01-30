import React, { useState, useRef, useEffect, useMemo } from 'react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useChatContext } from '../../contexts/ChatContext';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ExportDropdown from './ExportDropdown';
import ChatHistory from './ChatHistory';
import useUserProfile from '../../hooks/useUserProfile';
import { MapController } from '../../utils/mapController';

const ChatBox = ({
  onClose,
  onNewChat,
  width,
  height,
  mapView,
  displayMode = 'popup',
  onToggleDisplayMode,
}) => {
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
    availableProviders,
    providerDescriptions,
    preferredProvider,
    setPreferredProvider,
  } = useChatContext();
  const { userProfile } = useUserProfile();

  const [inputValue, setInputValue] = useState('');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState('chat');

  const [showHistory, setShowHistory] = useState(false);

  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const mapControllerRef = useRef(null);
  const mapCommandResultsRef = useRef(new Map()); // Store results by message ID
  const processingMessagesRef = useRef(new Set()); // Track messages currently processing map commands

  // Initialize map controller when mapView is available
  useEffect(() => {
    if (mapView) {
      mapControllerRef.current = new MapController(mapView);
      console.log('Map controller initialized');
    }
  }, [mapView]);

  // Listen for map commands from AI responses
  useEffect(() => {
    const handleMapCommands = async (event) => {
      const { commands, messageId } = event.detail;
      if (commands && commands.length > 0 && mapControllerRef.current) {
        console.log('Executing map commands:', commands);

        // Mark as processing
        if (messageId) {
          processingMessagesRef.current.add(messageId);
        }

        try {
          const results = await mapControllerRef.current.executeCommands(commands);
          console.log('Map command results:', results);

          // Store results and remove from processing
          if (messageId) {
            mapCommandResultsRef.current.set(messageId, results);
            processingMessagesRef.current.delete(messageId);
          }

          const successCount = results.filter((r) => r.success).length;
          if (successCount > 0) {
            console.log(`Successfully executed ${successCount} of ${commands.length} map commands`);
          }
        } catch (error) {
          console.error('Error executing map commands:', error);
          if (messageId) {
            processingMessagesRef.current.delete(messageId);
          }
        }
      }
    };

    window.addEventListener('mapCommand', handleMapCommands);
    return () => {
      window.removeEventListener('mapCommand', handleMapCommands);
    };
  }, []);

  // Computed messages with personalized welcome message and map command data
  const displayMessages = useMemo(() => {
    if (messages.length === 0) return messages;

    let processedMessages = messages.map((msg) => {
      // Add map command results if available
      if (msg.sender === 'bot' && msg.id) {
        const results = mapCommandResultsRef.current.get(msg.id);
        if (results) {
          return { ...msg, mapCommandResults: results };
        }
      }
      return msg;
    });

    // Personalize first message
    const firstMessage = processedMessages[0];
    if (firstMessage.sender === 'bot' && firstMessage.text.includes('Greetings! I am Tiara.')) {
      if (userProfile?.name) {
        processedMessages[0] = {
          ...firstMessage,
          text: `Greetings ${userProfile.name}! I am Tiara. 👋 How may I assist you today?`,
        };
      }
    }

    return processedMessages;
  }, [messages, userProfile]);

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
      await sendMessageWithSessionHandling(messageToSend);
    } catch (error) {
      console.error('Failed to send message:', error);
      setInputValue(messageToSend);
    }
  };

  // Handle voice message with text
  const handleSendMessageWithText = async (text, messageType = 'text') => {
    if (text.trim() === '' || !canSendMessage) return;

    const messageToSend = text.trim();
    setInputValue('');

    try {
      await sendMessageWithSessionHandling(messageToSend, messageType);
    } catch (error) {
      console.error('Failed to send voice message:', error);
      setInputValue(messageToSend);
    }
  };

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayMessages]);

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

  const handleOpenHistory = () => {
    setShowHistory(true);
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  return (
    <>
      {/* Chat History Sidebar */}
      <ChatHistory
        isOpen={showHistory}
        onClose={handleCloseHistory}
        currentSessionId={currentSession?.id}
      />

      {/* Chat Box */}
      <div
        className={`bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col shadow-2xl border border-blue-200 ${
          displayMode === 'sidebar'
            ? 'rounded-none h-full overflow-hidden'
            : 'rounded-[22px] overflow-hidden'
        }`}
        style={{
          width: width || 380,
          height: displayMode === 'sidebar' ? '100%' : height || 600,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 320,
          minHeight: displayMode === 'sidebar' ? '100%' : 450,
        }}
      >
        <ChatHeader
          onClose={() => onClose(messages)}
          onNewChat={handleNewChatClick}
          showExportDropdown={showExportDropdown}
          setShowExportDropdown={setShowExportDropdown}
          isExporting={isExporting}
          setIsExporting={setIsExporting}
          messages={messages}
          width={width}
          mapView={mapView}
          exportType={exportType}
          setExportType={setExportType}
          onOpenHistory={handleOpenHistory}
          displayMode={displayMode}
          onToggleDisplayMode={onToggleDisplayMode}
        />

        <ChatMessages
          ref={chatContainerRef}
          displayMessages={displayMessages}
          userProfile={userProfile}
          error={error}
          onClearError={clearError}
          chatEndRef={chatEndRef}
          height={height}
          width={width}
          isSending={isSending}
        />

        <ChatInput
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onSendMessage={handleSendMessage}
          onSendMessageWithText={handleSendMessageWithText}
          canSendMessage={canSendMessage}
          width={width}
        />
      </div>
    </>
  );
};

export default ChatBox;
