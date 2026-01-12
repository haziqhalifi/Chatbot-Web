# Copilot Instructions: Chatbot Web

## System Architecture

**Disaster Management Chatbot** with FastAPI backend (Python) + React/Vite frontend (JavaScript). Core features: AI-powered chat with OpenAI Assistant API, ArcGIS map integration with 15 map tools, email verification, admin/user roles, disaster reporting.

### Key Components

- **Backend**: FastAPI with layered architecture: `routes/` → `services/` → `database/` → `repositories/`
- **Frontend**: React 19 with Context API (no Redux). `LayerContext` manages z-index for overlays/modals
- **Database**: Azure SQL Server with connection pooling (`DatabaseConnectionPool` in `database/connection.py` - reuse connections to minimize vCore usage)
- **AI Integration**: OpenAI Assistant API with custom map tools (`services/map_tools.py` defines 15 functions: Search, ToggleLayer, Zoom, Pan, etc.)
- **Map**: ArcGIS JavaScript API 4.34 - AI responses include `map_commands` array executed by frontend

## Critical Workflows

### Backend Development

```bash
# Activate venv (Windows PowerShell)
.venv\Scripts\Activate.ps1
cd backend
uvicorn main:app --host 127.0.0.1 --port 8000
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev  # Usually http://localhost:5173
```

### Testing

```bash
# Backend unit tests (pytest)
cd backend
pytest tests/unit/

# Integration tests
.\run_integration_tests.bat  # or .sh on Linux

# Frontend tests
cd frontend
npm run test
npm run test:coverage
```

## Project-Specific Patterns

### Backend Layering (CRITICAL)

**Routes handle HTTP only** → delegate to **Services for business logic** → **Database modules for SQL** → **Repositories for data access patterns**

Example flow for new endpoint:

1. `backend/routes/chat.py` - HTTP request/response
2. `backend/services/chat_service.py` - session management, AI calls
3. `backend/database/chat.py` - raw SQL operations
4. `backend/repositories/base.py` - connection management, common queries

**Never put business logic in routes or SQL in services.**

### Database Connection Pattern

```python
# ALWAYS use connection pool (not direct pyodbc.connect)
from database.connection import DatabaseConnection

with DatabaseConnection() as conn:
    cursor = conn.cursor()
    cursor.execute("SELECT ...")
    result = cursor.fetchall()
    cursor.close()
# Connection auto-returns to pool
```

### OpenAI Assistant + Map Tools Integration

1. User sends chat message → `POST /chat/generate`
2. Backend calls `OpenAIAssistantService.send_message(thread_id, message)`
3. AI has access to 15 map tools (defined in `services/map_tools.py`)
4. AI response includes: `{"response": "text", "map_commands": [{function: "Search", args: {...}}]}`
5. Frontend executes map commands sequentially on ArcGIS map

**When adding map tools**: Update `MAP_TOOLS` array in `services/map_tools.py` + handle in `openai_assistant_service.py` + frontend map controller

### Frontend Layer Management

**LayerContext** manages z-index for all overlays. Defined priorities:

- Dropdowns: z-index 20-30
- Chat interface: z-index 40
- Modals: z-index 50

```jsx
// Open modal/dropdown
import { useLayer } from "../contexts/LayerContext";
const { openLayer, closeLayer } = useLayer();
openLayer("REPORT_MODAL", { reportId: 123 });
```

### Authentication Flow

- User: Email verification required (see `EMAIL_VERIFICATION_BUGFIXES.md`)
- Admin: Code-based (`ADMIN_CODE` env var) + email verification
- JWT tokens in `Authorization: Bearer <token>` header
- Extract user_id: `get_user_id_from_token()` helper in routes

### Multi-Language Support

- i18n: `frontend/src/i18n.js` + `locales/` (en, ms)
- Voice: Whisper model supports Malay/English (`OPENAI_API_KEY` for cloud, or local model)
- Settings → Interaction to select language (auto-detect, Bahasa Melayu, English)

## File Organization Conventions

### Backend

```
backend/
├── routes/       # FastAPI routers (auth.py, chat.py, admin.py, map.py, etc.)
├── services/     # Business logic (chat_service.py, openai_assistant_service.py, map_tools.py)
├── database/     # SQL operations (connection.py, chat.py, users.py, reports.py)
├── repositories/ # Data access patterns (base.py with BaseRepository, UserRepository, ChatRepository)
├── models/       # Pydantic schemas (request/response validation)
├── middleware/   # Custom middleware (database_middleware.py, error_handler.py)
├── tests/        # pytest: unit/, integration/, api/
└── config/       # settings.py (env vars, API keys, AI providers)
```

### Frontend

```
frontend/src/
├── pages/        # Route components (Login.jsx, Chat.jsx, AdminDashboard.jsx)
├── components/   # Reusable UI (Navbar.jsx, Modal.jsx, Map.jsx)
├── contexts/     # Global state (LayerContext.jsx for z-index management)
├── services/     # API calls (chatService.js, notificationService.js)
├── hooks/        # Custom React hooks
├── locales/      # i18n translations (en.json, ms.json)
└── api.js        # Axios instance with interceptors (auth token + API key)
```

## External Dependencies

### Environment Variables (`.env`)

```env
# Database (Azure SQL)
SQL_SERVER=...
SQL_DATABASE=...
SQL_USER=...
SQL_PASSWORD=...

# OpenAI Assistant API (required for AI chat)
OPENAI_API_KEY=sk-...
OPENAI_ASSISTANT_ID=asst_...

# JWT Auth
JWT_SECRET=...
ADMIN_CODE=...        # Admin registration code
SUPER_ADMIN_CODE=...  # Super admin code

# Email (verification)
EMAIL_HOST=...
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASSWORD=...
```

### Key Integrations

- **OpenAI Assistant API**: Thread-based conversations with custom function calling (map tools)
- **ArcGIS REST API**: Feature layers for disaster data (landslide, flood, POI, population)
- **Whisper**: Local/cloud speech-to-text (Malay + English support)

## Common Pitfalls

1. **Connection Pool**: Never use `pyodbc.connect()` directly. Use `DatabaseConnection()` context manager.
2. **Map Commands**: AI-generated map commands must match function names in `MAP_TOOLS` exactly.
3. **Email Verification**: New users cannot login until email verified (see `SIGNUP_EMAIL_VERIFICATION_GUIDE.md`).
4. **LayerContext**: All modals/dropdowns must register with `LayerContext` to prevent z-index conflicts.
5. **API Key**: Frontend requires `x-api-key: secretkey` header (see `api.js` interceptor).
6. **Thread Safety**: Database connection pool is thread-safe, but services are stateless (no instance variables).

## Documentation References

- Architecture diagrams: `diagrams/*.puml` (PlantUML) - use `generate_diagrams.bat` to render
- API guides: `docs/api/` (arcgis-integration.md, map-data-api.md)
- Feature docs: `docs/features/` (notifications.md, map-integration.md)
- Maintenance: `MAINTENANCE_GUIDE.md`, `FOLDER_STRUCTURE.md`, `PROJECT_STRUCTURE_OVERVIEW.md`
- Database: `backend/database/README.md`, `CONNECTION_POOL_GUIDE.md`
