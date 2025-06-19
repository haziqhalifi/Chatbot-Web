import { useState, useEffect, useCallback } from 'react';
import { chatAPI } from '../api';

export const useChat = () => {
  const [currentSession, setCurrentSession] = useState(() => {
    // Try to restore session from localStorage
    const savedSession = localStorage.getItem('tiara_current_session');
    return savedSession ? JSON.parse(savedSession) : null;
  });
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState(() => {
    // Start with a hardcoded welcome message
    return [
      {
        id: 1,
        sender: 'bot',
        text: 'Greetings! I am Tiara. 👋 How may I assist you today?',
        timestamp: new Date().toISOString(),
      },
    ];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  // Save current session to localStorage whenever it changes
  useEffect(() => {
    if (currentSession) {
      localStorage.setItem('tiara_current_session', JSON.stringify(currentSession));
    } else {
      localStorage.removeItem('tiara_current_session');
    }
  }, [currentSession]);

  // Validate current session when user is authenticated
  const validateSession = useCallback(async () => {
    if (!currentSession || sessionInitialized) return;

    try {
      // Try to fetch the session to see if it's valid
      await chatAPI.getSession(currentSession.id);
      setSessionInitialized(true);
    } catch (error) {
      console.log('Stored session is invalid, clearing and will create new one when needed');
      setCurrentSession(null);
      setMessages([
        {
          id: 1,
          sender: 'bot',
          text: 'Greetings! I am Tiara. 👋 How may I assist you today?',
          timestamp: new Date().toISOString(),
        },
      ]);
      setSessionInitialized(true);
    }
  }, [currentSession, sessionInitialized]);

  // Initialize session validation when component mounts or when user signs in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !sessionInitialized) {
      validateSession();
    } else if (!token) {
      // Clear session if user is not authenticated
      setCurrentSession(null);
      setSessionInitialized(false);
    }
  }, [validateSession, sessionInitialized]);

  // Create a new chat session
  const createSession = useCallback(async (title = null) => {
    try {
      setLoading(true);
      setError(null);
      setIsCreatingSession(true);
      const response = await chatAPI.createSession(title);
      const newSession = response.data;

      setCurrentSession(newSession);
      setSessions((prev) => [newSession, ...prev]);
      setSessionInitialized(true);

      // Add hardcoded welcome message for new sessions
      setMessages([
        {
          id: 1,
          sender: 'bot',
          text: 'Greetings! I am Tiara. 👋 How may I assist you today?',
          timestamp: new Date().toISOString(),
        },
      ]);

      return newSession;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create chat session');
      throw err;
    } finally {
      setLoading(false);
      setIsCreatingSession(false);
    }
  }, []);

  // Load an existing session
  const loadSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);

      // Get session details
      const sessionResponse = await chatAPI.getSession(sessionId);
      const session = sessionResponse.data;
      setCurrentSession(session); // Get session messages
      const messagesResponse = await chatAPI.getSessionMessages(sessionId);
      const sessionMessages = messagesResponse.data.messages;

      // Convert to frontend format
      const formattedMessages = sessionMessages.map((msg, index) => ({
        id: msg.id || index + 1,
        sender: msg.sender_type,
        text: msg.content,
        timestamp: msg.timestamp,
      }));

      // If no messages exist, add welcome message
      if (formattedMessages.length === 0) {
        formattedMessages.push({
          id: 1,
          sender: 'bot',
          text: 'Greetings! I am Tiara. 👋 How may I assist you today?',
          timestamp: new Date().toISOString(),
        });
      }

      setMessages(formattedMessages);
      return session;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load chat session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  // Get user's chat sessions
  const fetchSessions = useCallback(async (limit = 20, offset = 0, skipLoading = false) => {
    try {
      if (!skipLoading) {
        setLoading(true);
      }
      setError(null);
      const response = await chatAPI.getSessions(limit, offset);
      setSessions(response.data.sessions);
      return response.data.sessions;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch chat sessions');
      throw err;
    } finally {
      if (!skipLoading) {
        setLoading(false);
      }
    }
  }, []);
  // Send a message and get AI response
  const sendMessage = useCallback(
    async (messageText, ragEnabled = true) => {
      if (!currentSession) {
        throw new Error('No active chat session');
      }

      try {
        setError(null);
        setIsSending(true);

        // Add user message to UI immediately
        const userMessage = {
          id: messages.length + 1,
          sender: 'user',
          text: messageText,
          timestamp: new Date().toISOString(),
        };

        const typingMessage = {
          id: messages.length + 2,
          sender: 'bot',
          text: 'Tiara is typing...',
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage, typingMessage]);

        // Send to backend for AI response
        const response = await chatAPI.generateResponse(currentSession.id, messageText, ragEnabled);
        const aiResponse = response.data;

        // Replace typing message with actual response
        const botMessage = {
          id: aiResponse.bot_message.id || messages.length + 2,
          sender: 'bot',
          text: aiResponse.ai_response.response || aiResponse.bot_message.content,
          timestamp: aiResponse.bot_message.timestamp,
        };

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = botMessage; // Replace typing message
          return updated;
        });

        return aiResponse;
      } catch (err) {
        // Remove typing message on error
        setMessages((prev) => prev.slice(0, -1));
        setError(err.response?.data?.detail || 'Failed to send message');
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [currentSession, messages.length]
  );

  // Update session title
  const updateSessionTitle = useCallback(
    async (sessionId, title) => {
      try {
        setError(null);
        await chatAPI.updateSessionTitle(sessionId, title);

        // Update local state
        setSessions((prev) =>
          prev.map((session) => (session.id === sessionId ? { ...session, title } : session))
        );

        if (currentSession && currentSession.id === sessionId) {
          setCurrentSession((prev) => ({ ...prev, title }));
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to update session title');
        throw err;
      }
    },
    [currentSession]
  );

  // Delete a session
  const deleteSession = useCallback(
    async (sessionId) => {
      try {
        setError(null);
        await chatAPI.deleteSession(sessionId);

        // Update local state
        setSessions((prev) => prev.filter((session) => session.id !== sessionId)); // If current session was deleted, clear it and show welcome message
        if (currentSession && currentSession.id === sessionId) {
          setCurrentSession(null);
          setMessages([
            {
              id: 1,
              sender: 'bot',
              text: 'Greetings! I am Tiara. 👋 How may I assist you today?',
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to delete session');
        throw err;
      }
    },
    [currentSession]
  ); // Start a new chat (always create a fresh session)
  const startNewChat = useCallback(async () => {
    try {
      // Clear current session first
      setCurrentSession(null);
      setPendingMessage(null); // Clear any pending messages

      // Add welcome message immediately
      setMessages([
        {
          id: 1,
          sender: 'bot',
          text: 'Greetings! I am Tiara. 👋 How may I assist you today?',
          timestamp: new Date().toISOString(),
        },
      ]);

      // Create a new session (this will preserve the welcome message)
      const newSession = await createSession();
      console.log('Started new chat with session:', newSession.id);
      return newSession;
    } catch (err) {
      console.error('Failed to start new chat:', err);
      throw err;
    }
  }, [createSession]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []); // Initialize chat session (load existing or create new)
  const initializeChat = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // If we have a saved session, try to load it first
      if (currentSession) {
        try {
          await loadSession(currentSession.id);
          console.log('Restored saved session:', currentSession.id);
          return;
        } catch (err) {
          console.log('Saved session no longer valid, fetching fresh sessions');
          setCurrentSession(null);
        }
      }

      // Try to get existing sessions
      const existingSessions = await fetchSessions(1, 0, true); // Skip loading state

      if (existingSessions.length > 0) {
        // Load the most recent session
        const recentSession = existingSessions[0];
        await loadSession(recentSession.id);
        console.log('Loaded most recent session:', recentSession.id);
      } else {
        // No existing sessions, create a new one with welcome message
        const newSession = await createSession();
        console.log('Created new session:', newSession.id);
      }
    } catch (err) {
      console.error('Failed to initialize chat:', err);
      setError('Failed to initialize chat session');
    } finally {
      setLoading(false);
    }
  }, [currentSession, fetchSessions, loadSession, createSession]);
  // Auto-initialize session if user is authenticated and no session exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !currentSession && !loading && messages.length === 0) {
      initializeChat();
    }
  }, [currentSession, loading, messages.length, initializeChat]);
  // Handle pending messages when session becomes available
  useEffect(() => {
    if (currentSession && !isCreatingSession && pendingMessage && !isSending) {
      const { text, ragEnabled } = pendingMessage;
      setPendingMessage(null);

      // Send the pending message
      sendMessage(text, ragEnabled).catch((error) => {
        console.error('Failed to send pending message:', error);
      });
    }
  }, [currentSession, isCreatingSession, pendingMessage, isSending, sendMessage]);

  // Enhanced send message that can handle session creation
  const sendMessageWithSessionHandling = useCallback(
    async (messageText, ragEnabled = true) => {
      // If we're currently creating a session, queue the message
      if (isCreatingSession) {
        setPendingMessage({ text: messageText, ragEnabled });
        return;
      }

      // If no session exists, create one and queue the message
      if (!currentSession) {
        setPendingMessage({ text: messageText, ragEnabled });
        try {
          await createSession();
          // The message will be sent automatically via the useEffect above
        } catch (error) {
          setPendingMessage(null);
          throw error;
        }
        return;
      } // Session exists and ready, send immediately
      try {
        return await sendMessage(messageText, ragEnabled);
      } catch (error) {
        // If we get a 404 "Chat session not found", clear the invalid session and retry
        if (
          error.response?.status === 404 &&
          error.response?.data?.detail === 'Chat session not found'
        ) {
          console.log('Session became invalid, creating new session and retrying...');
          setCurrentSession(null);
          setSessionInitialized(false);

          // Queue the message and create new session
          setPendingMessage({ text: messageText, ragEnabled });
          try {
            await createSession();
            // The message will be sent automatically via the useEffect above
            return;
          } catch (createError) {
            setPendingMessage(null);
            throw createError;
          }
        }
        throw error;
      }
    },
    [currentSession, isCreatingSession, createSession, sendMessage]
  ); // Clear all chat data (useful for logout)
  const clearChatSession = useCallback(() => {
    setCurrentSession(null);
    setSessions([]);
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: 'Greetings! I am Tiara. 👋 How may I assist you today?',
        timestamp: new Date().toISOString(),
      },
    ]);
    setSessionInitialized(false);
    setPendingMessage(null);
    setError(null);
  }, []);

  return {
    // State
    currentSession,
    sessions,
    messages,
    loading,
    error,
    isSending,
    isCreatingSession,
    pendingMessage,
    sessionInitialized,

    // Actions
    createSession,
    loadSession,
    fetchSessions,
    sendMessage,
    sendMessageWithSessionHandling,
    updateSessionTitle,
    deleteSession,
    startNewChat,
    initializeChat,
    clearError,
    validateSession,
    clearChatSession,

    // Computed
    hasActiveSession: !!currentSession,
    sessionCount: sessions.length,
    canSendMessage: !isSending && !isCreatingSession,
  };
};
