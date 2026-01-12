# Web Speech API - Quick Reference Card

## 🎤 User Guide

### How to Use Voice Input

```
1. Click microphone icon 🎤 in chat
2. Speak your message clearly
3. Stop talking
4. Message auto-sends ✅
```

### If It Doesn't Work

```
Browser Issues:
→ Using Firefox? Use Chrome or Edge
→ Safari? Limited support - try Chrome

Microphone Issues:
→ No permission? Check browser settings
→ Not found? Check device microphone
→ Not working? Try different browser

Accuracy Issues:
→ Wrong language selected? Change in Settings
→ Hard to understand? Speak more clearly
→ Too much noise? Find quieter location
```

## ⚙️ Developer Reference

### Setup

```bash
# No special setup needed!
# Web Speech API is built into modern browsers
npm install  # Standard install
npm run dev  # Standard dev
```

### Using the Hook

```javascript
import useWebSpeechAPI from "../../hooks/useWebSpeechAPI";

const MyComponent = () => {
  const {
    isListening, // Currently listening?
    transcript, // Recognized text
    isFinal, // Final result?
    error, // Error message?
    isSupported, // Browser supported?
    startListening, // Start listening
    stopListening, // Stop listening
    abort, // Abort recognition
  } = useWebSpeechAPI();

  return (
    <button onClick={() => (isListening ? stopListening() : startListening())}>
      {isListening ? "Stop" : "Start"} Listening
    </button>
  );
};
```

### Language Codes

```javascript
// Set in Settings → Interaction tab
"en-US"; // English (United States)
"en-GB"; // English (United Kingdom)
"ms-MY"; // Malay (Malaysia)
"es-ES"; // Spanish (Spain)
"fr-FR"; // French (France)
// See MDN for full list: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
```

### Adding New Language

```javascript
// Edit: frontend/src/components/settings/InteractionTab.jsx
<option value="ja-JP">日本語 (Japanese)</option>
<option value="de-DE">Deutsch (German)</option>
<option value="zh-CN">中文 (Chinese)</option>
```

## 🔧 Common Tasks

### Test if Supported

```javascript
const supported = window.SpeechRecognition || window.webkitSpeechRecognition;
console.log(supported ? "Supported" : "Not supported");
```

### Change Default Language

```javascript
// frontend/src/pages/user/Settings.jsx, line 36:
localStorage.getItem("voiceLanguage") || "en-US"; // Change 'en-US'
```

### Debug Issues

```javascript
// In browser console (F12)
window.SpeechRecognition || window.webkitSpeechRecognition; // Check support
localStorage.getItem("voiceLanguage"); // Check saved language
// Check for errors in useWebSpeechAPI hook
```

## 📊 File Structure

```
frontend/
├── hooks/
│   └── useWebSpeechAPI.js (NEW - 150 lines)
├── components/
│   └── chat/
│       ├── ChatInput.jsx (UPDATED - simplified)
│       ├── ChatBox.jsx (UPDATED - cleaned up)
│       └── VoiceInput.jsx (UPDATED - visual change)
└── pages/
    └── user/
        └── Settings.jsx (UPDATED - language codes)
```

## ⚡ Performance

| Metric              | Value                  |
| ------------------- | ---------------------- |
| Recognition Latency | <1 second              |
| Server Processing   | 0 (client-side)        |
| API Calls           | 0 (built-in)           |
| Bundle Size Impact  | +0 KB                  |
| Memory Usage        | ~5 MB during recording |

## 🌐 Browser Support

| Browser | Support    | Action          |
| ------- | ---------- | --------------- |
| Chrome  | ✅ Full    | Works perfectly |
| Edge    | ✅ Full    | Works perfectly |
| Opera   | ✅ Full    | Works perfectly |
| Safari  | ⚠️ Limited | Partial support |
| Firefox | ❌ None    | Show fallback   |
| IE      | ❌ None    | Show fallback   |

## 🐛 Error Codes

| Error           | Cause             | Fix              |
| --------------- | ----------------- | ---------------- |
| `no-speech`     | No sound detected | Speak louder     |
| `audio-capture` | Mic not found     | Check device     |
| `not-allowed`   | Permission denied | Allow in browser |
| `network`       | Network error     | Check connection |
| `aborted`       | User aborted      | Try again        |

## 📝 Documentation

- **Quick Start**: [WEB_SPEECH_API_QUICKSTART.md](WEB_SPEECH_API_QUICKSTART.md)
- **Migration**: [docs/guides/WEB_SPEECH_API_MIGRATION.md](docs/guides/WEB_SPEECH_API_MIGRATION.md)
- **Comparison**: [WEB_SPEECH_API_COMPARISON.md](WEB_SPEECH_API_COMPARISON.md)
- **Deployment**: [WEB_SPEECH_API_DEPLOYMENT.md](WEB_SPEECH_API_DEPLOYMENT.md)
- **Summary**: [WEB_SPEECH_API_SUMMARY.md](WEB_SPEECH_API_SUMMARY.md)

## 🎯 Best Practices

✅ **DO:**

- Test in Chrome/Edge first
- Use clear language code (e.g., 'ms-MY' not 'malay')
- Handle errors gracefully
- Show fallback for unsupported browsers
- Use localStorage for language preference

❌ **DON'T:**

- Force Web Speech API on unsupported browsers
- Rely on audio level data (not available)
- Use unsupported language codes
- Expect perfect accuracy in noisy environments
- Store audio on server

## 🚀 Quick Troubleshoot

```
Problem: Voice input not working
→ Check browser (Chrome/Edge recommended)
→ Check microphone permissions
→ Check microphone in System Settings
→ Try different browser

Problem: Wrong language recognition
→ Check Settings → Interaction
→ Select correct language
→ Try again

Problem: Slow recognition
→ Check internet connection
→ Try different browser
→ Use better microphone

Problem: "Not supported" message
→ Using Firefox? Try Chrome/Edge
→ Using Safari? Use Chrome/Edge
→ Check browser version (should be recent)
```

## 💡 Pro Tips

1. **Best Accuracy**: Speak naturally, as if texting a friend
2. **Better Results**: Use clear, standard pronunciation
3. **Faster Input**: Pause between sentences
4. **Multiple Languages**: Just change Settings before recording
5. **Background Noise**: Find quieter location for better accuracy

## 🔗 External Resources

- [MDN Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [SpeechRecognition API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [BCP 47 Language Tags](https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry)

---

**Last Updated**: January 2026  
**Status**: ✅ Production Ready  
**Maintenance**: Minimal (built-in API)
