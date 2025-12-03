# OpenAI Assistant API Integration Guide

## Overview

This chatbot now supports **dual AI providers**, allowing users to choose between:

- **Gemini/Ollama** (Local AI with RAG support)
- **ChatGPT/OpenAI Assistant** (Cloud-based AI)

## Features

### 1. Multiple AI Provider Support

- Users can select their preferred AI provider when creating a chat session
- Each session maintains its own AI provider throughout its lifetime
- Seamless switching between providers for different conversations

### 2. Provider Options

#### Gemini/Ollama Provider

- **Type**: Local AI model
- **Features**:
  - RAG (Retrieval-Augmented Generation) support
  - Document context integration
  - Faster for general queries
  - No internet required for inference
- **Best for**: Document-based queries, privacy-sensitive conversations

#### OpenAI Assistant Provider

- **Type**: Cloud-based AI (ChatGPT)
- **Features**:
  - Advanced conversational AI
  - Built-in context management via threads
  - Superior natural language understanding
  - Continuous conversation memory
- **Best for**: Complex reasoning, creative tasks, general conversations

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# OpenAI Assistant API Configuration
OPENAI_API_KEY=sk-proj-your-api-key-here
OPENAI_ASSISTANT_ID=asst_your-assistant-id-here
```

### Current Configuration

The production system should load these values from environment variables only. Do not commit real credentials to source control.

- **API Key**: `OPENAI_API_KEY`
- **Assistant ID**: `OPENAI_ASSISTANT_ID`

## API Usage

### 1. Get Available Providers

```http
GET /chat/providers
```

**Response:**

```json
{
  "providers": ["gemini", "openai"],
  "default": "gemini",
  "descriptions": {
    "gemini": "Gemini/Ollama - Local AI model with RAG support",
    "openai": "ChatGPT (OpenAI Assistant) - Cloud-based AI assistant"
  }
}
```

### 2. Create Chat Session with AI Provider

```http
POST /chat/sessions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "My Chat Session",
  "ai_provider": "openai"  // or "gemini"
}
```

**Response:**

```json
{
  "id": 1,
  "user_id": 123,
  "title": "My Chat Session",
  "ai_provider": "openai",
  "created_at": "2025-11-07T10:30:00",
  "updated_at": "2025-11-07T10:30:00",
  "is_active": true
}
```

### 3. Send Message (Works with Both Providers)

```http
POST /chat/generate
Authorization: Bearer <jwt_token>
X-API-Key: <your_api_key>
Content-Type: application/json

{
  "session_id": 1,
  "prompt": "What is climate change?",
  "rag_enabled": true,
  "message_type": "text"
}
```

**Response:**

```json
{
  "user_message": {
    "id": 1,
    "session_id": 1,
    "sender_type": "user",
    "content": "What is climate change?",
    "timestamp": "2025-11-07T10:31:00"
  },
  "bot_message": {
    "id": 2,
    "session_id": 1,
    "sender_type": "bot",
    "content": "Climate change refers to...",
    "timestamp": "2025-11-07T10:31:05"
  },
  "ai_response": {
    "response": "Climate change refers to...",
    "provider": "openai",
    "duration": 2.3
  },
  "processing_time": 2.5
}
```

### 4. Get Session Details

```http
GET /chat/sessions/{session_id}
Authorization: Bearer <jwt_token>
```

**Response includes:**

```json
{
  "id": 1,
  "user_id": 123,
  "title": "My Chat Session",
  "ai_provider": "openai",
  "metadata": {
    "openai_thread_id": "thread_abc123xyz"
  },
  "openai_thread_id": "thread_abc123xyz",
  "created_at": "2025-11-07T10:30:00",
  "updated_at": "2025-11-07T10:31:05",
  "is_active": true
}
```

## Database Schema Changes

### Chat Sessions Table

New columns added:

- `ai_provider` (VARCHAR(50)): Stores the AI provider ("gemini" or "openai")
- `metadata` (NVARCHAR(MAX)): JSON field for storing provider-specific data (e.g., OpenAI thread IDs)

```sql
ALTER TABLE chat_sessions ADD ai_provider VARCHAR(50) DEFAULT 'gemini';
ALTER TABLE chat_sessions ADD metadata NVARCHAR(MAX);
```

## Architecture

### Request Flow

1. **User creates a session** → Select AI provider
2. **Session stored** → Provider info saved in database
3. **User sends message** → System routes to appropriate provider
4. **Provider processes** → Response generated
5. **Response saved** → Message stored in database with metadata

### OpenAI Assistant Flow

1. **First message**: Creates OpenAI thread, stores thread_id in session metadata
2. **Subsequent messages**: Reuses existing thread for conversation continuity
3. **RAG integration**: Context injected into user message before sending to OpenAI
4. **Response streaming**: Currently synchronous, but can be upgraded to streaming

### Provider Routing Logic

```python
# In chat_service.py
if ai_provider == "openai":
    # Use OpenAI Assistant API
    openai_service = get_openai_assistant_service()
    ai_response = openai_service.generate_response(...)
