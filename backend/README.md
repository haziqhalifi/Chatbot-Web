# Backend Structure

## Overview

FastAPI backend for the Disaster Management Chatbot. Organized in a layered architecture for scalability and maintainability.

## Architecture

```
Routes (HTTP) → Services (Business Logic) → Database (SQL) → Repositories (Data Access)
```

**Never put business logic in routes or SQL in services.**

## Structure

```
backend/
├── main.py                  # FastAPI application entry point
├── config/
│   ├── settings.py          # Environment variables and configuration
│   ├── database.py          # Database configuration
│   └── models.py            # Config models
├── routes/                  # API endpoints (HTTP handling only)
│   ├── auth.py              # Authentication (login, register, password reset)
│   ├── chat.py              # Chat sessions and messages
│   ├── admin.py             # Admin dashboard and management
│   ├── map.py               # Map data endpoints
│   ├── ai.py                # AI/voice processing
│   ├── notifications.py     # Notification endpoints
│   ├── reports.py           # Disaster reports
│   ├── profile.py           # User profile management
│   ├── subscriptions.py     # Subscription management
│   ├── health.py            # Health check endpoint
│   └── dev.py               # Development utilities
├── services/                # Business logic
│   ├── chat_service.py      # Chat session management
│   ├── openai_assistant_service.py  # OpenAI API integration
│   ├── map_tools.py         # 15 AI map tools definition
│   ├── notification_service.py      # Notification logic
│   ├── subscription_service.py      # Subscription logic
│   ├── nadma_service.py     # NADMA data integration
│   └── email_notification_service.py
├── database/                # SQL operations
│   ├── connection.py        # Connection pool (DatabaseConnectionPool)
│   ├── chat.py              # Chat CRUD operations
│   ├── users.py             # User CRUD operations
│   ├── reports.py           # Report CRUD operations
│   ├── admin.py             # Admin dashboard queries
│   ├── faq.py               # FAQ management
│   ├── nadma.py             # NADMA data
│   ├── schema.py            # Database schema management
│   └── system_reports.py    # System reports
├── repositories/            # Data access patterns
│   └── base.py              # BaseRepository with connection management
├── middleware/              # Custom middleware
│   ├── database_middleware.py  # Request-level database handling
│   ├── error_handler.py        # Global error handling
│   └── rate_limiter.py         # Rate limiting
├── utils/                   # Utility functions
│   ├── auth.py              # JWT helpers, token extraction
│   ├── security.py          # Password hashing, validation
│   ├── email_sender.py      # Email utilities
│   └── language.py          # i18n utilities
├── models/                  # Pydantic schemas
├── scripts/                 # Maintenance scripts
│   ├── check_admin.py
│   ├── fix_admin_password.py
│   └── migrate_*.py         # Database migrations
└── tests/                   # Test suite (543 tests)
    ├── unit/                # 136 unit tests
    ├── integration/         # 84 integration tests
    ├── api/                 # 179 API tests
    └── security/            # 144 security tests
```

## Key Features

- **OpenAI Assistant API** - Thread-based AI conversations with function calling
- **15 Map Tools** - AI-controlled map operations (Zoom, Pan, Search, ToggleLayer, etc.)
- **Connection Pooling** - Thread-safe database connections via `DatabaseConnectionPool`
- **JWT Authentication** - Secure user/admin authentication
- **Email Verification** - Required for new user registration
- **Rate Limiting** - Request throttling middleware

## Requirements

- Python 3.12+
- Azure SQL Server (pyodbc)
- OpenAI API key + Assistant ID

## Setup

1. **Create and activate virtual environment**:

   ```powershell
   cd "C:\Users\user\Desktop\Chatbot Web"
   python -m venv .venv
   .venv\Scripts\Activate.ps1
   ```

2. **Install dependencies**:

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Configure environment** (create `.env` in project root):

   ```env
   SQL_SERVER=your-server.database.windows.net
   SQL_DATABASE=chatbot_db
   SQL_USER=your_username
   SQL_PASSWORD=your_password
   OPENAI_API_KEY=sk-your-key
   OPENAI_ASSISTANT_ID=asst_your-id
   JWT_SECRET=your-secret
   API_KEY=secretkey
   ADMIN_CODE=admin-code
   ```

4. **Run the server**:

   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8000
   ```

## Database Connection Pattern

**ALWAYS use the connection pool**, never direct `pyodbc.connect()`:

```python
from database.connection import DatabaseConnection

with DatabaseConnection() as conn:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    result = cursor.fetchone()
    cursor.close()
# Connection auto-returns to pool
```

## Testing

```bash
# Unit tests (no database required)
pytest tests/unit/ -v

# Integration tests (requires database)
.\run_integration_tests.bat  # Windows
./run_integration_tests.sh   # Linux/Mac

# With coverage
pytest tests/unit/ --cov=. --cov-report=html
```

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Map API: See [routes/MAP_API.md](routes/MAP_API.md)
