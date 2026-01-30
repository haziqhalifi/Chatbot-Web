# Frontend - Disaster Management Chatbot

React frontend for the Disaster Management Chatbot with AI-powered chat, ArcGIS map integration, and multi-language support.

## 🚀 Features

- **React 19** - Latest React with concurrent features
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **ArcGIS JavaScript API 4.34** - Interactive mapping
- **i18next** - Multi-language support (English, Malay)
- **React Router 7** - Client-side routing

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running at `http://localhost:8000`

## 🛠️ Installation

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## 📁 Project Structure

```
frontend/src/
├── api.js               # Axios instance with auth interceptors
├── App.jsx              # Main application component
├── Routes.jsx           # Application routes
├── i18n.js              # i18next configuration
├── main.jsx             # Application entry point
├── api/                 # API client modules
├── components/          # Reusable UI components
│   ├── chat/            # Chat interface components
│   ├── dashboard/       # Dashboard and map components
│   ├── admin/           # Admin panel components
│   ├── ui/              # Common UI components
│   └── notification/    # Notification components
├── contexts/            # React Context providers
│   ├── AuthContext.jsx          # Authentication state
│   ├── ChatContext.jsx          # Chat session state
│   ├── LayerContext.jsx         # Z-index management for modals/dropdowns
│   ├── NotificationContext.jsx  # Notification state
│   └── AdminSidebarContext.jsx  # Admin sidebar state
├── hooks/               # Custom React hooks
├── locales/             # i18n translations
│   ├── en.json          # English translations
│   └── ms.json          # Malay translations
├── pages/               # Route-level page components
│   ├── user/            # User pages
│   ├── admin/           # Admin pages
│   ├── auth/            # Authentication pages
│   └── legal/           # Legal pages
├── services/            # API service modules
├── styles/              # Global styles
├── test/                # Test files
└── utils/               # Utility functions
```

## 🎯 Key Concepts

### LayerContext (Z-Index Management)

All modals and dropdowns must use `LayerContext` to prevent z-index conflicts:

```jsx
import { useLayer } from '../contexts/LayerContext';

const MyComponent = () => {
  const { openLayer, closeLayer, isLayerActive } = useLayer();

  const handleOpenModal = () => {
    openLayer('REPORT_MODAL', { reportId: 123 });
  };

  return <button onClick={handleOpenModal}>Open Report</button>;
};
```

**Z-Index Priorities:**

- Dropdowns: 20-30
- Chat interface: 40
- Modals: 50

### API Authentication

The `api.js` module automatically adds auth headers:

```javascript
import api from './api';

// JWT token from AuthContext is auto-attached
const response = await api.get('/chat/sessions');
```

Headers added automatically:

- `Authorization: Bearer <token>`
- `x-api-key: secretkey`

### Map Integration

AI responses include `map_commands` that are executed on the ArcGIS map:

```javascript
// Example AI response
{
  "response": "I'll show you the flood zones.",
  "map_commands": [
    { "function": "ToggleLayer", "args": { "layer": "flood", "visible": true } },
    { "function": "Search", "args": { "place": "Kuala Lumpur" } }
  ]
}
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📦 Build

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## 🌐 Environment

Create `.env` in frontend root (optional):

```env
VITE_API_URL=http://localhost:8000
```

## 🎨 Styling

Uses Tailwind CSS with custom configuration. Edit `tailwind.config.js` for customization.

Key features:

- Responsive design utilities
- Custom color palette
- Typography plugin for markdown content

- Styled with Tailwind CSS

Built with ❤️ on Rocket.new
