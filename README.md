# Chatbot Web

A full-stack **Disaster Management Chatbot** with AI-powered chat using OpenAI Assistant API, ArcGIS map integration with 15 map tools, email verification, admin/user roles, and disaster reporting.

## Features

- 🤖 **AI-Powered Chat** - OpenAI Assistant API with thread-based conversations
- 🗺️ **Interactive Map** - ArcGIS JavaScript API 4.34 with 15 AI-controllable map tools
- 🌍 **Multi-Language** - Malay (Bahasa Melayu) and English support
- 🎤 **Voice Input** - Speech-to-text with OpenAI Whisper
- 📊 **Admin Dashboard** - User management, analytics, and system monitoring
- 🔔 **Notifications** - Real-time alerts and email notifications
- 📱 **Responsive Design** - React 19 + Tailwind CSS

## Tech Stack

| Component | Technology                     |
| --------- | ------------------------------ |
| Backend   | FastAPI (Python 3.12+)         |
| Frontend  | React 19 + Vite + Tailwind CSS |
| Database  | Azure SQL Server               |
| AI        | OpenAI Assistant API           |
| Maps      | ArcGIS JavaScript API 4.34     |
| Voice     | OpenAI Whisper (cloud/local)   |

## Project Structure

```
├── backend/              # FastAPI backend (Python)
│   ├── config/           # Configuration settings (settings.py, database.py)
│   ├── database/         # Database modules (connection pool, CRUD operations)
│   ├── middleware/       # FastAPI middleware (rate limiting, error handling)
│   ├── models/           # Pydantic schemas for request/response validation
│   ├── repositories/     # Data access layer (BaseRepository pattern)
│   ├── routes/           # API endpoints (auth, chat, admin, map, etc.)
│   ├── scripts/          # Maintenance and migration scripts
│   ├── services/         # Business logic (chat, AI, notifications, map tools)
│   ├── tests/            # Test suite (543 tests: unit, integration, API, security)
│   └── utils/            # Utility functions (auth, email, security)
├── frontend/             # React frontend (Vite)
│   ├── public/           # Static assets and manifest
│   └── src/              # React source code
│       ├── api/          # API client configuration
│       ├── components/   # Reusable UI components
│       ├── contexts/     # React Context (Auth, Chat, Layer, Notification)
│       ├── hooks/        # Custom React hooks
│       ├── locales/      # i18n translations (en.json, ms.json)
│       ├── pages/        # Route components (user, admin, auth)
│       └── services/     # API service modules
└── .venv/                # Python virtual environment
```

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- Azure SQL Server (or local SQL Server)
- OpenAI API Key + Assistant ID

### Backend Setup

```bash
# Create and activate virtual environment
cd "C:\Users\user\Desktop\Chatbot Web"
python -m venv .venv
.venv\Scripts\Activate.ps1

# Install dependencies
cd backend
pip install -r requirements.txt

# Configure environment variables (see Environment Variables section)
# Start the server
uvicorn main:app --host 127.0.0.1 --port 8000
```

The backend will be available at `http://127.0.0.1:8000`. API docs at `/docs`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Environment Variables

Create a `.env` file in the project root:

```env
# Database (Azure SQL)
SQL_SERVER=your-server.database.windows.net
SQL_DATABASE=chatbot_db
SQL_USER=your_username
SQL_PASSWORD=your_password

# OpenAI Assistant API
OPENAI_API_KEY=sk-your-api-key
OPENAI_ASSISTANT_ID=asst_your-assistant-id

# JWT Authentication
JWT_SECRET=your-secure-secret
ADMIN_CODE=admin-registration-code
SUPER_ADMIN_CODE=super-admin-code

# API Security
API_KEY=secretkey

# Email (SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@yourdomain.com
SMTP_TLS=true

# Frontend URL (for email links)
FRONTEND_BASE_URL=http://localhost:5173
```

## Voice Chat Feature (Malay & English) 🎤

The chatbot supports voice input with **Malay (Bahasa Melayu)** and **English** languages.

### Setup Options

1. **OpenAI Whisper API (Recommended)**
   - Add `OPENAI_API_KEY` to `.env`
   - Best accuracy for Malay

2. **Local Whisper (Free)**
   - No API key needed
   - Slower, less accurate for Malay

### Usage

- Click microphone icon 🎤 to record
- Go to **Settings → Interaction** to select language:
  - Auto-detect (recommended)
  - Bahasa Melayu
  - English

