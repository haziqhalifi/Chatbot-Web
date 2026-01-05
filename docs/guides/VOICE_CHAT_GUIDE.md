# Voice Chat Setup Guide (Malay & English)

## Overview

The voice chat feature now supports **Malay (Bahasa Melayu)** and **English** with two transcription methods:

1. **OpenAI Whisper API** (Recommended) - Cloud-based, better accuracy for Malay
2. **Local Whisper Model** - Free, runs on your server, no API calls

## 🔧 Configuration

### Method 1: OpenAI Whisper API (Recommended for Malay)

**Advantages:**

- ✅ Better accuracy for Malay language
- ✅ Faster transcription
- ✅ No GPU required
- ✅ Automatic language detection
- ✅ Better handling of code-switching (Malay-English mix)

**Setup:**

1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Add to your `.env` file:
   ```env
   OPENAI_API_KEY=sk-your-api-key-here
   ```
3. Restart the backend server

**Cost:** ~$0.006 per minute of audio (very affordable)

### Method 2: Local Whisper Model (Free)

**Advantages:**

- ✅ Free (no API costs)
- ✅ Works offline
- ✅ Privacy (audio stays on your server)

**Disadvantages:**

- ❌ Slower transcription
- ❌ Less accurate for Malay
- ❌ Requires more server resources

**Setup:**
Already installed! The `openai-whisper` package is configured.

## 📱 How to Use Voice Chat

### For Users:

1. **Enable Voice Input:**

   - Go to Settings → Interaction tab
   - Turn ON "Voice Input"

2. **Select Language:**

   - In Settings → Interaction tab
   - Choose "Voice Input Language":
     - **Auto-detect** - Automatically detects Malay or English (recommended)
     - **Bahasa Melayu (Malay)** - Force Malay recognition
     - **English** - Force English recognition

3. **Record Voice Message:**
   - Click the microphone icon 🎤 in chat
   - Speak your message
   - Click again to stop and send

### Language Tips:

- **Auto-detect** works well for both languages and code-switching
- Use **Bahasa Melayu** if you're only speaking Malay for better accuracy
- Use **English** if you're only speaking English for better accuracy

## 🔍 How It Works

1. User clicks microphone → Browser records audio
2. Audio sent to `/transcribe` endpoint
3. Backend automatically chooses best method:
   - If OpenAI API key exists → Use OpenAI Whisper API
   - Otherwise → Use local Whisper model
4. Text is returned and sent to chatbot

## 🛠️ Technical Details

### Backend Code Changes:

- Fixed Whisper import (was using wrong package)
- Added OpenAI Whisper API support
- Added language parameter support
- Improved error handling

### Frontend Code Changes:

- Added language selection in Settings
- Stores user preference in localStorage
- Sends language parameter with transcription request
- Better error messages

### Supported Languages:

- Malay (ms)
- English (en)
- Auto-detection (auto)

## 🐛 Troubleshooting

### "Audio transcription is not available"

**Solution:** Make sure you have either:

- OpenAI API key configured in `.env`, OR
- Local Whisper installed: `pip install openai-whisper`

### "Voice transcription failed"

**Possible causes:**

1. Microphone permission denied in browser
2. Audio format not supported
3. Network issues (for OpenAI API)

**Solutions:**

1. Allow microphone access in browser
2. Check browser console for errors
3. Check backend logs for detailed error messages

### Poor Malay Recognition

**Solutions:**

1. Use OpenAI Whisper API (better for Malay)
2. Select "Bahasa Melayu" instead of "Auto-detect"
3. Speak clearly and at moderate pace
4. Check microphone quality

### Slow Transcription

**If using local Whisper:**

- Consider upgrading to OpenAI API
- Use smaller model: Change `"base"` to `"tiny"` in code (faster but less accurate)

**If using OpenAI API:**

- Check internet connection
- Check OpenAI API status

## 📊 Performance Comparison

| Feature          | OpenAI API  | Local Whisper |
| ---------------- | ----------- | ------------- |
| Malay Accuracy   | ⭐⭐⭐⭐⭐  | ⭐⭐⭐        |
| English Accuracy | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐      |
| Speed            | ⚡⚡⚡ Fast | 🐌 Slow       |
| Cost             | ~$0.006/min | Free          |
| Privacy          | Cloud       | Local         |
| Setup            | Easy        | Easy          |

## 🔐 Security & Privacy

### OpenAI API:

- Audio is sent to OpenAI servers for transcription
- OpenAI retains data for 30 days (as per their policy)
- Audio is NOT used to train models

### Local Whisper:

- Audio never leaves your server
- 100% private
- Temporary audio files are deleted immediately after transcription

## 📝 Configuration Files Modified

1. **backend/utils/chat.py** - Core transcription logic
2. **backend/routes/ai.py** - API endpoint
3. **backend/requirements.txt** - Dependencies
4. **frontend/src/components/chat/ChatInput.jsx** - Voice recording
5. **frontend/src/pages/Settings.jsx** - Language selection

## 🚀 Next Steps

1. **Test voice chat** with both Malay and English
2. **Configure OpenAI API** for better Malay support (optional)
3. **Adjust language settings** based on your users' needs

## 💡 Recommendations

For **best Malay language support:**

1. ✅ Use OpenAI Whisper API
2. ✅ Set language to "Auto-detect" or "Bahasa Melayu"
3. ✅ Ensure good microphone quality
4. ✅ Test with different accents and dialects

For **privacy-focused deployment:**

1. ✅ Use local Whisper model
2. ✅ Accept slightly lower accuracy
3. ✅ Consider upgrading to better hardware for faster processing

## 📞 Support

If you encounter issues:

1. Check browser console (F12)
2. Check backend logs
3. Verify OpenAI API key (if using API)
4. Test with English first, then Malay
5. Try different browsers (Chrome recommended)

---

**Status:** ✅ Voice chat is now functional with Malay and English support!
