# Maintenance & Development Guide

This guide helps you maintain and develop the project efficiently with the new structure.

## 📝 Common Development Tasks

### Adding a New API Endpoint

**Step 1:** Create the route handler  
File: `backend/app/api/[feature]_routes.py`

```python
@router.post("/endpoint")
async def handle_endpoint(data: YourSchema):
    return await service.process(data)
```

**Step 2:** Create business logic in service  
File: `backend/app/services/[feature]_service.py`

```python
async def process(data):
    # Business logic here
    return result
```

**Step 3:** Add database layer if needed  
File: `backend/app/database/[feature].py`

```python
async def save_data(db, data):
    # Database operations here
    return db_record
```

**Step 4:** Create Pydantic schema  
File: `backend/app/models/[feature].py`

```python
class YourSchema(BaseModel):
    field: str
```

**Step 5:** Write tests  
File: `backend/tests/test_[feature].py`

---

### Adding a New Frontend Feature

**Step 1:** Create reusable components  
Directory: `frontend/src/components/[FeatureName]/`

**Step 2:** Create page if needed  
File: `frontend/src/pages/[FeatureName]Page.jsx`

**Step 3:** Create custom hook for logic  
File: `frontend/src/hooks/use[FeatureName].js`

**Step 4:** Create API service  
File: `frontend/src/services/[feature]Api.js`

**Step 5:** Add context if managing global state  
File: `frontend/src/contexts/[FeatureName]Context.jsx`

---

### Adding Documentation

**For Setup/How-To Guides:**  
→ Add to `docs/guides/[topic].md`

**For Feature Explanations:**  
→ Add to `docs/features/[topic].md`

**For External API Info:**  
→ Add to `docs/api/[api-name].md`

**For Architecture Decisions:**  
→ Add to `docs/architecture/[topic].md`

**Update Documentation Index:**  
→ Edit `docs/README.md` to include your new doc

---

## 🧹 File Organization Checklist

Before committing code, ensure:

- [ ] No `.env` files with secrets are committed (use `.env.example`)
- [ ] Backend utilities are in `utils/`, not scattered
- [ ] Database operations are in `database/`, not in `services/`
- [ ] API routes are in `api/`, not mixed with logic
- [ ] Frontend components are in `components/`, not in `services/`
- [ ] API calls are in `services/`, not in components directly
- [ ] Tests are in the `tests/` directory
- [ ] Documentation is in the `docs/` directory

---

## 📊 Backend Code Flow

```
HTTP Request
    ↓
app/api/routes.py          ← Handles HTTP, validation
    ↓
app/services/service.py    ← Business logic
    ↓
app/database/db.py         ← SQL queries
    ↓
Database
```

### Example: Getting user data

```python
# 1. API Route (app/api/users_routes.py)
@router.get("/users/{id}")
async def get_user(id: int):
    return await user_service.get_by_id(id)

# 2. Business Logic (app/services/user_service.py)
async def get_by_id(id: int):
    user = await user_db.find_by_id(id)
    return format_user(user)

# 3. Database (app/database/users.py)
async def find_by_id(db, id: int):
    return db.query(User).filter(User.id == id).first()

# 4. Schema (app/models/user.py)
class UserResponse(BaseModel):
    id: int
    name: str
```

---

## 🎨 Frontend Component Structure

```
components/
├─ ChatBox/
│  ├─ ChatBox.jsx        ← Main component
│  ├─ ChatBox.module.css ← Component styles
│  └─ useChat.js         ← Logic if needed
│
├─ Button/
│  ├─ Button.jsx
│  └─ Button.module.css
```

**Keep components:**

- Focused (do one thing)
- Reusable (not tied to specific pages)
- Styled (own CSS module)
- Well-documented (prop types, usage examples)

**Don't put in components:**

- API calls (use services/)
- Global state management (use contexts/)
- Page-specific logic (use pages/)

---

## 🔄 Git Workflow with New Structure

### When starting feature work:

```bash
git checkout -b feature/new-feature
```

### Typical files you'll modify:

```
backend/app/api/
backend/app/services/
backend/app/database/
backend/app/models/
frontend/src/components/
frontend/src/services/
docs/guides/ or docs/features/
```

### Before committing:

```bash
# Don't commit:
git rm backend/.env          # Only track .env.example
git rm backend/__pycache__/  # Only track Python files

# Do commit:
git add docs/                # Updated documentation
git add backend/app/         # Code changes
git add frontend/src/        # Code changes
```

---

## 🧪 Testing Strategy

### Backend Tests

Location: `backend/tests/`

```bash
# Run all tests
pytest backend/tests/

# Run specific test
pytest backend/tests/test_chat.py

# Run with coverage
pytest --cov=backend/app backend/tests/
```

### Frontend Tests

Location: `frontend/src/__tests__/` (or using Vitest)

---

## 📈 Monitoring Code Quality

### Code Organization Checklist

Every time you add code, ask:

1. **Is it in the right folder?**

   - API code → `api/`
   - Business logic → `services/`
   - DB queries → `database/`
   - Data models → `models/`
   - Utilities → `utils/`

2. **Is it well-named?**

   - Functions: `get_user()`, `create_chat()`
   - Files: `user_service.py`, `chat_routes.py`
   - Classes: `UserSchema`, `ChatRepository`

3. **Is it documented?**

   - Docstrings for functions
   - Type hints for functions
   - Comments for complex logic
   - README for complex modules

4. **Can it be tested?**
   - Pure functions (no side effects)
   - Dependency injection
   - Clear inputs/outputs

---

## 🚀 Deployment Checklist

Before deploying:

- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] `.env` file properly configured (not committed)
- [ ] Database migrations run
- [ ] API documentation updated in `docs/api/`
- [ ] Frontend build succeeds
- [ ] No commented-out code left
- [ ] All docstrings and comments are accurate

---

## 🆘 Common Issues & Solutions

### "Where should I put this code?"

Use this flowchart:

```
Is it handling HTTP?
  ├─ Yes → app/api/routes.py
  └─ No → Is it business logic?
           ├─ Yes → app/services/
           └─ No → Is it database operations?
                   ├─ Yes → app/database/
                   └─ No → Is it a data model?
                           ├─ Yes → app/models/
                           └─ No → app/utils/
```

### "I need to move a file"

```bash
# Move file (preserves git history)
git mv old/path.py new/path.py

# Update imports in other files
# Then commit
git commit -m "refactor: move [file] to correct location"
```

### "Frontend component is getting too complex"

```
Split into smaller components:
ChatBox.jsx (main)
├─ ChatInput.jsx (input field)
├─ ChatMessages.jsx (message list)
└─ ChatHeader.jsx (header)
```

---

## 📚 Related Documentation

- [Project Structure Overview](./PROJECT_STRUCTURE_OVERVIEW.md)
- [Folder Structure Guide](./FOLDER_STRUCTURE.md)
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Documentation Index](./docs/README.md)

---

**Version**: January 2026  
**Last Updated**: When structure was reorganized
