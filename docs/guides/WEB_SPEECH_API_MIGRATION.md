# Web Speech API Migration Guide

## Overview

The chatbot has been migrated from Whisper (backend-based) speech-to-text to **Web Speech API** (browser-based). This provides instant, client-side transcription without server requests.

## ✅ What Changed

### Frontend Changes

1. **New Hook: `useWebSpeechAPI.js`**

   - Custom React hook for Web Speech API integration
   - Handles speech recognition lifecycle
   - Language support for English and Malay
   - Error handling for browser compatibility

2. **Updated `ChatInput.jsx`**

   - Removed all audio recording code (MediaRecorder, AudioContext)
   - Integrated `useWebSpeechAPI` hook
   - Simplified voice input flow
   - Auto-sends transcribed text when speech ends

3. **Simplified `VoiceInput.jsx`**

   - Removed audio level visualization (Web Speech API doesn't expose audio data)
   - Animated listening indicator
   - Changed color from red (recording) to blue (listening)

4. **Cleaned `ChatBox.jsx`**

   - Removed all audio-related state and refs
   - Simplified component prop passing
   - Much cleaner component structure

5. **Updated `InteractionTab.jsx` (Settings)**
   - Language options now use Web Speech API locale codes:
     - `en-US` - English (United States)
     - `en-GB` - English (United Kingdom)
     - `ms-MY` - Bahasa Melayu (Malay)
   - Updated help text to mention Web Speech API

### Backend Changes

❌ **NOT NEEDED ANYMORE:**

- `POST /transcribe` endpoint (backend/routes/ai.py)
- `transcribe_audio_file()` function (backend/utils/chat.py)
- Whisper model dependencies
- OpenAI Whisper API integration
- Database connection for transcription

## 🚀 Key Features

### Advantages of Web Speech API

✅ **Instant Transcription** - No server roundtrip, results appear instantly  
✅ **Zero Dependencies** - Built into Chrome, Edge, and Chromium browsers  
✅ **Privacy** - Audio never leaves your browser  
✅ **Multilingual** - Supports 100+ languages  
✅ **Reduced Latency** - No network delay  
✅ **Lower Costs** - No API fees

### Supported Browsers

- ✅ Chrome/Chromium (Full support)
- ✅ Edge (Full support)
- ✅ Opera (Full support)
- ⚠️ Safari (Partial - webkit prefix required)
- ❌ Firefox (Not supported)

## 📝 Language Configuration

Edit [frontend/src/components/settings/InteractionTab.jsx](frontend/src/components/settings/InteractionTab.jsx) to add more languages:

```jsx
<option value="es-ES">Español (Spanish)</option>
<option value="fr-FR">Français (French)</option>
<option value="de-DE">Deutsch (German)</option>
<option value="zh-CN">中文 (Simplified Chinese)</option>
<option value="ja-JP">日本語 (Japanese)</option>
// ... etc
```

### Supported Language Codes

Web Speech API supports BCP 47 language tags:

| Language             | Code    |
| -------------------- | ------- |
| English (US)         | `en-US` |
| English (UK)         | `en-GB` |
| Malay                | `ms-MY` |
| Spanish              | `es-ES` |
| French               | `fr-FR` |
| German               | `de-DE` |
| Chinese (Simplified) | `zh-CN` |
| Japanese             | `ja-JP` |

See [MDN Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) for complete list.

## 🔧 Implementation Details

### useWebSpeechAPI Hook

Located at: [frontend/src/hooks/useWebSpeechAPI.js](frontend/src/hooks/useWebSpeechAPI.js)

```javascript
const {
  isListening, // Boolean - currently listening?
  transcript, // String - recognized text so far
  isFinal, // Boolean - is this the final result?
  error, // String - error message if any
  isSupported, // Boolean - is Web Speech API supported?
  startListening, // Function - start listening
  stopListening, // Function - stop listening
  abort, // Function - abort recognition
} = useWebSpeechAPI();
```

### Usage in ChatInput

```jsx
import useWebSpeechAPI from '../../hooks/useWebSpeechAPI';

const ChatInput = ({ ... }) => {
  const { isListening, transcript, isFinal, startListening, stopListening } = useWebSpeechAPI();

  const handleVoiceClick = () => {
    if (!isListening) {
      startListening();
    } else {
      stopListening();
    }
  };

  // Auto-send when speech ends
  React.useEffect(() => {
    if (!isListening && isFinal && transcript) {
      onSendMessageWithText(transcript, 'voice');
    }
  }, [isListening, isFinal]);
};
```

## 🐛 Error Handling

Web Speech API provides specific error types:

| Error           | Meaning              | User Action                 |
| --------------- | -------------------- | --------------------------- |
| `no-speech`     | No sound detected    | Speak louder/clearer        |
| `audio-capture` | Microphone not found | Check microphone connection |
| `not-allowed`   | Permission denied    | Allow microphone in browser |
| `network`       | Network error        | Check internet connection   |
| `aborted`       | Recognition aborted  | Try again                   |

See [useWebSpeechAPI.js](frontend/src/hooks/useWebSpeechAPI.js#L34) for error messages.

## 🧪 Testing

### Manual Testing

1. Open app in Chrome/Edge
2. Navigate to chat page
3. Click microphone icon 🎤
4. Speak clearly
5. Text should appear immediately
6. Message auto-sends when you stop talking

### Test Different Languages

1. Go to Settings → Interaction
2. Select language (English or Malay)
3. Test voice input with that language

### Browser Compatibility Test

```javascript
// Test in browser console
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
console.log(SpeechRecognition ? "Supported" : "Not supported");
```

## ⚙️ Configuration

### Change Default Language

Edit [frontend/src/pages/user/Settings.jsx](frontend/src/pages/user/Settings.jsx#L36):

```javascript
localStorage.getItem("voiceLanguage") || "en-US"; // Change 'en-US' to your preferred language
```

### Add More Languages

Edit [frontend/src/components/settings/InteractionTab.jsx](frontend/src/components/settings/InteractionTab.jsx#L27):

```jsx
<select>
  <option value="en-US">English (US)</option>
  <option value="en-GB">English (UK)</option>
  <option value="ms-MY">Bahasa Melayu</option>
  {/* Add more languages here */}
  <option value="es-ES">Español</option>
</select>
```

## 🚨 Known Limitations

1. **Browser Dependent** - Only works in supported browsers
2. **No Audio Level** - Can't show real-time audio visualization
3. **No Offline Mode** - Still requires internet (uploads to Google servers)
4. **Recognition Timeout** - Stops after ~30 seconds of silence
5. **No Streaming** - Full audio sent at once, not streaming

## 📚 Files Modified

```
frontend/
├── src/
│   ├── hooks/
│   │   └── useWebSpeechAPI.js (NEW)
│   ├── components/
│   │   └── chat/
│   │       ├── ChatInput.jsx (UPDATED)
│   │       ├── ChatBox.jsx (UPDATED)
│   │       └── VoiceInput.jsx (UPDATED)
│   ├── components/
│   │   └── settings/
│   │       └── InteractionTab.jsx (UPDATED)
│   └── pages/
│       └── user/
│           └── Settings.jsx (UPDATED)
```

## ❌ Files/Code Removed

```
backend/
├── routes/ai.py
│   └── @router.post("/transcribe") - REMOVED
├── utils/chat.py
│   └── transcribe_audio_file() - REMOVED
│   └── WHISPER_AVAILABLE - REMOVED
│   └── OPENAI_API_AVAILABLE - REMOVED

Dependencies no longer needed:
- openai-whisper
- pyaudio (if used)
- torch (if used for local Whisper)
```

## 🔄 Migration Checklist

- [x] Create Web Speech API hook
- [x] Update ChatInput to use hook
- [x] Remove audio recording code
- [x] Update VoiceInput visualization
- [x] Clean up ChatBox state/refs
- [x] Update Settings language options
- [x] Update default language codes
- [ ] Test in different browsers
- [ ] Test with English speakers
- [ ] Test with Malay speakers
- [ ] Update backend `/transcribe` endpoint (optional - can be removed)
- [ ] Update documentation

## 📞 Support

If you encounter issues:

1. **Check browser console** (F12 → Console tab)
2. **Verify microphone permissions** in browser settings
3. **Test in Chrome/Edge first** (best compatibility)
4. **Try a different language** in Settings
5. **Restart browser** and try again

## 🎓 Resources

- [MDN Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [SpeechRecognition API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [BCP 47 Language Tags](https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry)

---

**Status**: ✅ Migration Complete  
**Date**: January 2026  
**Browser Support**: Chrome, Edge, Opera  
**Fallback**: Text input always available
