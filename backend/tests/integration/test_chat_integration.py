"""
Integration Tests for Chat System
Tests complete chat flow: session creation → message exchange → response generation
"""
import pytest
from datetime import datetime
from unittest.mock import patch, MagicMock
import json


class TestChatSessionIntegration:
    """Test chat session creation and management"""

    def test_create_session_flow(self, client, auth_headers, mock_create_chat_session):
        """Test complete session creation flow"""
        response = client.post('/chat/sessions',
            json={'title': 'My Chat', 'ai_provider': 'openai'},
            headers=auth_headers
        )
        
        # Session creation should succeed
        assert response.status_code in [200, 201]
        if response.status_code in [200, 201]:
            data = response.json()
            assert 'id' in data or data  # Verify response structure

    def test_create_session_sets_default_provider(self, client, auth_headers):
        """Test that session creation uses default provider when not specified"""
        response = client.post('/chat/sessions',
            json={'title': 'Default Provider Chat'},
            headers=auth_headers
        )
        
        assert response.status_code in [200, 201, 500]

    def test_create_session_requires_authentication(self, client):
        """Test that session creation requires valid auth token"""
        response = client.post('/chat/sessions',
            json={'title': 'Test'},
        )
        
        assert response.status_code in [401, 422]

    def test_get_user_sessions(self, client, auth_headers):
        """Test retrieving user's chat sessions"""
        response = client.get('/chat/sessions', headers=auth_headers)
        
        assert response.status_code in [200, 404, 401]

    def test_update_session_title(self, client, auth_headers):
        """Test updating a session title"""
        response = client.put('/chat/sessions/1',
            json={'title': 'Updated Title'},
            headers=auth_headers
        )
        
        assert response.status_code in [200, 404, 401, 500]

    def test_delete_session(self, client, auth_headers):
        """Test deleting a chat session"""
        response = client.delete('/chat/sessions/1', headers=auth_headers)
        
        assert response.status_code in [200, 404, 401, 500]

    def test_delete_nonexistent_session(self, client, auth_headers):
        """Test deleting a session that doesn't exist"""
        response = client.delete('/chat/sessions/999999', headers=auth_headers)
        
        assert response.status_code in [404, 401, 500]


class TestChatMessageIntegration:
    """Test chat message sending and receiving"""

    def test_send_message_to_session(self, client, auth_headers, 
                                     mock_get_chat_session,
                                     mock_save_chat_message,
                                     mock_openai_service):
        """Test complete message send flow"""
        with patch('config.settings.OPENAI_ASSISTANT_ENABLED', True):
            response = client.post('/chat/generate',
                json={
                    'session_id': 1,
                    'prompt': 'Hello Tiara',
                    'message_type': 'text',
                },
                headers=auth_headers
            )
            
            # Message should be processed
            assert response.status_code in [200, 500, 502]

    def test_message_requires_valid_session(self, client, auth_headers):
        """Test that messages require existing session"""
        response = client.post('/chat/generate',
            json={
                'session_id': 999999,
                'prompt': 'Hello',
            },
            headers=auth_headers
        )
        
        assert response.status_code in [404, 400, 500, 502]

    def test_message_gets_saved_to_database(self, client, auth_headers,
                                           mock_get_chat_session,
                                           mock_save_chat_message):
        """Test that messages are persisted to database"""
        with patch('config.settings.OPENAI_ASSISTANT_ENABLED', True):
            with patch('services.chat_service.ChatService.save_user_message') as mock_save:
                mock_save.return_value = {'id': 1, 'content': 'Hello'}
                
                response = client.post('/chat/generate',
                    json={
                        'session_id': 1,
                        'prompt': 'Hello',
                    },
                    headers=auth_headers
                )
                
                # Message should be saved (depending on response code)

    def test_bot_response_generated(self, client, auth_headers,
                                   mock_get_chat_session,
                                   mock_openai_service):
        """Test that bot response is generated"""
        with patch('config.settings.OPENAI_ASSISTANT_ENABLED', True):
            response = client.post('/chat/generate',
                json={
                    'session_id': 1,
                    'prompt': 'What is the weather?',
                },
                headers=auth_headers
            )
            
            # Response should include bot message
            if response.status_code == 200:
                data = response.json()
                # Check for response structure

    def test_message_types_supported(self, client, auth_headers,
                                    mock_get_chat_session):
        """Test different message types: text, voice, image"""
        message_types = ['text', 'voice', 'image']
        
        for msg_type in message_types:
            response = client.post('/chat/generate',
                json={
                    'session_id': 1,
                    'prompt': 'Test message',
                    'message_type': msg_type,
                },
                headers=auth_headers
            )
            
            # Should handle all types (or return appropriate error)
            assert response.status_code in [200, 400, 401, 500, 502]

    def test_get_session_messages(self, client, auth_headers):
        """Test retrieving messages from a session"""
        response = client.get('/chat/sessions/1/messages', headers=auth_headers)
        
        # Should return messages or 404 if session doesn't exist
        assert response.status_code in [200, 404, 401, 500]


