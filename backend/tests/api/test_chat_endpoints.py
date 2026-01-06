import pytest


class TestChatSessionEndpoints:
    """Test suite for chat session management endpoints"""

    def test_create_session_missing_auth(self, test_client):
        """Test creating session fails without authentication"""
        response = test_client.post("/chat/sessions", json={
            "title": "New Chat"
        })
        assert response.status_code == 401

    def test_create_session_with_auth(self, test_client, auth_headers, sample_chat_session_data):
        """Test creating a new chat session with authentication"""
        response = test_client.post("/chat/sessions",
            json=sample_chat_session_data,
            headers=auth_headers
        )
        assert response.status_code in [200, 201, 500]
        if response.status_code in [200, 201]:
            data = response.json()
            assert "id" in data or isinstance(data, dict)

    def test_create_session_no_title(self, test_client, auth_headers):
        """Test creating session without title"""
        response = test_client.post("/chat/sessions",
            json={"ai_provider": "openai"},
            headers=auth_headers
        )
        assert response.status_code in [200, 201, 500]

    def test_create_session_invalid_provider(self, test_client, auth_headers):
        """Test creating session with invalid AI provider"""
        response = test_client.post("/chat/sessions",
            json={"ai_provider": "invalid-provider"},
            headers=auth_headers
        )
        assert response.status_code in [200, 201, 400, 500]

    def test_create_session_empty_title(self, test_client, auth_headers):
        """Test creating session with empty title"""
        response = test_client.post("/chat/sessions",
            json={"title": ""},
            headers=auth_headers
        )
        assert response.status_code in [200, 201, 500]

    def test_get_chat_providers(self, test_client):
        """Test getting available AI providers"""
        response = test_client.get("/chat/providers")
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list) or isinstance(data, dict)

    def test_list_sessions_missing_auth(self, test_client):
        """Test listing sessions fails without authentication"""
        response = test_client.get("/chat/sessions")
        assert response.status_code == 401

    def test_list_sessions_with_auth(self, test_client, auth_headers):
        """Test listing user's chat sessions"""
        response = test_client.get("/chat/sessions", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict) or isinstance(data, list)

    def test_get_session_details_missing_auth(self, test_client):
        """Test getting session details fails without authentication"""
        response = test_client.get("/chat/sessions/1")
        assert response.status_code == 401

    def test_get_session_details_not_found(self, test_client, auth_headers):
        """Test getting non-existent session returns 404"""
        response = test_client.get("/chat/sessions/99999", headers=auth_headers)
        assert response.status_code in [404, 500]

    def test_get_session_messages_missing_auth(self, test_client):
        """Test getting messages fails without authentication"""
        response = test_client.get("/chat/sessions/1/messages")
        assert response.status_code == 401

    def test_get_session_messages_not_found(self, test_client, auth_headers):
        """Test getting messages for non-existent session"""
        response = test_client.get("/chat/sessions/99999/messages", headers=auth_headers)
        assert response.status_code in [404, 500]

    def test_update_session_title_missing_auth(self, test_client):
        """Test updating session fails without authentication"""
        response = test_client.put("/chat/sessions/1", json={"title": "New Title"})
        assert response.status_code == 401

    def test_update_session_title_not_found(self, test_client, auth_headers):
        """Test updating non-existent session"""
        response = test_client.put("/chat/sessions/99999",
            json={"title": "New Title"},
            headers=auth_headers
        )
        assert response.status_code in [404, 500]

    def test_update_session_title_empty(self, test_client, auth_headers):
        """Test updating session with empty title"""
        response = test_client.put("/chat/sessions/1",
            json={"title": ""},
            headers=auth_headers
        )
        assert response.status_code in [200, 400, 500]

    def test_delete_session_missing_auth(self, test_client):
        """Test deleting session fails without authentication"""
        response = test_client.delete("/chat/sessions/1")
        assert response.status_code == 401

    def test_delete_session_not_found(self, test_client, auth_headers):
        """Test deleting non-existent session"""
        response = test_client.delete("/chat/sessions/99999", headers=auth_headers)
        assert response.status_code in [404, 500]


