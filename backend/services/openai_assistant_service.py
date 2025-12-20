"""
OpenAI Assistant API Service
Handles communication with OpenAI's Assistant API for chat functionality
"""
from openai import OpenAI
from typing import Optional, Dict, Any
import logging
import time
from config.settings import OPENAI_API_KEY, OPENAI_ASSISTANT_ID, OPENAI_ASSISTANT_ENABLED

logger = logging.getLogger(__name__)


class OpenAIAssistantService:
    """Service for interacting with OpenAI Assistant API"""
    
    def __init__(self):
        """Initialize OpenAI client"""
        if not OPENAI_ASSISTANT_ENABLED:
            raise ValueError("OpenAI Assistant is not configured. Set OPENAI_API_KEY and OPENAI_ASSISTANT_ID environment variables.")

        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.assistant_id = OPENAI_ASSISTANT_ID
        logger.info("OpenAI Assistant Service initialized.")
    
    def create_thread(self) -> str:
        """
        Create a new conversation thread
        Returns: thread_id (str)
        """
        try:
            thread = self.client.beta.threads.create()
            logger.info(f"Created new OpenAI thread: {thread.id}")
            return thread.id
        except Exception as e:
            logger.error(f"Error creating OpenAI thread: {e}")
            raise
    
    def send_message(
        self, 
        thread_id: str, 
        message: str
    ) -> Dict[str, Any]:
        """
        Send a message to the assistant and get response
        
        Args:
            thread_id: The OpenAI thread ID
            message: User's message
            
        Returns:
            Dict containing response and metadata
        """
        start_time = time.time()
        
        try:
            # Add message to thread
            self.client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=message
            )
            
            # Run the assistant
            run = self.client.beta.threads.runs.create(
                thread_id=thread_id,
                assistant_id=self.assistant_id
            )
            
            # Wait for completion
            while run.status in ["queued", "in_progress"]:
                time.sleep(0.5)
                run = self.client.beta.threads.runs.retrieve(
                    thread_id=thread_id,
                    run_id=run.id
                )
            
            if run.status == "completed":
                # Retrieve the assistant's messages
                messages = self.client.beta.threads.messages.list(
                    thread_id=thread_id,
                    order="desc",
                    limit=1
                )
                
                # Get the latest message content
                if messages.data:
                    message_content = messages.data[0].content[0].text.value
                    
                    duration = time.time() - start_time
                    logger.info(f"OpenAI Assistant response generated in {duration:.2f}s")
                    
                    return {
                        "response": message_content,
                        "thread_id": thread_id,
                        "provider": "openai",
                        "duration": duration,
                        "status": "success"
                    }
                else:
                    raise Exception("No response from assistant")
            else:
                raise Exception(f"Run failed with status: {run.status}")
                
        except Exception as e:
            logger.error(f"Error getting OpenAI Assistant response: {e}")
            raise
    
    def get_or_create_thread(self, existing_thread_id: Optional[str] = None) -> str:
        """
        Get existing thread or create new one
        
        Args:
            existing_thread_id: Optional existing thread ID
            
        Returns:
            thread_id (str)
        """
        if existing_thread_id:
            try:
                # Verify thread exists
                self.client.beta.threads.retrieve(existing_thread_id)
                logger.info(f"Using existing thread: {existing_thread_id}")
                return existing_thread_id
            except Exception as e:
                logger.warning(f"Thread {existing_thread_id} not found, creating new: {e}")
        
        return self.create_thread()
    
    def generate_response(
        self, 
        prompt: str, 
        thread_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a response using OpenAI Assistant
        
        Args:
            prompt: User's prompt/question
            thread_id: Optional existing thread ID for conversation continuity
            
        Returns:
            Dict with response and metadata
        """
        try:
            # Get or create thread
            thread = self.get_or_create_thread(thread_id)
            
            # Send message and get response
            result = self.send_message(thread, prompt)
            
            return result
            
        except Exception as e:
            logger.error(f"Error in generate_response: {e}")
            raise


# Singleton instance
_openai_service = None

def get_openai_assistant_service() -> OpenAIAssistantService:
    """Get singleton instance of OpenAI Assistant Service"""
    global _openai_service
    if _openai_service is None:
        _openai_service = OpenAIAssistantService()
    return _openai_service
