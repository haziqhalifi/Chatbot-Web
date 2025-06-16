# Modular Backend Structure

This backend has been refactored into a modular structure for better maintainability and organization.

## Structure Overview

```
backend/
├── main.py                 # Main FastAPI application entry point
├── routes/                 # Route modules (endpoints organized by feature)
│   ├── __init__.py        # Routes package
│   ├── utils.py           # Shared utilities for routes
│   ├── auth.py            # Authentication endpoints
│   ├── ai.py              # AI/ML endpoints (generate, transcribe)
│   ├── reports.py         # Disaster report endpoints
│   ├── profile.py         # User profile endpoints
│   ├── notifications.py   # Notification system endpoints
│   ├── subscriptions.py   # Subscription management endpoints
│   ├── chat.py            # Chat session endpoints
│   ├── admin.py           # Admin dashboard & FAQ endpoints
│   └── dev.py             # Development/debugging endpoints
├── [existing files...]    # All other existing files remain unchanged
```

## Key Changes

### 1. Main Application (`main.py`)
- Reduced from ~800+ lines to ~65 lines
- Only contains app initialization, middleware setup, and route registration
- Exports `API_KEY_CREDITS` for use by route modules

### 2. Route Modules
Each route module contains:
- Related endpoints grouped by functionality
- Pydantic models specific to that module
- Helper functions if needed
- Proper imports and error handling

### 3. Shared Utilities (`routes/utils.py`)
- Common authentication helper functions
- JWT token validation
- API key credit access

## Benefits

1. **Better Organization**: Related endpoints are grouped together
2. **Easier Maintenance**: Changes to specific features are isolated
3. **Improved Readability**: Smaller, focused files
4. **Reduced Coupling**: Clear separation of concerns
5. **Easier Testing**: Individual modules can be tested independently

## Route Modules Breakdown

### `auth.py`
- `/signup` - User registration
- `/signin` - User login
- `/admin/signin` - Admin login with verification code
- `/google-auth` - Google OAuth authentication

### `ai.py`
- `/generate` - AI text generation
- `/transcribe` - Audio transcription

### `reports.py`
- `/report` - Submit disaster reports
- `/admin/reports` - Get all reports (admin)
- `/admin/reports/{id}` - Get specific report (admin)

### `profile.py`
- `/profile` - Get/update user profile

### `notifications.py`
- `/notifications/*` - User notification management
- `/admin/notifications/*` - Admin notification management

### `subscriptions.py`
- `/subscriptions/*` - Disaster alert subscriptions

### `chat.py`
- `/chat/*` - Chat session management and AI responses

### `admin.py`
- `/admin/dashboard/*` - Dashboard statistics
- `/admin/system/*` - System status
- `/rebuild-rag`, `/rag-status` - RAG system management
- `/performance` - Performance metrics
- `/faqs/*` - FAQ management

### `dev.py`
- `/dev/*` - Development and debugging endpoints

## Migration Notes

- All existing functionality is preserved
- API endpoints remain the same
- No changes to database or other backend files
- The original `main.py` is backed up as `main_backup.py`

## Running the Application

The application runs exactly the same way:
```bash
cd backend
python main.py
```

All endpoints will work as before, but the code is now much more organized and maintainable.
