# Chat Components

This directory contains the modularized chat components for the Tiara chatbot interface.

## Components Structure

### Main Components

- **`ChatBox.jsx`** - Main chat container component that manages the overall chat state and logic
- **`ChatButton.jsx`** - Floating chat button that opens the chat interface

### Sub-components

- **`ChatHeader.jsx`** - Chat header with title, controls, and action buttons
- **`ChatMessages.jsx`** - Message display area with scrolling and message rendering
- **`ChatInput.jsx`** - Input area with text input, voice recording, and send functionality
- **`ExportDropdown.jsx`** - Export functionality for PNG and PDF formats
- **`UserAvatar.jsx`** - User avatar component with fallbacks
- **`VoiceInput.jsx`** - Voice recording indicator component

### Index File

- **`index.js`** - Exports all components for easy importing

## Usage

Import the main components in your parent component:

```jsx
import { ChatBox, ChatButton } from '../chat';
```

## Benefits of Modularization

1. **Reduced Code Complexity** - Each component has a single responsibility
2. **Better Maintainability** - Easier to locate and fix issues
3. **Reusability** - Components can be reused across different parts of the application
4. **Testing** - Individual components can be tested in isolation
5. **Performance** - Smaller components can be optimized individually
6. **Development** - Multiple developers can work on different components simultaneously

## Component Hierarchy

```
ChatInterface (dashboard/ChatInterface.jsx)
├── ChatBox (chat/ChatBox.jsx)
│   ├── ChatHeader (chat/ChatHeader.jsx)
│   │   └── ExportDropdown (chat/ExportDropdown.jsx)
│   ├── ChatMessages (chat/ChatMessages.jsx)
│   │   └── UserAvatar (chat/UserAvatar.jsx)
│   └── ChatInput (chat/ChatInput.jsx)
│       └── VoiceInput (chat/VoiceInput.jsx)
└── ChatButton (chat/ChatButton.jsx)
```

## State Management

The main `ChatBox` component manages:

- User profile data and caching
- Chat messages and display logic
- Voice recording functionality
- RAG toggle state
- Export functionality

Each sub-component receives only the props it needs, following the principle of least privilege.