## Map Integration & AI Tools

The AI assistant can control the map using **15 map tools** via function calling:

| Tool            | Description                            |
| --------------- | -------------------------------------- |
| `Zoom`          | Zoom in/out or reset to default        |
| `Pan`           | Pan map in 8 directions                |
| `Search`        | Search and center on a place           |
| `ToggleLayer`   | Show/hide map layers                   |
| `ToggleBasemap` | Change basemap style                   |
| `IdentifyAll`   | Identify features at coordinates       |
| `IdentifyLayer` | Identify features on specific layer    |
| `Find`          | Find features within radius            |
| `FindNearest`   | Find nearest features to point         |
| `FindNearestIn` | Find nearest features to a named place |
| `Query`         | SQL-like query on layer                |
| `DrawBuffer`    | Draw buffer circle around point        |
| `QueryBuffer`   | Query features within buffer           |
| `DescribeMap`   | Get current map state                  |
| `Clear`         | Clear graphics and selections          |

### Available Map Layers

| Type         | Description                             |
| ------------ | --------------------------------------- |
| `landslide`  | Land Slide Risk Areas                   |
| `flood`      | Flood Prone Areas                       |
| `poi`        | Points of Interest (emergency services) |
| `population` | Population density data                 |

### Map API Endpoints

- `GET /map/endpoints` — All available map data endpoints
- `GET /map/endpoints/{type}` — Specific endpoint by type
- `GET /map/types` — Available map data types

See [backend/routes/MAP_API.md](backend/routes/MAP_API.md) for detailed API documentation.

## Testing

The backend has a comprehensive test suite with **543 tests** across four layers:

| Category    | Tests | Description                  |
| ----------- | ----- | ---------------------------- |
| Unit        | 136   | Isolated function testing    |
| Integration | 84    | End-to-end workflows         |
| API         | 179   | HTTP endpoint validation     |
| Security    | 144   | Security vulnerability tests |

```bash
# Run all unit tests
cd backend
pytest tests/unit/ -v

# Run integration tests
.\run_integration_tests.bat  # Windows
./run_integration_tests.sh   # Linux/Mac

# Run with coverage
pytest tests/unit/ --cov=. --cov-report=html
```

## API Authentication

- **User Auth**: JWT tokens in `Authorization: Bearer <token>` header
- **API Key**: `x-api-key: secretkey` header required for all requests
- **Admin**: Requires admin code during registration + email verification

## Architecture

The backend follows a layered architecture:

```
Routes (HTTP) → Services (Business Logic) → Database (SQL) → Repositories (Data Access)
```

**Key Patterns:**

- Connection pooling with `DatabaseConnection` context manager
- Thread-safe database operations
- LayerContext for frontend z-index management
- OpenAI Assistant with function calling for map tools

## Notes

- Ensure the backend is running before using the frontend
- Email verification required for new user accounts
- Admin users need the `ADMIN_CODE` during registration

## License

This project is for educational purposes.

- `FRONTEND_BASE_URL` (example: `http://localhost:4028` or your deployed site)
- `SMTP_HOST` (required to send email)
- `SMTP_PORT` (default: `587`)
- `SMTP_USER` (optional; if set, login is attempted)
- `SMTP_PASSWORD` (required if `SMTP_USER` is set)
- `SMTP_FROM` (optional; defaults to `SMTP_USER`)
- `SMTP_TLS` (default: `true`) – use STARTTLS on port 587
- `SMTP_SSL` (default: `false`) – set to `true` for implicit TLS (commonly port 465)
- `SMTP_TIMEOUT` (default: `20` seconds)

If `SMTP_HOST` is not set, the backend logs the reset link in the console (dev mode).

### Brevo (Sendinblue) example

1. In Brevo: create an SMTP key (SMTP credentials) and verify your sender email/domain.
2. Set env vars (PowerShell):

   `$env:FRONTEND_BASE_URL = "http://localhost:4028"
$env:SMTP_HOST = "smtp-relay.brevo.com"
$env:SMTP_PORT = "587"
$env:SMTP_TLS = "true"
$env:SMTP_SSL = "false"
$env:SMTP_USER = "YOUR_BREVO_SMTP_LOGIN"
$env:SMTP_PASSWORD = "YOUR_BREVO_SMTP_KEY"
$env:SMTP_FROM = "verified-sender@yourdomain.com"`

3. Restart the backend and use “Forgot password?” again.

## License

This project is for educational purposes.