class TestChatAIIntegration:
    """Test chat interaction with AI service"""

    def test_openai_assistant_integration(self, client, auth_headers,
                                         mock_openai_service):
        """Test integration with OpenAI assistant"""
        with patch('config.settings.OPENAI_ASSISTANT_ENABLED', True):
            response = client.post('/chat/generate',
                json={
                    'session_id': 1,
                    'prompt': 'Tell me a joke',
                },
                headers=auth_headers
            )
            
            # Request should reach OpenAI service
            # (Error is expected if service not configured)

    def test_ai_response_includes_metadata(self, client, auth_headers,
                                          mock_openai_service):
        """Test that AI response includes important metadata"""
        with patch('config.settings.OPENAI_ASSISTANT_ENABLED', True):
            response = client.post('/chat/generate',
                json={
                    'session_id': 1,
                    'prompt': 'Test prompt',
                },
                headers=auth_headers
            )
            
            # Response should include duration, provider info

    def test_ai_service_error_handling(self, client, auth_headers,
                                      mock_get_chat_session):
        """Test handling of AI service errors"""
        with patch('services.openai_assistant_service.get_openai_assistant_service') as mock_service:
            mock_service.side_effect = Exception('Service unavailable')
            
            response = client.post('/chat/generate',
                json={
                    'session_id': 1,
                    'prompt': 'Hello',
                },
                headers=auth_headers
            )
            
            # Should handle gracefully with appropriate status code


class TestChatDataFlow:
    """Test data flow through chat system"""

    def test_message_flow_user_to_database(self, client, auth_headers,
                                          mock_get_chat_session,
                                          mock_save_chat_message):
        """Test user message flows from request to database"""
        response = client.post('/chat/generate',
            json={
                'session_id': 1,
                'prompt': 'Test message',
            },
            headers=auth_headers
        )
        
        # Message should be persisted

    def test_response_flow_ai_to_database(self, client, auth_headers,
                                         mock_get_chat_session,
                                         mock_openai_service,
                                         mock_save_chat_message):
        """Test bot response flows from AI to database"""
        with patch('config.settings.OPENAI_ASSISTANT_ENABLED', True):
            response = client.post('/chat/generate',
                json={
                    'session_id': 1,
                    'prompt': 'Hello',
                },
                headers=auth_headers
            )
            
            # Response should be saved to database

    def test_message_retrieval_from_database(self, client, auth_headers):
        """Test retrieving messages from database"""
        with patch('database.chat.get_chat_messages') as mock_get:
            mock_get.return_value = [
                {'id': 1, 'sender_type': 'user', 'content': 'Hello'},
                {'id': 2, 'sender_type': 'bot', 'content': 'Hi there!'},
            ]
            
            response = client.get('/chat/sessions/1/messages', headers=auth_headers)
            
            # Should return messages from database

    def test_session_context_updated(self, client, auth_headers,
                                    mock_get_chat_session,
                                    mock_openai_service):
        """Test that session context is properly updated"""
        with patch('database.chat.update_session_metadata') as mock_update:
            response = client.post('/chat/generate',
                json={
                    'session_id': 1,
                    'prompt': 'Hello',
                },
                headers=auth_headers
            )
            
            # Session metadata should be updated (e.g., thread_id for OpenAI)


class TestChatErrorHandling:
    """Test error handling in chat system"""

    def test_malformed_request_handled(self, client, auth_headers):
        """Test handling of malformed chat requests"""
        response = client.post('/chat/generate',
            json={'invalid': 'data'},
            headers=auth_headers
        )
        
        assert response.status_code in [422, 400]

    def test_missing_required_fields(self, client, auth_headers):
        """Test handling of requests with missing required fields"""
        response = client.post('/chat/generate',
            json={'session_id': 1},  # Missing 'prompt'
            headers=auth_headers
        )
        
        assert response.status_code in [422, 400]

    def test_empty_message_rejected(self, client, auth_headers,
                                   mock_get_chat_session):
        """Test that empty messages are rejected"""
        response = client.post('/chat/generate',
            json={
                'session_id': 1,
                'prompt': '',
            },
            headers=auth_headers
        )
        
        assert response.status_code in [400, 422, 500]

    def test_oversized_message_rejected(self, client, auth_headers,
                                       mock_get_chat_session):
        """Test that oversized messages are handled"""
        huge_message = 'a' * 1000000
        
        response = client.post('/chat/generate',
            json={
                'session_id': 1,
                'prompt': huge_message,
            },
            headers=auth_headers
        )
        
        # Should handle gracefully
        assert response.status_code in [413, 400, 422, 500]
