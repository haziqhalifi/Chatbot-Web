# Backend Structure (Post-Migration)

## Overview

This backend is organized for scalability and maintainability, following modern best practices for FastAPI projects.

## Structure

```
backend/
  app/
    __init__.py
    main.py
    api/
      __init__.py
      v1/
        __init__.py
        auth.py
        ai.py
        reports.py
        profile.py
        notifications.py
        subscriptions.py
        chat.py
        admin.py
        dev.py
    core/
      __init__.py
      config.py
      security.py
      database.py
      settings.py
    models/
      __init__.py
      ...
    schemas/
      __init__.py
      ...
    services/
      __init__.py
      ...
    repositories/
      __init__.py
      ...
    utils/
      __init__.py
      ...
    middleware/
      __init__.py
      ...
  tests/
    unit/
    integration/
  requirements.txt
  README.md
```

- **api/**: All API route modules, versioned under `v1/` for future-proofing.
- **core/**: App-wide core logic (config, startup, security, etc.).
- **models/**: ORM/data models.
- **schemas/**: Pydantic schemas for request/response validation.
- **services/**: Business logic/services.
- **repositories/**: Data access layer.
- **utils/**: Utility functions.
- **middleware/**: Custom middleware.
- **tests/**: Unit and integration tests.

See each folder's README for more details.

## Features

- FastAPI-based REST API
- Handles chat messages and responses
- Database integration (see `database.py`)

## Requirements

- Python 3.12+
- All dependencies in `requirements.txt`

## Setup

1. **Create and activate a virtual environment** (if not already done):

   ```powershell
   python -m venv ..\env
   ..\env\Scripts\Activate.ps1
   ```

   ```CMD
   ..\env\Scripts\activate.bat
   ```

2. **Install dependencies**:

   ```powershell
   pip install -r requirements.txt
   ```

3. **Run the backend server**:

   ```powershell
   ..\env\Scripts\uvicorn.exe main:app --reload
   ```

   The API will be available at `http://127.0.0.1:8000`.

## File Overview

- `main.py` — FastAPI app and route definitions
- `models.py` — Pydantic models and/or ORM models
- `database.py` — Database connection and logic
- `requirements.txt` — Python dependencies

## Development Notes

- Make sure the virtual environment is activated before running or installing anything.
- The backend is designed to work with the frontend in the parent directory.
- Update CORS settings in `main.py` if you change the frontend URL or port.

## License

This backend is for educational purposes.
