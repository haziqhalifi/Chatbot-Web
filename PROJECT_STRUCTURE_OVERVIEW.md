# Project Structure Overview

Quick visual reference for the reorganized project structure.

## 📦 Top-Level Organization

```
Chatbot-Web/
│
├─ 📚 docs/                    ← All documentation (organized by type)
│  ├─ guides/                  ← Setup & user guides
│  ├─ architecture/            ← System design docs
│  ├─ features/                ← Feature documentation
│  ├─ api/                     ← External API integration guides
│  └─ README.md                ← Documentation index
│
├─ 🔧 backend/                 ← FastAPI Python backend
│  ├─ app/                     ← Main application code
│  │  ├─ api/                  ← HTTP route handlers
│  │  ├─ services/             ← Business logic
│  │  ├─ database/             ← DB operations & models
│  │  ├─ models/               ← Pydantic schemas
│  │  ├─ middleware/           ← Custom middleware
│  │  ├─ utils/                ← Utility functions
│  │  └─ main.py               ← FastAPI app entry point
│  ├─ scripts/                 ← Setup & maintenance scripts
│  ├─ tests/                   ← Unit & integration tests
│  ├─ requirements.txt
│  └─ README.md
│
├─ 🎨 frontend/                ← React/Vite frontend
│  ├─ src/
│  │  ├─ components/           ← Reusable UI components
│  │  ├─ pages/                ← Page components
│  │  ├─ services/             ← API calls
│  │  ├─ hooks/                ← Custom React hooks
│  │  ├─ contexts/             ← Global state (Context API)
│  │  ├─ utils/                ← Helper functions
│  │  ├─ styles/               ← CSS & Tailwind
│  │  ├─ locales/              ← i18n translations
│  │  ├─ App.jsx               ← Root component
│  │  └─ main.jsx              ← Entry point
│  ├─ public/                  ← Static assets
│  ├─ package.json
│  └─ vite.config.js
│
├─ 📊 diagrams/                ← PlantUML architecture diagrams
│
├─ .venv/                      ← Python virtual environment
├─ .env.example                ← Environment template (commit this)
├─ .env                        ← Environment variables (don't commit)
├─ README.md                   ← Main project README
├─ FOLDER_STRUCTURE.md         ← Detailed structure guide
└─ ...
```

## 🎯 Quick Navigation

### 📖 I want to read documentation

→ Start in `docs/README.md` (documentation index)

### 🚀 I want to set up the project

→ Follow `docs/guides/api-keys.md`

### 💻 I want to develop the backend

→ See `backend/README.md` and `backend/app/` code

### 🎨 I want to develop the frontend

→ See `frontend/README.md` and `frontend/src/` code

### 📚 I want to understand the architecture

→ Read `docs/architecture/` and review `diagrams/`

### 🔗 I want to integrate an external API

→ Find the guide in `docs/api/`

### 🧪 I want to run tests

→ See `backend/tests/` and check `docs/guides/TESTING_GUIDE.md`

---

## 🗂️ File Organization Tips

### Backend Python Files

```
backend/app/
├─ api/routes.py              ← HTTP endpoints only
├─ services/chat.py           ← Business logic
├─ database/chat.py           ← SQL queries
└─ models/chat.py             ← Data schemas
```

**Good**: Logic in `services/`, queries in `database/`, routes in `api/`  
**Bad**: Mixing SQL, logic, and routes in one file

### Frontend React Files

```
frontend/src/
├─ components/ChatBox.jsx     ← Reusable UI component
├─ pages/ChatPage.jsx         ← Full page component
├─ services/chatApi.js        ← API calls
└─ hooks/useChat.js           ← Logic reuse
```

**Good**: Components in `components/`, pages in `pages/`, API calls in `services/`  
**Bad**: API calls mixed with UI components

### Documentation Files

```
docs/
├─ guides/setup.md            ← "How to" documentation
├─ features/chat.md           ← Feature explanation
├─ architecture/design.md     ← System design
└─ api/openai.md              ← External API guide
```

---

## ✨ Benefits of This Structure

✅ **Easy to Find Code**: Each concern has its own place  
✅ **Easier Maintenance**: Changes are localized  
✅ **Better Onboarding**: New developers understand the structure  
✅ **Scalability**: Easy to add new features  
✅ **Documentation**: Clear guides for each part

---

## 📝 Next Steps

1. **Review** [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) for detailed explanations
2. **Check** `backend/README.md` and `frontend/README.md` for specific setup
3. **Start with** `docs/README.md` when you need information
4. **Follow** the appropriate guides in `docs/guides/`

---

**Happy coding! 🚀**