else:
    # Use Gemini/Ollama
    ai_response = generate_response(...)
```

## Frontend Integration

### Example: Chat Session Creation

```javascript
// Get available providers
const providersResponse = await fetch("/chat/providers");
const { providers, descriptions } = await providersResponse.json();

// Display provider selection to user
// Then create session with selected provider
const createSessionResponse = await fetch("/chat/sessions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "New Chat",
    ai_provider: "openai", // or 'gemini'
  }),
});
```

### Example: Sending Messages

```javascript
// Send message (same API regardless of provider)
const response = await fetch("/chat/generate", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "X-API-Key": apiKey,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    session_id: sessionId,
    prompt: userMessage,
    rag_enabled: true,
  }),
});

const data = await response.json();
console.log(
  `Response from ${data.ai_response.provider}:`,
  data.bot_message.content
);
```

## Testing

### Test OpenAI Provider

```bash
# Create session with OpenAI
curl -X POST http://localhost:8000/chat/sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "OpenAI Test", "ai_provider": "openai"}'

# Send message
curl -X POST http://localhost:8000/chat/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": 1,
    "prompt": "Tell me about disaster management",
    "rag_enabled": true
  }'
```

### Test Gemini Provider

```bash
# Create session with Gemini (default)
curl -X POST http://localhost:8000/chat/sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Gemini Test", "ai_provider": "gemini"}'

# Send message (same API)
curl -X POST http://localhost:8000/chat/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": 2,
    "prompt": "What are the types of disasters?",
    "rag_enabled": true
  }'
```

## Performance Considerations

### OpenAI Assistant

- **Latency**: ~1-3 seconds (network dependent)
- **Cost**: Pay-per-token usage
- **Rate limits**: Based on OpenAI account tier
- **Thread management**: Automatic conversation context

### Gemini/Ollama

- **Latency**: ~0.5-2 seconds (hardware dependent)
- **Cost**: Free (local execution)
- **Rate limits**: None (local)
- **Context**: Manual RAG implementation

## Security

### API Key Protection

- OpenAI API key stored in environment variables
- Never exposed to frontend
- Server-side validation only

### Thread Management

- Thread IDs stored securely in database
- Accessible only to session owner
- Automatic cleanup on session deletion

## Troubleshooting

### OpenAI API Issues

**Problem**: "Invalid API Key" error

```
Solution: Verify OPENAI_API_KEY in .env file
```

**Problem**: "Assistant not found" error

```
Solution: Verify OPENAI_ASSISTANT_ID in .env file
Check assistant exists in OpenAI dashboard
```

**Problem**: Slow responses

```
Solution: Check internet connection
Consider using Gemini for faster local responses
```

### Database Migration Issues

**Problem**: "Invalid column name 'ai_provider'"

```sql
Solution: Run database migration
ALTER TABLE chat_sessions ADD ai_provider VARCHAR(50) DEFAULT 'gemini';
ALTER TABLE chat_sessions ADD metadata NVARCHAR(MAX);
```

## Future Enhancements

1. **Streaming Responses**: Implement Server-Sent Events for real-time streaming
2. **Provider Stats**: Track usage and performance metrics per provider
3. **Custom Assistants**: Allow users to create custom OpenAI assistants
4. **Hybrid Mode**: Combine both providers for enhanced responses
5. **Cost Tracking**: Monitor OpenAI API usage and costs per user
6. **Provider Switching**: Allow mid-conversation provider changes
7. **Fine-tuning**: Support custom fine-tuned models for both providers

## API Reference Summary

| Endpoint                       | Method | Description                                    |
| ------------------------------ | ------ | ---------------------------------------------- |
| `/chat/providers`              | GET    | Get available AI providers                     |
| `/chat/sessions`               | POST   | Create chat session with provider              |
| `/chat/sessions`               | GET    | List user's chat sessions                      |
| `/chat/sessions/{id}`          | GET    | Get session details (includes provider)        |
| `/chat/sessions/{id}/messages` | GET    | Get session messages                           |
| `/chat/generate`               | POST   | Generate AI response (auto-routes to provider) |
| `/chat/sessions/{id}`          | PUT    | Update session title                           |
| `/chat/sessions/{id}`          | DELETE | Delete session                                 |

## Support

For issues or questions:

1. Check this guide first
2. Review backend logs for error messages
3. Verify environment variables are set correctly
4. Test with both providers to isolate provider-specific issues
5. Check OpenAI dashboard for API usage and limits

---

**Last Updated**: November 7, 2025
**Version**: 1.0.0
