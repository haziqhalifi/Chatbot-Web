from fastapi import HTTPException
from database import (
    create_chat_session, get_user_chat_sessions, get_chat_session,
    save_chat_message, get_chat_messages, update_chat_session_title,
    delete_chat_session
)
from chat_utils import generate_response
import logging

logger = logging.getLogger(__name__)

class ChatService:
    """Service class for handling chat operations"""
    
    @staticmethod
    def create_new_session(user_id, title=None):
        """Create a new chat session for a user with welcome message"""
        try:
            session = create_chat_session(user_id, title)
            
            # Add welcome message from Tiara
            welcome_message = "Greetings! I am Tiara. How may I assist you today?"
            ChatService.save_bot_message(session['id'], welcome_message)
            
            logger.info(f"Created new chat session {session['id']} for user {user_id} with welcome message")
            return session
        except Exception as e:
            logger.error(f"Failed to create chat session for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to create chat session")
    
    @staticmethod
    def get_user_sessions(user_id, limit=20, offset=0):
        """Get user's chat sessions"""
        try:
            sessions = get_user_chat_sessions(user_id, limit, offset)
            logger.info(f"Retrieved {len(sessions)} chat sessions for user {user_id}")
            return {"sessions": sessions, "total": len(sessions)}
        except Exception as e:
            logger.error(f"Failed to get chat sessions for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve chat sessions")
    
    @staticmethod
    def get_session_details(session_id, user_id):
        """Get specific session details"""
        try:
            session = get_chat_session(session_id, user_id)
            if not session:
                raise HTTPException(status_code=404, detail="Chat session not found")
            return session
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to get chat session {session_id} for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve chat session")
    
    @staticmethod
    def get_session_messages(session_id, user_id, limit=50, offset=0):
        """Get messages for a chat session"""
        try:
            messages = get_chat_messages(session_id, user_id, limit, offset)
            return {"messages": messages, "total": len(messages)}
        except Exception as e:
            logger.error(f"Failed to get messages for session {session_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve messages")
    
    @staticmethod
    def save_user_message(session_id, user_id, content, message_type="text"):
        """Save a user message to the session"""
        try:
            # Verify session belongs to user
            session = get_chat_session(session_id, user_id)
            if not session:
                raise HTTPException(status_code=404, detail="Chat session not found")
            
            # Save the message
            message = save_chat_message(session_id, "user", content, message_type)
            logger.info(f"Saved user message to session {session_id}")
            return message
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to save user message to session {session_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to save message")
    
    @staticmethod
    def save_bot_message(session_id, content, message_type="text"):
        """Save a bot response to the session"""
        try:
            message = save_chat_message(session_id, "bot", content, message_type)
            logger.info(f"Saved bot message to session {session_id}")
            return message
        except Exception as e:
            logger.error(f"Failed to save bot message to session {session_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to save bot message")
    
    @staticmethod
    def process_chat_message(session_id, user_id, prompt, rag_enabled=True, x_api_key=None, api_key_credits=None):
        """Process a chat message and generate AI response"""
        try:
            # Verify session belongs to user
            session = get_chat_session(session_id, user_id)
            if not session:
                raise HTTPException(status_code=404, detail="Chat session not found")
            
            # Save user message
            user_message = ChatService.save_user_message(session_id, user_id, prompt)
            
            # Generate AI response
            from pydantic import BaseModel
            
            class PromptRequest(BaseModel):
                prompt: str
                rag_enabled: bool = True
                session_id: int = None
            
            request = PromptRequest(prompt=prompt, rag_enabled=rag_enabled, session_id=session_id)
            
            # Get AI response
            ai_response = generate_response(request, x_api_key, api_key_credits)
            
            # Save bot response
            bot_message = ChatService.save_bot_message(session_id, ai_response['response'])
            
            return {
                "user_message": user_message,
                "bot_message": bot_message,
                "ai_response": ai_response
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to process chat message for session {session_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to process chat message")
    
    @staticmethod
    def update_session_title(session_id, user_id, title):
        """Update chat session title"""
        try:
            success = update_chat_session_title(session_id, user_id, title)
            if not success:
                raise HTTPException(status_code=404, detail="Chat session not found")
            return {"message": "Session title updated successfully"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to update session title for {session_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to update session title")
    
    @staticmethod
    def delete_session(session_id, user_id):
        """Delete a chat session"""
        try:
            success = delete_chat_session(session_id, user_id)
            if not success:
                raise HTTPException(status_code=404, detail="Chat session not found")
            return {"message": "Session deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to delete session {session_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to delete session")
    
    @staticmethod
    def get_session_context(session_id, user_id, last_messages=5):
        """Get recent messages from session for context"""
        try:
            messages = get_chat_messages(session_id, user_id, limit=last_messages, offset=0)
            
            # Format messages for context
            context = []
            for msg in messages[-last_messages:]:  # Get last N messages
                role = "Human" if msg['sender_type'] == 'user' else "Assistant"
                context.append(f"{role}: {msg['content']}")
            
            return "\n".join(context)
            
        except Exception as e:
            logger.error(f"Failed to get session context for {session_id}: {e}")
            return ""
