# Modular Structure (Post-Migration)

## Folders

- `app/` - Main application package
  - `main.py` - Entrypoint for FastAPI app
  - `api/` - All API route modules, versioned under `v1/`
  - `core/` - Core logic: config, database, security, settings
  - `models/` - ORM/data models
  - `schemas/` - Pydantic schemas for request/response
  - `services/` - Business logic/services
  - `repositories/` - Data access layer
  - `utils/` - Utility/helper functions
  - `middleware/` - Custom middleware
- `tests/` - Unit and integration tests
- `requirements.txt` - Python dependencies
- `README.md` - Project documentation

## Example Import

```python
from app.api.v1.auth import router as auth_router
from app.core.config import settings
```

## Notes

- All new features should be added under the appropriate subfolder in `app/`.
- API versioning is handled by subfolders in `api/` (e.g., `v1/`).
- Shared logic and configuration should go in `core/`.
