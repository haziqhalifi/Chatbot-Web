import { useState, useEffect, useCallback } from 'react';
import { chatAPI } from '../api';

// Create a custom event for map commands
export const MAP_COMMAND_EVENT = 'mapCommand';

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

  const [availableProviders, setAvailableProviders] = useState(['openai']);
  const [defaultProvider, setDefaultProvider] = useState('openai');
  const [providerDescriptions, setProviderDescriptions] = useState({});
  const [preferredProvider, setPreferredProviderState] = useState(() => {
    const stored = localStorage.getItem('tiara_ai_provider');
    return stored || 'openai';
  });

  const setPreferredProvider = useCallback(
    (provider, validProviders) => {
      const providerList =
        Array.isArray(validProviders) && validProviders.length > 0
          ? validProviders
          : availableProviders;
      const fallback = defaultProvider || providerList[0] || 'openai';

      if (!provider) {
        setPreferredProviderState(fallback);
        localStorage.setItem('tiara_ai_provider', fallback);
        return;
      }

      if (!providerList.includes(provider)) {
        console.warn(`Attempted to set unavailable AI provider: ${provider}`);
        setPreferredProviderState(fallback);
        localStorage.setItem('tiara_ai_provider', fallback);
        return;
      }

      setPreferredProviderState(provider);
      localStorage.setItem('tiara_ai_provider', provider);
    },
    [availableProviders, defaultProvider]
  );

  // Save current session to localStorage whenever it changes
  useEffect(() => {
    if (currentSession) {
      localStorage.setItem('tiara_current_session', JSON.stringify(currentSession));
    } else {
      localStorage.removeItem('tiara_current_session');
    }
  }, [currentSession]);

  // Fetch AI providers only once on mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await chatAPI.getProviders();
        const data = response.data || {};

        const providerList =
          Array.isArray(data.providers) && data.providers.length > 0 ? data.providers : ['openai'];
        const defaultFromApi =
          data.default && providerList.includes(data.default) ? data.default : providerList[0];

        setAvailableProviders(providerList);
        setDefaultProvider(defaultFromApi);
        setProviderDescriptions(data.descriptions || {});

        const stored = localStorage.getItem('tiara_ai_provider');
        const initial = stored && providerList.includes(stored) ? stored : defaultFromApi;
        setPreferredProvider(initial, providerList);
      } catch (err) {
        console.error('Failed to fetch AI providers:', err);
        setAvailableProviders(['openai']);
        setDefaultProvider('openai');
        setProviderDescriptions({});
        setPreferredProvider('openai', ['openai']);
      }
    };

    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - fetch only once on mount

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
  const createSession = useCallback(
    async (title = null, aiProviderOverride = null) => {
      try {
        setLoading(true);
        setError(null);
        setIsCreatingSession(true);

        const providerToUse =
          aiProviderOverride ||
          preferredProvider ||
          defaultProvider ||
          availableProviders[0] ||
          'openai';

        const response = await chatAPI.createSession(title, providerToUse);
        const newSession = response.data;

        setCurrentSession(newSession);
        setSessions((prev) => [newSession, ...prev]);
        setSessionInitialized(true);
        setPreferredProvider(newSession.ai_provider || providerToUse);

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
    },
    [preferredProvider, defaultProvider, availableProviders, setPreferredProvider]
  );

  // Load an existing session
  const loadSession = useCallback(
    async (sessionId) => {
      try {
        setLoading(true);
        setError(null);

        // Get session details
        const sessionResponse = await chatAPI.getSession(sessionId);
        const session = sessionResponse.data;
        setCurrentSession(session);
        setPreferredProvider(session.ai_provider);

        // Get session messages
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
    },
    [setPreferredProvider]
  );
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
    async (messageText, messageType = 'text') => {
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
          message_type: messageType,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);

        // Send to backend for AI response
        const response = await chatAPI.generateResponse(
          currentSession.id,
          messageText,
          messageType
        );
        const aiResponse = response.data;

        // Add bot response to messages
        const botMessage = {
          id: aiResponse.bot_message.id || messages.length + 2,
          sender: 'bot',
          text: aiResponse.ai_response.response || aiResponse.bot_message.content,
          timestamp: aiResponse.bot_message.timestamp,
          mapCommands: aiResponse.ai_response.map_commands || null, // Include map commands in message
        };

        setMessages((prev) => [...prev, botMessage]);

        // Handle map commands if present
        if (aiResponse.ai_response.map_commands && aiResponse.ai_response.map_commands.length > 0) {
          console.log('Dispatching map commands:', aiResponse.ai_response.map_commands);
          window.dispatchEvent(
            new CustomEvent(MAP_COMMAND_EVENT, {
              detail: {
                commands: aiResponse.ai_response.map_commands,
                messageId: botMessage.id, // Pass message ID to link results
              },
            })
          );
        }

        return aiResponse;
      } catch (err) {
        // Keep messages as is on error (user message already added)
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
  const startNewChat = useCallback(
    async (aiProviderOverride = null) => {
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
        const newSession = await createSession(null, aiProviderOverride);
        console.log('Started new chat with session:', newSession.id);
        return newSession;
      } catch (err) {
        console.error('Failed to start new chat:', err);
        throw err;
      }
    },
    [createSession]
  );

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
      const { text, messageType } = pendingMessage;
      setPendingMessage(null);

      // Send the pending message
      sendMessage(text, messageType).catch((error) => {
        console.error('Failed to send pending message:', error);
      });
    }
  }, [currentSession, isCreatingSession, pendingMessage, isSending, sendMessage]);

  // Enhanced send message that can handle session creation
  const sendMessageWithSessionHandling = useCallback(
    async (messageText, messageType = 'text') => {
      // If we're currently creating a session, queue the message
      if (isCreatingSession) {
        setPendingMessage({ text: messageText, messageType });
        return;
      }

      // If no session exists, create one and queue the message
      if (!currentSession) {
        setPendingMessage({ text: messageText, messageType });
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
        return await sendMessage(messageText, messageType);
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
          setPendingMessage({ text: messageText, messageType });
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
    availableProviders,
    providerDescriptions,
    preferredProvider,
    defaultProvider,

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
    setPreferredProvider,

    // Computed
    hasActiveSession: !!currentSession,
    sessionCount: sessions.length,
    canSendMessage: !isSending && !isCreatingSession,
  };
};
