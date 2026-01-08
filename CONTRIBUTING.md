# Contributing to DisasterWatch

Thank you for your interest in contributing to DisasterWatch! This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

Please be respectful and constructive in all interactions with the community.

## Getting Started

### Prerequisites

**Backend:**

- Python 3.8+
- PostgreSQL or SQLite
- Virtual environment tool

**Frontend:**

- Node.js 16+
- npm or yarn

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/haziqhalifi/Chatbot-Web.git
   cd Chatbot-Web
   ```

2. **Backend Setup**

   ```bash
   cd backend
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env  # Configure your environment variables
   python main.py
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Development Workflow

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/component-name` - Code refactoring
- `docs/update-description` - Documentation updates

### Component Development

When creating new components:

1. **Follow the existing structure**

   - Place in appropriate domain folder (e.g., `components/auth/`, `components/dashboard/`)
   - Create reusable, single-responsibility components

2. **Component template**

   ```jsx
   import React from "react";

   const ComponentName = ({ prop1, prop2 }) => {
     return <div>{/* Component content */}</div>;
   };

   export default ComponentName;
   ```

3. **Export from index.js**
   ```javascript
   export { default as ComponentName } from "./ComponentName";
   ```

## Code Standards

### JavaScript/React

- Use functional components with hooks
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add PropTypes or TypeScript types
- Keep components under 300 lines (refactor if longer)

### Python

- Follow PEP 8 style guide
- Use type hints where applicable
- Write docstrings for functions and classes
- Keep functions focused and single-purpose
- Maximum line length: 100 characters

### CSS/Tailwind

- Use Tailwind utility classes
- Create custom components for repeated patterns
- Maintain responsive design (mobile-first)
- Use semantic color names

## Commit Guidelines

### Commit Message Format

```
type(scope): brief description

Detailed description if needed

Fixes #issue-number
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no functional changes)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(auth): add Google OAuth integration

Implemented Google OAuth sign-in flow with proper token handling
and user profile synchronization.

Fixes #123
```

```
fix(dashboard): resolve disaster table sorting issue

Fixed bug where table sorting was not working correctly for
date columns.

Fixes #456
```

## Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   - Write clean, documented code
   - Add tests if applicable
   - Update documentation

3. **Test your changes**

   - Run backend tests: `pytest`
   - Run frontend tests: `npm test`
   - Manual testing in browser

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push to your branch**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to GitHub repository
   - Click "New Pull Request"
   - Fill in the PR template
   - Link related issues

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] PR description clearly explains changes

## Testing

### Backend Tests

```bash
cd backend
pytest
pytest --cov  # With coverage
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:coverage
```

## Documentation

When adding new features:

1. Update relevant markdown files in `docs/`
2. Add JSDoc comments for functions
3. Update README if needed
4. Create diagrams for complex features

## Questions?

- Create an issue for bugs or feature requests
- Check existing documentation in `docs/`
- Review closed PRs for examples

## License

By contributing, you agree that your contributions will be licensed under the project's license.

---

Thank you for contributing to DisasterWatch! 🙏
