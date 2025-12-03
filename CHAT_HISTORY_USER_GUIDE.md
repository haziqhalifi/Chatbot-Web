# Chat History Feature - User Guide

## How to Use Chat History

### Opening Chat History

1. **Look for the History Button**

   - In the chat header, you'll see a chat bubble icon (💬) button
   - It's located next to the AI model selector
   - Hover tooltip: "View chat history"

2. **Click to Open**
   - Click the history button
   - A sidebar will slide in from the left side
   - The main chat remains visible behind a semi-transparent overlay

### Viewing Your Conversations

The chat history sidebar shows:

- **Session Title**: The name of each conversation (e.g., "Chat 2025-11-07 10:30")
- **Timestamp**: When the conversation was last updated
  - "Today" - for conversations from today
  - "Yesterday" - for yesterday's chats
  - "X days ago" - for recent chats
  - Full date - for older conversations
- **AI Provider**: Shows which AI (Gemini/ChatGPT) was used
- **Active Indicator**: The current conversation has:
  - Blue background
  - Blue vertical bar on the left edge

### Restoring a Previous Chat

1. **Find the Conversation**

   - Scroll through your chat history
   - Sessions are ordered by most recent first

2. **Click to Load**
   - Click on any session to restore it
   - A loading spinner will appear
   - The chat interface will update with all previous messages
   - The sidebar automatically closes
   - You can now continue the conversation

### Deleting Old Chats

1. **Hover Over a Session**

   - Move your mouse over any chat session
   - A red delete button (🗑️) appears on the right

2. **Confirm Deletion**
   - Click the delete button
   - A confirmation dialog appears: "Are you sure you want to delete this chat?"
   - Click OK to permanently delete
   - The session disappears from the list

### Closing Chat History

You can close the history sidebar in three ways:

1. Click the X button in the top-right corner
2. Click anywhere on the dark overlay
3. Load a chat session (auto-closes)

## Visual Guide

```
┌─────────────────────────────────────────────────────┐
│  Chat Header                                        │
│  [💬] [Model ▼] [RAG] [+] [×]                      │
│       ↑                                             │
│   History Button - Click here!                      │
└─────────────────────────────────────────────────────┘

When clicked, sidebar appears:

┌──────────────────┐  ┌──────────────────────────────┐
│ Chat History  [×]│  │ Main Chat (with overlay)     │
├──────────────────┤  │                              │
│                  │  │                              │
│ ┃ Meeting Notes │  │  [Messages visible behind]   │
│   Today • Gemini│  │                              │
│                  │  │                              │
│   Project Q&A   │  │                              │
│   Yesterday     │  │                              │
│                  │  │                              │
│   Bug Report    │  │                              │
│   3 days ago    │  │                              │
│                  │  │                              │
└──────────────────┘  └──────────────────────────────┘
    ↑
    Current session has blue highlight and left bar
```

## Tips & Tricks

### 💡 Best Practices

1. **Organize Your Chats**

   - Give meaningful titles to important conversations
   - Delete old or unnecessary chats regularly

2. **Quick Access**

   - Recent chats appear at the top
   - No need to scroll for today's conversations

3. **Multiple AI Models**

   - Each session remembers which AI it used
   - You can see at a glance which chats used Gemini vs ChatGPT

4. **Seamless Continuation**
   - Load any old chat and pick up right where you left off
   - All context is preserved

### ⚠️ Important Notes

- Deleted chats **cannot be recovered**
- Each session is independent - switching doesn't lose your place
- Your current chat is always highlighted in blue
- Maximum 50 most recent sessions are shown

## Keyboard Shortcuts

Currently available shortcuts:

- **ESC**: Close the chat history sidebar (when focused)

## Troubleshooting

### History button doesn't appear

- Make sure you're logged in
- Refresh the page
- Check your internet connection

### Sessions don't load

- Verify you have an active internet connection
- Try refreshing the browser
- Check if the backend server is running

### Empty history

- This is normal for new users
- Start a conversation to create your first session
- Old sessions may have been deleted

### Can't delete a session

- Make sure you're the owner of the session
- Check your internet connection
- Try refreshing and trying again

## Feature Summary

✅ **Quick Access**: One click to view all conversations  
✅ **Easy Restore**: Click any session to continue chatting  
✅ **Clean Management**: Delete old chats with confirmation  
✅ **Visual Feedback**: Clear indication of current session  
✅ **Smart Dates**: Human-readable timestamps  
✅ **AI Tracking**: See which model was used per session

---

**Need Help?** If you encounter any issues with chat history, please contact support or check the main documentation.
