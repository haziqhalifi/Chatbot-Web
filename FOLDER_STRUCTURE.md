# Project Folder Structure Guide

This document explains the organization of the Chatbot Web project.

## 📁 Root Level

```
Chatbot-Web/
├── docs/                    # All project documentation
├── backend/                 # FastAPI backend (Python)
├── frontend/                # React/Vite frontend (JavaScript)
├── diagrams/                # PlantUML architecture diagrams
├── .venv/                   # Python virtual environment
├── .env.example             # Template for environment variables
├── .gitignore              # Git ignore rules
├── README.md               # Main project documentation
└── FOLDER_STRUCTURE.md     # This file
```

---

## 📚 `docs/` - Documentation

Organized documentation for developers and users.

```
docs/
├── guides/                 # User and setup guides
│   ├── admin-signin.md
│   ├── api-keys.md
│   ├── openai-setup.md
│   ├── openai-quickstart.md
│   ├── voice-chat.md
│   ├── chat-history.md
│   └── testing.md
│
├── architecture/           # System design and architecture
│   ├── client-server-architecture.md
│   └── system-overview.md
│
├── features/               # Feature documentation
│   ├── notifications.md
│   ├── map-integration.md
│   └── chat-history.md
│
└── api/                    # API integration guides
    ├── arcgis-integration.md
    ├── map-data-api.md
    └── map-data-quickstart.md
```

