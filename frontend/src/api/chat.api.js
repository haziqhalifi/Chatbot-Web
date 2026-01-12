import api from './client';

// Chat API endpoints
const chatAPI = {
  // Create a new chat session
  createSession: (title = null, aiProvider = null) => {
    return api.post('/chat/sessions', { title, ai_provider: aiProvider });
  },

  // Get available AI providers
  getProviders: () => {
    return api.get('/chat/providers');
  },

  // Get user's chat sessions
  getSessions: (limit = 20, offset = 0) => {
    return api.get('/chat/sessions', {
      params: { limit, offset },
    });
  },

  // Get specific session details
  getSession: (sessionId) => {
    return api.get(`/chat/sessions/${sessionId}`);
  },

  // Get messages for a specific session
  getSessionMessages: (sessionId, limit = 50, offset = 0) => {
    return api.get(`/chat/sessions/${sessionId}/messages`, {
      params: { limit, offset },
    });
  },

  // Save a message to a session
  saveMessage: (sessionId, messageData) => {
    return api.post(`/chat/sessions/${sessionId}/messages`, messageData);
  },

  // Update session title
  updateSessionTitle: (sessionId, title) => {
    return api.put(`/chat/sessions/${sessionId}`, { title });
  },

  // Delete a session
  deleteSession: (sessionId) => {
    return api.delete(`/chat/sessions/${sessionId}`);
  },

  // Generate AI response with session context
  generateResponse: (sessionId, prompt, messageType = 'text') => {
    return api.post('/chat/generate', {
      session_id: sessionId,
      prompt: prompt,
      message_type: messageType,
    });
  },
};

export default chatAPI;
