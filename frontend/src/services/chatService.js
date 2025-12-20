/**
 * Chat Service
 * Handles chat operations including session management and message generation
 */

import { chatAPI } from '../api.js';

class ChatService {
  constructor() {
    this.currentSession = null;
    this.sessions = [];
  }

  /**
   * Create a new chat session
   */
  async createSession(title = null) {
    try {
      const response = await chatAPI.createSession(title);
      this.currentSession = response.data;
      return response.data;
    } catch (error) {
      console.error('Failed to create chat session:', error);
      throw new Error(error.response?.data?.detail || 'Failed to create chat session');
    }
  }

  /**
   * Get all user chat sessions
   */
  async getSessions(limit = 20, offset = 0) {
    try {
      const response = await chatAPI.getSessions(limit, offset);
      this.sessions = response.data.sessions || [];
      return response.data;
    } catch (error) {
      console.error('Failed to get chat sessions:', error);
      throw new Error(error.response?.data?.detail || 'Failed to get chat sessions');
    }
  }

  /**
   * Load a specific session
   */
  async loadSession(sessionId) {
    try {
      const response = await chatAPI.getSession(sessionId);
      this.currentSession = response.data;
      return response.data;
    } catch (error) {
      console.error('Failed to load chat session:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load chat session');
    }
  }

  /**
   * Get messages for the current session
   */
  async getSessionMessages(sessionId, limit = 50, offset = 0) {
    try {
      const response = await chatAPI.getSessionMessages(sessionId, limit, offset);
      return response.data.messages || [];
    } catch (error) {
      console.error('Failed to get session messages:', error);
      throw new Error(error.response?.data?.detail || 'Failed to get session messages');
    }
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(sessionId, prompt) {
    try {
      // Validate inputs
      if (!sessionId || typeof sessionId !== 'number' || sessionId <= 0) {
        // Added more specific check for sessionId
        console.error('Invalid Session ID in sendMessage:', sessionId);
        throw new Error('Session ID is invalid or missing');
      }
      if (!prompt || prompt.trim() === '') {
        throw new Error('Message cannot be empty');
      }

      // Generate AI response using the chat/generate endpoint
      const response = await chatAPI.generateResponse(sessionId, prompt.trim());

      return {
        success: true,
        data: response.data,
        userMessage: response.data.user_message,
        botMessage: response.data.bot_message,
        aiResponse: response.data.ai_response,
      };
    } catch (error) {
      console.error('Failed to send message:', error);

      let errorMessage = 'Failed to send message';
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please sign in again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Chat session not found. Please create a new session.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Update session title
   */
  async updateSessionTitle(sessionId, title) {
    try {
      const response = await chatAPI.updateSessionTitle(sessionId, title);
      if (this.currentSession && this.currentSession.id === sessionId) {
        this.currentSession.title = title;
      }
      return response.data;
    } catch (error) {
      console.error('Failed to update session title:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update session title');
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId) {
    try {
      const response = await chatAPI.deleteSession(sessionId);

      // Update local state
      this.sessions = this.sessions.filter((session) => session.id !== sessionId);
      if (this.currentSession && this.currentSession.id === sessionId) {
        this.currentSession = null;
      }

      return response.data;
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw new Error(error.response?.data?.detail || 'Failed to delete session');
    }
  }

  /**
   * Get current session
   */
  getCurrentSession() {
    return this.currentSession;
  }

  /**
   * Set current session
   */
  setCurrentSession(session) {
    this.currentSession = session;
  }

  /**
   * Clear current session
   */
  clearCurrentSession() {
    this.currentSession = null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  /**
   * Format chat messages for display
   */
  formatMessage(message) {
    return {
      id: message.id,
      content: message.content,
      sender: message.sender_type || message.sender,
      timestamp: new Date(message.timestamp || message.created_at),
      type: message.message_type || 'text',
    };
  }

  /**
   * Format chat session for display
   */
  formatSession(session) {
    return {
      id: session.id,
      title: session.title || 'Untitled Chat',
      createdAt: new Date(session.created_at),
      updatedAt: new Date(session.updated_at),
      messageCount: session.message_count || 0,
    };
  }
}

// Create and export a singleton instance
const chatService = new ChatService();
export default chatService;
