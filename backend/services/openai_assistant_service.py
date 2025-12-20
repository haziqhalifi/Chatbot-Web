"""
OpenAI Assistant API Service
Handles communication with OpenAI's Assistant API for chat functionality
"""
from openai import OpenAI
from typing import Optional, Dict, Any, List
import logging
import time
import json
from config.settings import OPENAI_API_KEY, OPENAI_ASSISTANT_ID, OPENAI_ASSISTANT_ENABLED
from services.map_tools import MAP_TOOLS

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
            Dict containing response, map_commands, and metadata
        """
        start_time = time.time()
        
        try:
            # Add message to thread
            self.client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=message
            )
            
            # Run the assistant with map tools
            run = self.client.beta.threads.runs.create(
                thread_id=thread_id,
                assistant_id=self.assistant_id,
                tools=MAP_TOOLS
            )
            
            # Wait for completion and handle tool calls
            map_commands = []
            while run.status in ["queued", "in_progress", "requires_action"]:
                time.sleep(0.5)
                run = self.client.beta.threads.runs.retrieve(
                    thread_id=thread_id,
                    run_id=run.id
                )
                
                # Handle tool calls (map commands)
                if run.status == "requires_action":
                    tool_calls = run.required_action.submit_tool_outputs.tool_calls
                    tool_outputs = []
                    
                    for tool_call in tool_calls:
                        function_name = tool_call.function.name
                        function_args = json.loads(tool_call.function.arguments)
                        
                        # Store map command for frontend execution
                        map_commands.append({
                            "function": function_name,
                            "arguments": function_args,
                            "call_id": tool_call.id
                        })
                        
                        # Acknowledge tool call
                        tool_outputs.append({
                            "tool_call_id": tool_call.id,
                            "output": json.dumps({"status": "queued", "message": f"{function_name} command queued for execution"})
                        })
                    
                    # Submit tool outputs
                    if tool_outputs:
                        run = self.client.beta.threads.runs.submit_tool_outputs(
                            thread_id=thread_id,
                            run_id=run.id,
                            tool_outputs=tool_outputs
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
                    logger.info(f"OpenAI Assistant response generated in {duration:.2f}s with {len(map_commands)} map commands")
                    
                    return {
                        "response": message_content,
                        "map_commands": map_commands,
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
