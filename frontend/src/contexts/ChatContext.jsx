import React, { createContext, useContext } from 'react';
import { useChat as useChatHook } from '../hooks/useChat';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const chat = useChatHook();
  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
