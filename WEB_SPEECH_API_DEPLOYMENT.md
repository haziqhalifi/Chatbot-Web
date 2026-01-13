# Web Speech API Setup & Deployment Guide

## ✅ Implementation Status

The migration from Whisper to Web Speech API is **COMPLETE**. All code changes are ready to deploy.

## 🚀 Quick Start

### Prerequisites

- ✅ Code changes already applied
- ✅ Frontend: No additional packages needed
- ✅ Backend: No changes required for voice input

### To Deploy

#### 1. Frontend

```bash
cd frontend
npm install  # Just to be safe
npm run build  # Production build
```

#### 2. Backend (Optional Cleanup)

The backend `/transcribe` endpoint is **still functional** but no longer used. You can:

**Option A: Leave it** (no harm, backward compatible)

```bash
# No changes needed
cd backend
pip install -r requirements.txt
uvicorn main:app
```

**Option B: Remove it** (clean up)

```bash
# Edit backend/routes/ai.py - remove @router.post("/transcribe") block
# Edit backend/utils/chat.py - remove transcribe_audio_file() function
# Edit backend/requirements.txt - remove: openai-whisper, torch (optional)
```

## 🧪 Testing Before Deployment

### 1. Local Testing

```bash
# Terminal 1: Backend (optional if you're cleaning it up)
cd backend
.venv\Scripts\Activate.ps1  # Windows PowerShell
# OR
source venv/bin/activate  # Mac/Linux
uvicorn main:app --host 127.0.0.1 --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 2. Manual Test Cases

Open `http://localhost:5173` in Chrome:

#### Test Case 1: Basic Functionality

```
✅ Microphone icon visible
✅ Can click microphone button
✅ "Listening..." indicator appears
✅ Can speak and hear recognition
✅ Text appears in input field
✅ Message auto-sends after speaking
```

#### Test Case 2: Language Settings

```
✅ Go to Settings → Interaction
✅ Can change voice language
✅ Language saves in localStorage
✅ Web Speech API recognizes selected language
```

#### Test Case 3: English (US)

```
Record yourself saying: "Hello, how are you?"
Expected: "Hello, how are you?" or similar
```

#### Test Case 4: Malay (ms-MY)

```
Record yourself saying: "Assalamu alaikum"
Expected: "Assalamu alaikum" or "Assalamu alaikum" (correct)
```

#### Test Case 5: Error Handling

```
a) No microphone:
   - Click voice input
   - Expected: Error message "No microphone found..."

b) Permission denied:
   - Deny microphone permission
   - Click voice input again
   - Expected: "Microphone permission denied..." error

c) Unsupported browser:
   - Open in Firefox
   - Click voice input
   - Expected: "Web Speech API is not supported..." error
```

### 3. Browser Testing

| Browser     | Status           | Action        |
| ----------- | ---------------- | ------------- |
| Chrome 120+ | ✅ Full          | Deploy as-is  |
| Edge 120+   | ✅ Full          | Deploy as-is  |
| Opera 106+  | ✅ Full          | Deploy as-is  |
| Safari 15+  | ⚠️ Partial       | Show fallback |
| Firefox     | ❌ Not supported | Show fallback |

### 4. Load Testing (Optional)

No server-side load test needed! Web Speech API is client-side only.

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Frontend code reviewed
- [ ] All imports verified
- [ ] No console errors when building
- [ ] `npm run build` completes successfully
- [ ] Tests passed in Chrome
- [ ] Tests passed in Edge

### Deployment

- [ ] Push code to main branch
- [ ] Build frontend: `npm run build`
- [ ] Deploy to production
- [ ] Verify no broken links
- [ ] Check API connectivity

### Post-Deployment

- [ ] Test in production with Chrome
- [ ] Test in production with Edge
- [ ] Check browser console (F12)
- [ ] Verify Settings page works
- [ ] Test voice input with real audio
- [ ] Monitor error logs

## 🔄 Rollback Plan

If issues occur:

### Quick Rollback (5 minutes)

```bash
# Revert frontend changes
git checkout HEAD~1 frontend/

# Rebuild
cd frontend
npm install
npm run build

# Redeploy
```

### Full Rollback (if needed)

```bash
# Revert all changes
git revert <commit-hash>
git push

# Rebuild and deploy
cd frontend && npm run build
cd backend && pip install -r requirements.txt
```

## ⚙️ Configuration for Different Environments

### Development

```javascript
// frontend/src/hooks/useWebSpeechAPI.js
// Default: continuous = false (single recognition)
// To test: Set continuous = true for continuous listening
```

### Staging

```javascript
// Same as production, but with logging enabled
console.log("Web Speech API initialized");
```

### Production

```javascript
// Minimal logging, production optimized
// All error messages user-friendly
```

## 📞 Support & Troubleshooting

### During Deployment

