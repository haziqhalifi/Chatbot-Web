# OpenAI Assistant Integration - Quick Start

## What's New? 🎉

Your chatbot now supports **TWO AI providers**:

1. **Gemini/Ollama** - Your existing local AI (default)
2. **ChatGPT (OpenAI Assistant)** - NEW! Cloud-based AI with advanced capabilities

Users can now choose which AI they want to chat with!

---

## Quick Setup (3 Steps)

### Step 1: Run Setup Script

```bash
cd "c:\Users\user\Desktop\Chatbot Web"
setup_openai.bat
```

This will:

- Install/upgrade the OpenAI package
- Run database migrations
- Verify setup

### Step 2: Verify Configuration

Check that `backend\.env` contains:

```env
OPENAI_API_KEY=your-openai-api-key
OPENAI_ASSISTANT_ID=your-openai-assistant-id
```

✓ Provide your own credentials before running in production.

### Step 3: Test It

```bash
cd backend
python test_openai_integration.py
```

This will test:

- Configuration ✓
- Database schema ✓
- OpenAI connection ✓
- Service integration ✓

---

## How to Use

### For Frontend Developers

#### 1. Get Available Providers

```javascript
const response = await fetch("/chat/providers");
const data = await response.json();

console.log(data);
// {
//   "providers": ["gemini", "openai"],
//   "default": "gemini",
//   "descriptions": {
//     "gemini": "Gemini/Ollama - Local AI model with RAG support",
//     "openai": "ChatGPT (OpenAI Assistant) - Cloud-based AI assistant"
//   }
// }
```

#### 2. Create Session with Provider Selection

```javascript
// Let user choose provider
const provider = userSelectedProvider; // "gemini" or "openai"

const response = await fetch("/chat/sessions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "New Chat",
    ai_provider: provider, // <-- NEW parameter!
  }),
});

const session = await response.json();
console.log(`Created ${session.ai_provider} chat session`);
```

#### 3. Send Messages (No Changes Needed!)

The existing message API works for both providers:

```javascript
const response = await fetch("/chat/generate", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "X-API-Key": apiKey,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    session_id: sessionId,
    prompt: message,
    rag_enabled: true,
  }),
});

const data = await response.json();
console.log(`Response from ${data.ai_response.provider}`);
// Provider will be "gemini" or "openai" based on session
```

### Example UI Implementation

```javascript
// When creating a new chat, show provider selection
<select id="aiProvider">
  <option value="gemini">Gemini (Local, Fast)</option>
  <option value="openai">ChatGPT (Advanced)</option>
</select>

// When session is active, show which provider is being used
<div class="provider-badge">
  Using: {session.ai_provider === 'openai' ? '🤖 ChatGPT' : '💎 Gemini'}
</div>
```

---

## API Changes Summary

### New Endpoint

```
GET /chat/providers
```

Returns list of available AI providers.

### Modified Endpoint

```
POST /chat/sessions
```

**New optional parameter**: `ai_provider`

**Before:**

```json
{
  "title": "My Chat"
}
```

**Now:**

```json
{
  "title": "My Chat",
  "ai_provider": "openai" // Optional, defaults to "gemini"
}
```

### All Other Endpoints

**No changes!** Everything works exactly as before.

---

## Database Changes

The `chat_sessions` table now has:

- `ai_provider` column - Stores which AI is used ("gemini" or "openai")
- `metadata` column - Stores provider-specific data (like OpenAI thread IDs)

**Migration is automatic** when you run the setup script.

---

## Features by Provider

| Feature              | Gemini/Ollama | OpenAI Assistant    |
| -------------------- | ------------- | ------------------- |
| Local execution      | ✓             | ✗                   |
| RAG support          | ✓             | ✓ (injected)        |
| Internet required    | ✗             | ✓                   |
| Cost                 | Free          | Pay per use         |
| Response time        | 0.5-2s        | 1-3s                |
| Context memory       | Manual        | Automatic (threads) |
| Document queries     | Excellent     | Good                |
| General conversation | Good          | Excellent           |
| Creative tasks       | Good          | Excellent           |

---

## Testing

### Manual Test

1. Start backend server:

```bash
cd backend
python main.py
```

2. Create Gemini session:

```bash
curl -X POST http://localhost:8000/chat/sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Gemini Test", "ai_provider": "gemini"}'
```

3. Create OpenAI session:

```bash
curl -X POST http://localhost:8000/chat/sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "ChatGPT Test", "ai_provider": "openai"}'
```

4. Send messages to both and compare!

---

## Troubleshooting

### "Import openai could not be resolved"

**Solution:**

```bash
pip install --upgrade openai
```

### "Invalid API Key" error

**Solution:** Check `backend\.env` has the correct `OPENAI_API_KEY`

### "ai_provider column missing"

**Solution:** Run database migration:

```bash
cd backend
python -c "from database.schema import update_database_schema; update_database_schema()"
```

### OpenAI requests timing out

**Solution:** Check internet connection. Use Gemini as fallback.

---

## Files Changed

### New Files

- `backend/services/openai_assistant_service.py` - OpenAI integration service
- `backend/test_openai_integration.py` - Integration test script
- `setup_openai.bat` - Setup automation script
- `OPENAI_ASSISTANT_GUIDE.md` - Detailed documentation
- `OPENAI_QUICKSTART.md` - This file

### Modified Files

- `backend/config/settings.py` - Added OpenAI config
- `backend/services/chat_service.py` - Added provider routing
- `backend/database/chat.py` - Added provider tracking
- `backend/routes/chat.py` - Added provider parameter
- `backend/.env` - Added OpenAI credentials

---

## Next Steps

1. ✓ Run setup script
2. ✓ Test integration
3. Update frontend to show provider selection
4. Add provider badges/indicators in chat UI
5. Consider adding usage analytics

---

## Support

For detailed documentation, see:

- **OPENAI_ASSISTANT_GUIDE.md** - Complete technical guide
- **API_KEY_GUIDE.md** - API key management
- **TESTING_GUIDE.md** - Testing procedures

For questions or issues:

1. Check this quickstart first
2. Review detailed guide
3. Run test script for diagnostics
4. Check backend logs

---

**Version**: 1.0.0  
**Date**: November 7, 2025  
**Status**: ✅ Ready to use