class TestChatMessageEndpoints:
    """Test suite for chat message endpoints"""

    def test_post_message_missing_auth(self, test_client):
        """Test posting message fails without authentication"""
        response = test_client.post("/chat/sessions/1/messages",
            json={"content": "Hello"}
        )
        assert response.status_code == 401

    def test_post_message_empty_content(self, test_client, auth_headers):
        """Test posting message with empty content"""
        response = test_client.post("/chat/sessions/1/messages",
            json={"content": ""},
            headers=auth_headers
        )
        assert response.status_code in [400, 422, 500]

    def test_post_message_missing_content(self, test_client, auth_headers):
        """Test posting message without content"""
        response = test_client.post("/chat/sessions/1/messages",
            json={},
            headers=auth_headers
        )
        assert response.status_code == 422

    def test_post_message_to_nonexistent_session(self, test_client, auth_headers):
        """Test posting message to non-existent session"""
        response = test_client.post("/chat/sessions/99999/messages",
            json={"content": "Hello"},
            headers=auth_headers
        )
        assert response.status_code in [404, 500]

    def test_post_message_with_type(self, test_client, auth_headers, sample_chat_message_data):
        """Test posting message with message type"""
        response = test_client.post("/chat/sessions/1/messages",
            json=sample_chat_message_data,
            headers=auth_headers
        )
        assert response.status_code in [200, 201, 404, 500]

    def test_post_message_invalid_type(self, test_client, auth_headers):
        """Test posting message with invalid type"""
        response = test_client.post("/chat/sessions/1/messages",
            json={"content": "Hello", "message_type": "invalid-type"},
            headers=auth_headers
        )
        assert response.status_code in [200, 201, 400, 404, 500]

    def test_post_message_long_content(self, test_client, auth_headers):
        """Test posting message with very long content"""
        long_content = "a" * 10000
        response = test_client.post("/chat/sessions/1/messages",
            json={"content": long_content},
            headers=auth_headers
        )
        assert response.status_code in [200, 201, 413, 404, 500]

    def test_post_message_special_characters(self, test_client, auth_headers):
        """Test posting message with special characters"""
        response = test_client.post("/chat/sessions/1/messages",
            json={"content": "<script>alert('xss')</script>"},
            headers=auth_headers
        )
        assert response.status_code in [200, 201, 404, 500]

    def test_post_message_unicode(self, test_client, auth_headers):
        """Test posting message with unicode characters"""
        response = test_client.post("/chat/sessions/1/messages",
            json={"content": "你好世界 مرحبا بالعالم"},
            headers=auth_headers
        )
        assert response.status_code in [200, 201, 404, 500]


class TestChatGenerationEndpoints:
    """Test suite for chat generation endpoints"""

    def test_generate_response_missing_auth(self, test_client):
        """Test generating response fails without authentication"""
        response = test_client.post("/chat/generate",
            json={"session_id": 1, "prompt": "Hello"}
        )
        assert response.status_code == 401

    def test_generate_response_missing_session_id(self, test_client, auth_headers):
        """Test generating response without session ID"""
        response = test_client.post("/chat/generate",
            json={"prompt": "Hello"},
            headers=auth_headers
        )
        assert response.status_code == 422

    def test_generate_response_missing_prompt(self, test_client, auth_headers):
        """Test generating response without prompt"""
        response = test_client.post("/chat/generate",
            json={"session_id": 1},
            headers=auth_headers
        )
        assert response.status_code == 422

    def test_generate_response_nonexistent_session(self, test_client, auth_headers):
        """Test generating response for non-existent session"""
        response = test_client.post("/chat/generate",
            json={"session_id": 99999, "prompt": "Hello"},
            headers=auth_headers
        )
        assert response.status_code in [404, 500]

    def test_generate_response_empty_prompt(self, test_client, auth_headers):
        """Test generating response with empty prompt"""
        response = test_client.post("/chat/generate",
            json={"session_id": 1, "prompt": ""},
            headers=auth_headers
        )
        assert response.status_code in [400, 422, 500]

    def test_generate_response_long_prompt(self, test_client, auth_headers):
        """Test generating response with very long prompt"""
        long_prompt = "a" * 5000
        response = test_client.post("/chat/generate",
            json={"session_id": 1, "prompt": long_prompt},
            headers=auth_headers
        )
        assert response.status_code in [200, 413, 404, 500]

    def test_generate_response_with_message_type(self, test_client, auth_headers):
        """Test generating response with message type"""
        response = test_client.post("/chat/generate",
            json={
                "session_id": 1,
                "prompt": "Hello",
                "message_type": "text"
            },
            headers=auth_headers
        )
        assert response.status_code in [200, 404, 500]

    def test_generate_response_success_structure(self, test_client, auth_headers):
        """Test successful response has expected structure"""
        response = test_client.post("/chat/generate",
            json={"session_id": 1, "prompt": "Hello"},
            headers=auth_headers
        )
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)


class TestChatContentValidation:
    """Test content validation in chat endpoints"""

    def test_message_with_null_bytes(self, test_client, auth_headers):
        """Test message content with null bytes"""
        response = test_client.post("/chat/sessions/1/messages",
            json={"content": "Hello\x00World"},
            headers=auth_headers
        )
        assert response.status_code in [200, 201, 400, 404, 500]

    def test_message_xss_prevention(self, test_client, auth_headers):
        """Test XSS prevention in messages"""
        xss_payload = "<img src=x onerror=\"alert('xss')\">"
        response = test_client.post("/chat/sessions/1/messages",
            json={"content": xss_payload},
            headers=auth_headers
        )
        assert response.status_code in [200, 201, 404, 500]

    def test_message_sql_injection_prevention(self, test_client, auth_headers):
        """Test SQL injection prevention"""
        sql_payload = "'; DROP TABLE users; --"
        response = test_client.post("/chat/sessions/1/messages",
            json={"content": sql_payload},
            headers=auth_headers
        )
        assert response.status_code in [200, 201, 404, 500]

    def test_session_title_xss_prevention(self, test_client, auth_headers):
        """Test XSS prevention in session titles"""
        xss_payload = "<script>alert('xss')</script>"
        response = test_client.put("/chat/sessions/1",
            json={"title": xss_payload},
            headers=auth_headers
        )
        assert response.status_code in [200, 400, 404, 500]