### When to add docs:
- **guides/**: Setup instructions, API keys, deployment procedures
- **architecture/**: System design, component interaction, flow diagrams
- **features/**: Feature-specific documentation and how-to guides
- **api/**: External API integrations, webhooks, API references

---

## 🔧 `backend/` - FastAPI Backend

Python FastAPI application with modular organization.

```
backend/
├── app/                    # Main application package
│   ├── __init__.py
│   ├── main.py            # FastAPI app entry point
│   ├── config.py          # Configuration and settings
│   │
│   ├── api/               # API route handlers
│   │   ├── __init__.py
│   │   ├── routes.py      # Main API routes
│   │   └── ...
│   │
│   ├── services/          # Business logic
│   │   ├── __init__.py
│   │   ├── chat_service.py
│   │   ├── user_service.py
│   │   └── ...
│   │
│   ├── database/          # Database operations
│   │   ├── __init__.py
│   │   ├── connection.py  # DB connection pooling
│   │   ├── models.py      # SQLAlchemy models
│   │   ├── schema.py      # Database schema
│   │   ├── admin.py
│   │   ├── users.py
│   │   ├── chat.py
│   │   └── ...
│   │
│   ├── models/            # Pydantic data models
│   │   ├── __init__.py
│   │   └── ...
│   │
│   ├── middleware/        # Custom middleware
│   │   ├── __init__.py
│   │   ├── database_middleware.py
│   │   ├── error_handler.py
│   │   └── rate_limiter.py
│   │
│   ├── utils/             # Utility functions
│   │   ├── __init__.py
│   │   └── ...
│   │
│   └── repositories/      # Data access layer (optional)
│       ├── __init__.py
│       └── ...
│
├── scripts/               # Setup and maintenance scripts
│   ├── init_nadma_db.py  # Initialize database
│   ├── check_admin.py    # Check admin status
│   └── fix_admin_password.py
│
├── tests/                 # Unit and integration tests
│   ├── test_nadma_api.py
│   ├── test_openai_integration.py
│   └── ...
│
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (DO NOT commit)
└── README.md             # Backend-specific documentation
```

### Module Responsibilities:
- **app/main.py**: FastAPI app initialization and route mounting
- **app/config.py**: Environment variables, settings, constants
- **app/api/**: HTTP endpoint handlers (decorators, request handling)
- **app/services/**: Business logic, external API calls, data processing
- **app/database/**: SQL queries, database transactions, ORM operations
- **app/models/**: Pydantic request/response schemas
- **app/middleware/**: Request/response interception
- **app/utils/**: Helper functions, decorators, formatters

---

## 🎨 `frontend/` - React/Vite Frontend

JavaScript/TypeScript frontend application.

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ChatBox/
│   │   ├── MapView/
│   │   ├── Navbar/
│   │   └── ...
│   │
│   ├── pages/             # Page components (route-based)
│   │   ├── ChatPage.jsx
│   │   ├── AdminPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── ...
│   │
│   ├── services/          # API and external service calls
│   │   ├── api.js        # Axios/fetch API wrapper
│   │   └── ...
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── useChat.js
│   │   ├── useAuth.js
│   │   └── ...
│   │
│   ├── contexts/          # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── ChatContext.jsx
│   │   └── ...
│   │
│   ├── utils/             # Utility functions
│   │   ├── helpers.js
│   │   └── ...
│   │
│   ├── styles/            # Global styles and theme
│   │   └── globals.css
│   │
│   ├── locales/           # i18n translations
│   │   ├── en.json
│   │   ├── es.json
│   │   └── ...
│   │
│   ├── App.jsx            # Root component
│   ├── main.jsx           # Application entry point
│   ├── Routes.jsx         # Route definitions
│   └── i18n.js            # i18n configuration
│
├── public/                # Static assets
├── build/                 # Compiled output (git ignored)
├── package.json           # NPM dependencies
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
└── jsconfig.json          # JavaScript configuration
```

### Directory Purposes:
- **components/**: Reusable UI components (buttons, forms, cards)
- **pages/**: Full page components that map to routes
- **services/**: API calls and external integrations
- **hooks/**: Custom React hooks for logic reuse
- **contexts/**: Global state management (auth, chat, etc.)
- **utils/**: Helper functions not tied to React
- **styles/**: CSS, Tailwind, theme configuration
- **locales/**: Multi-language translation files

---

## 📊 `diagrams/` - Architecture Diagrams

PlantUML sequence and component diagrams.

```
diagrams/
├── 00_system_overview.puml          # High-level architecture
├── 01_user_authentication.puml      # User login flow
├── 02_admin_authentication.puml     # Admin login flow
├── 02_chatbot_interaction.puml      # Chat interaction flow
├── 03_chat_session_management.puml  # Session management
├── 03_incident_reporting.puml       # Incident reporting
├── 04_chat_message_flow.puml        # Message flow
├── 04_notification_handling.puml    # Notification system
├── 05_ai_response_generation.puml   # OpenAI integration
├── 05_map_gis_query.puml            # Map/GIS queries
├── 06_audio_transcription.puml      # Voice chat
├── 06_subscription_alert_management.puml
├── 07_admin_dashboard.puml          # Admin interface
├── 07_notification_system.puml
├── 08_profile_management.puml       # User profile
├── 09_subscription_management.puml  # Subscriptions
├── 10_admin_dashboard.puml
├── 11_application_startup.puml      # App startup
├── 12_error_handling.puml           # Error handling flow
├── 13_map_data_api.puml             # Map data API
├── generate_diagrams.bat            # Generate diagrams (Windows)
├── generate_diagrams.sh             # Generate diagrams (Linux/Mac)
└── README.md                        # Diagram documentation
```

---

## 🌍 Environment Configuration

### `.env` (Local - DO NOT commit)
```
# Backend
DATABASE_URL=...
OPENAI_API_KEY=...

# Frontend
VITE_API_URL=...
```

### `.env.example` (Template - commit this)
```
# Backend
DATABASE_URL=your_database_url_here
OPENAI_API_KEY=your_openai_key_here

# Frontend
VITE_API_URL=http://localhost:8000
```

---

## 🔄 Typical Workflows

### Adding a New Feature (e.g., "User Notifications")

1. **Backend**:
   - Create `backend/app/services/notification_service.py` (business logic)
   - Create `backend/app/api/notification_routes.py` (API endpoints)
   - Add database operations in `backend/app/database/notifications.py`
   - Create Pydantic models in `backend/app/models/notification.py`
   - Write tests in `backend/tests/test_notifications.py`

2. **Frontend**:
   - Create `frontend/src/components/NotificationCenter/` (UI components)
   - Create `frontend/src/services/notificationApi.js` (API calls)
   - Create `frontend/src/hooks/useNotifications.js` (custom hook)
   - Add pages in `frontend/src/pages/NotificationsPage.jsx` if needed

3. **Documentation**:
   - Add guide in `docs/guides/notifications.md` (user guide)
   - Add feature doc in `docs/features/notifications.md` (technical)
   - Update relevant diagrams in `diagrams/`

---

## 📝 Best Practices

✅ **DO:**
- Keep related code in the same directory
- Use descriptive file and folder names
- Maintain consistent naming conventions (kebab-case for files, camelCase for variables)
- Document complex logic in docstrings
- Create an `__init__.py` in each Python package
- Group related tests together

❌ **DON'T:**
- Mix concerns (keep API routes out of services)
- Scatter related code across multiple directories
- Put utility functions in random locations
- Leave `.env` files uncommitted
- Create deeply nested folders (max 3-4 levels)

---

## 📖 Related Documentation

- [Backend Setup](docs/guides/api-keys.md)
- [Frontend Development](frontend/README.md)
- [Architecture Overview](docs/architecture/client-server-architecture.md)
- [System Diagrams](diagrams/README.md)
