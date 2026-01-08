# DisasterWatch - Project Structure

This document outlines the organizational structure of the DisasterWatch repository for better maintainability and navigation.

## 📁 Repository Structure

```
Chatbot-Web/
├── .github/              # GitHub specific files
│   └── workflows/        # CI/CD workflows (future use)
│
├── backend/              # Python FastAPI backend
│   ├── app/             # Application modules
│   ├── config/          # Configuration files
│   ├── database/        # Database models and operations
│   ├── middleware/      # Custom middleware
│   ├── models/          # Data models
│   ├── repositories/    # Data access layer
│   ├── routes/          # API route handlers
│   ├── scripts/         # Backend utility scripts
│   ├── services/        # Business logic layer
│   ├── tests/           # Backend tests
│   ├── utils/           # Utility functions
│   ├── main.py          # Application entry point
│   ├── requirements.txt # Python dependencies
│   └── README.md        # Backend documentation
│
├── frontend/            # React frontend application
│   ├── public/          # Static assets
│   ├── src/             # Source code
│   │   ├── api/         # API client and configurations
│   │   ├── components/  # Reusable React components
│   │   │   ├── account/      # Account page components
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── dashboard/    # Dashboard components
│   │   │   └── settings/     # Settings components
│   │   ├── contexts/    # React Context providers
│   │   ├── pages/       # Page components
│   │   ├── styles/      # Global styles
│   │   └── utils/       # Frontend utilities
│   ├── package.json     # Node dependencies
│   └── README.md        # Frontend documentation
│
├── docs/                # Project documentation
│   ├── api/             # API documentation
│   ├── architecture/    # Architecture diagrams and docs
│   ├── features/        # Feature documentation
│   ├── guides/          # User and developer guides
│   ├── maintenance/     # Maintenance guides
│   │   ├── FOLDER_STRUCTURE.md
│   │   ├── MAINTENANCE_GUIDE.md
│   │   ├── PROJECT_STRUCTURE_OVERVIEW.md
│   │   └── RESTRUCTURING_SUMMARY.md
│   ├── setup/           # Setup instructions
│   │   └── ADMIN_EMAIL_VERIFICATION_SETUP.md
│   └── README.md        # Documentation index
│
├── diagrams/            # PlantUML and architecture diagrams
│   ├── *.puml           # PlantUML diagram sources
│   └── README.md        # Diagram documentation
│
├── scripts/             # Utility scripts
│   ├── generate_diagrams.bat    # Generate diagrams (Windows)
│   ├── generate_diagrams.sh     # Generate diagrams (Unix)
│   ├── run_integration_tests.bat
│   ├── run_integration_tests.sh
│   └── setup_openai.bat
│
├── tests/               # Integration and E2E tests
│   └── uat/            # User acceptance tests
│
├── .gitignore          # Git ignore rules
└── README.md           # Main project README
```

## 🎯 Key Directories Explained

### Backend Structure

- **`app/`**: Core application modules and functionality
- **`config/`**: Configuration management (database, settings, models)
- **`database/`**: Database schema, connections, and operations
- **`routes/`**: API endpoint definitions (auth, chat, admin, map, etc.)
- **`services/`**: Business logic separated from routes
- **`middleware/`**: Custom middleware (error handling, rate limiting, database)
- **`utils/`**: Shared utility functions

### Frontend Structure

- **`components/`**: Organized by feature/domain
  - `account/`: Account management UI components
  - `auth/`: Authentication forms and UI
  - `dashboard/`: Dashboard-specific components
  - `settings/`: Settings page components
- **`pages/`**: Top-level page components
- **`contexts/`**: React Context for global state
- **`api/`**: API client and request handlers

### Documentation Structure

- **`api/`**: REST API endpoint documentation
- **`architecture/`**: System design and architecture docs
- **`features/`**: Individual feature documentation
- **`guides/`**: Step-by-step guides for users/developers
- **`maintenance/`**: Maintenance and operational guides
- **`setup/`**: Initial setup instructions

## 🔄 Recent Improvements

### Documentation Organization

- Moved all markdown files from root to appropriate `docs/` subdirectories
- Created logical groupings: `setup/`, `maintenance/`, `guides/`
- Centralized documentation for easier discovery

### Scripts Consolidation

- All scripts now in single `scripts/` directory
- Includes build, test, and utility scripts
- Easier to find and manage automation scripts

### Component Modularization

- Refactored large page components into smaller, reusable pieces
- Created domain-specific component folders
- Improved code reusability and testability

## 📝 Naming Conventions

### Files

- **Components**: PascalCase (e.g., `ProfilePictureCard.jsx`)
- **Utilities**: camelCase (e.g., `formatDate.js`)
- **Config files**: lowercase with underscores (e.g., `database_config.py`)

### Directories

- **Lowercase with hyphens** for multi-word names (e.g., `user-management/`)
- **Singular names** for utilities, config
- **Plural names** for collections (e.g., `components/`, `routes/`)

## 🚀 Getting Started

1. **Backend**: See [backend/README.md](../backend/README.md)
2. **Frontend**: See [frontend/README.md](../frontend/README.md)
3. **Documentation**: Browse [docs/](../docs/) for detailed guides

## 📚 Related Documentation

- [Maintenance Guide](./maintenance/MAINTENANCE_GUIDE.md)
- [Architecture Overview](./architecture/)
- [API Documentation](./api/)
- [Setup Instructions](./setup/)

---

**Last Updated**: January 2026