**Issue: "Module not found" errors**

```bash
Solution:
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Issue: Build fails**

```bash
Solution:
1. Check Node version: node --version (should be 16+)
2. Clear cache: npm cache clean --force
3. Reinstall: npm install
```

### After Deployment

**User Issue: "Web Speech API not supported"**

```
Cause: User using Firefox or older browser
Solution: Recommend Chrome/Edge, show text input as fallback
```

**User Issue: Microphone not working**

```
Steps to troubleshoot:
1. Check browser microphone permissions
2. Try different browser (Chrome/Edge)
3. Check device microphone works (test in system settings)
4. Clear browser cache
5. Try different language setting
```

**User Issue: Recognition accuracy poor**

```
Solutions:
1. Try different language setting
2. Speak more clearly
3. Use better microphone
4. Check background noise
5. Try in different browser
```

## 📊 Monitoring

### What to Monitor

```
1. Browser Error Logs
   └─ Check for Web Speech API errors

2. User Feedback
   └─ Monitor for issues with specific browsers

3. Analytics
   └─ Track which languages are used most
   └─ Track voice input success rate
   └─ Track browser breakdown (Chrome vs Edge vs Others)

4. Performance
   └─ Message send time (should be <1 second)
   └─ Voice input latency (should be <1 second)
```

### Sample Monitoring Query

```javascript
// Add to frontend for analytics
window.addEventListener("voiceInputStart", () => {
  // Log to analytics
  console.log("Voice input started");
});

window.addEventListener("voiceInputComplete", () => {
  // Log to analytics
  console.log("Voice input completed");
});
```

## 📝 Update Documentation

Update your deployment documentation:

```markdown
### Voice Input

The chatbot uses **Web Speech API** for voice-to-text conversion.

**Supported Browsers:**

- Google Chrome (recommended)
- Microsoft Edge
- Opera
- Samsung Internet

**Not Supported:**

- Firefox
- Safari (partial)
- Internet Explorer

**Configuration:**

- Language: Settings → Interaction → Voice Input Language
- Supported: English (US/UK), Bahasa Melayu

**How it works:**

1. Click microphone icon
2. Speak your message
3. Message auto-sends when done
```

## 🎓 Staff Training

### For Support Team

```
Q: User says voice input doesn't work
A:
1. Ask what browser they're using
2. If Firefox/Safari: Recommend Chrome/Edge
3. If Chrome/Edge: Check microphone permissions
4. If still not working: Clear browser cache and retry

Q: User says recognition is wrong
A:
1. Ask what language they have selected
2. Suggest they select correct language in Settings
3. Suggest they speak more clearly
4. Try different browser if issue persists
```

### For Developers

```
- Web Speech API is browser-native, no backend needed
- useWebSpeechAPI hook handles all logic
- Language codes must be BCP 47 format (e.g., ms-MY, en-GB)
- Fallback to text input if not supported
- See WEB_SPEECH_API_MIGRATION.md for technical details
```

## 🚀 Deployment Commands Summary

```bash
# Prepare
git pull origin main
cd frontend
npm install

# Build
npm run build

# Deploy (adjust for your deployment method)
# Example: GitHub Pages
npm run build
git add -A
git commit -m "Deploy: Web Speech API implementation"
git push origin main

# For self-hosted:
# Copy build/ folder to your web server
# Restart backend (if any changes)
```

## ✅ Final Verification

After deployment, verify with this checklist:

```
Production Environment:
☐ Website loads without errors
☐ Microphone icon visible in chat
☐ Can click microphone icon
☐ Microphone permission prompt shows (first time)
☐ "Listening..." indicator appears
☐ Voice recognition works in Chrome
☐ Voice recognition works in Edge
☐ Language selection works in Settings
☐ Voice input auto-sends message
☐ Error messages are user-friendly
☐ No console errors (F12)
☐ Performance is good (<1s transcription)
```

## 📚 Documentation Files

```
WEB_SPEECH_API_SUMMARY.md
├─ Overview of implementation
├─ What changed
└─ Benefits

WEB_SPEECH_API_MIGRATION.md
├─ Technical details
├─ Implementation guide
├─ Configuration options
└─ Troubleshooting

WEB_SPEECH_API_COMPARISON.md
├─ Before & after comparison
├─ Architecture comparison
├─ Performance metrics
└─ Summary

WEB_SPEECH_API_QUICKSTART.md
├─ User guide
├─ How to use
└─ Troubleshooting

WEB_SPEECH_API_DEPLOYMENT.md (this file)
├─ Setup instructions
├─ Testing checklist
├─ Deployment guide
├─ Troubleshooting
└─ Monitoring
```

---

**Status**: ✅ Ready for Deployment  
**Last Updated**: January 2026  
**Deployment Risk**: Low (client-side only, fallback available)  
**Estimated Downtime**: 0 (no server changes)
