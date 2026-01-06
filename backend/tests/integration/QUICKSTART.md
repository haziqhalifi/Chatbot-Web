# Integration Test Quick Start Guide

## Prerequisites

```bash
# Backend dependencies
pip install pytest pytest-asyncio pytest-cov fastapi httpx

# Frontend dependencies  
npm install --save-dev vitest happy-dom
```

## Running Tests

### Quick Start (All Integration Tests)

**Windows:**
```batch
cd backend
run_integration_tests.bat
```

**Linux/Mac:**
```bash
cd backend
chmod +x run_integration_tests.sh
./run_integration_tests.sh
```

### Running Specific Test Categories

```bash
# Authentication tests only
python -m pytest tests/integration/test_auth_integration.py -v

# Chat system tests only
python -m pytest tests/integration/test_chat_integration.py -v

# Notification tests only
python -m pytest tests/integration/test_notifications_integration.py -v

# Database tests only
python -m pytest tests/integration/test_database_integration.py -v
```

### Running Specific Test Classes

```bash
# Auth flow tests
python -m pytest tests/integration/test_auth_integration.py::TestAuthenticationFlow -v

# Chat session tests
python -m pytest tests/integration/test_chat_integration.py::TestChatSessionIntegration -v

# Notification integration tests
python -m pytest tests/integration/test_notifications_integration.py::TestNotificationIntegration -v
```

### Running Individual Tests

```bash
# Specific test
python -m pytest tests/integration/test_chat_integration.py::TestChatSessionIntegration::test_create_session_flow -v
```

### With Coverage Report

```bash
python -m pytest tests/integration/ -v \
    --cov=services \
    --cov=routes \
    --cov=database \
    --cov-report=html

# Open coverage report
# Windows: start coverage_integration/index.html
# Mac: open coverage_integration/index.html
# Linux: xdg-open coverage_integration/index.html
```

## Common Commands

```bash
# Run all tests with output
python -m pytest tests/integration/ -v

# Run tests and stop on first failure
python -m pytest tests/integration/ -x

# Run tests in parallel (faster)
pip install pytest-xdist
python -m pytest tests/integration/ -n auto

# Run tests with detailed traceback
python -m pytest tests/integration/ -vv --tb=long

# Run tests and capture print statements
python -m pytest tests/integration/ -v -s

# Run only slow tests
python -m pytest tests/integration/ -v -m slow

# Run tests excluding slow tests
python -m pytest tests/integration/ -v -m "not slow"

# Run tests by keyword
python -m pytest tests/integration/ -k "auth" -v

# Run tests and show coverage
python -m pytest tests/integration/ -v --cov=. --cov-report=term-missing
```

## Test Execution Flow

### Authentication Tests
```
1. User provides credentials
   ↓
2. System validates against database
   ↓
3. JWT token generated
   ↓
4. Protected routes verify token
   ↓
5. User gains access
```

### Chat System Tests
```
1. User creates chat session
   ↓
2. Session stored in database
   ↓
3. User sends message
   ↓
4. Message saved to database
   ↓
5. AI service generates response
   ↓
6. Response saved to database
   ↓
7. User receives response
```

### Notification Tests
```
1. System creates notification
   ↓
2. Notification stored in database
   ↓
3. User retrieves notifications
   ↓
4. User marks as read
   ↓
5. State updated in database
```

## Debugging Failed Tests

### See more detail:
```bash
python -m pytest tests/integration/test_file.py -vv --tb=long
```

### Print debugging info:
```bash
python -m pytest tests/integration/test_file.py -v -s
```

### Run with logging:
```bash
python -m pytest tests/integration/test_file.py -v --log-cli-level=DEBUG
```

### Check what fixtures are available:
```bash
python -m pytest --fixtures tests/integration/
```

## Expected Test Results

### Successful Run
```
tests/integration/test_auth_integration.py::TestAuthenticationFlow::test_auth_signin_creates_valid_jwt_token PASSED
tests/integration/test_auth_integration.py::TestAuthenticationFlow::test_auth_protected_route_requires_token PASSED
...
Test Files  4 passed (4)
Tests      45 passed (45)
```

### Failed Test Output
```
FAILED tests/integration/test_chat_integration.py::TestChatSessionIntegration::test_create_session_flow
AssertionError: assert 500 == 200
  Expected: 200
  Got: 500
```

## Continuous Integration Setup

Add to `.github/workflows/integration-tests.yml`:

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install -r backend/requirements.txt
      - name: Run integration tests
        run: |
          cd backend
          python -m pytest tests/integration/ -v --cov
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Typical Test Duration

- Single test: < 100ms
- Full auth tests: ~500ms
- Full chat tests: ~1s
- Full notification tests: ~800ms
- Full database tests: ~1.2s
- **Complete suite: ~4-5 seconds**

## Next Steps

1. Run the tests locally: `run_integration_tests.bat` (Windows) or `./run_integration_tests.sh` (Linux/Mac)
2. Review any failures in the test output
3. Check coverage report in `coverage_integration/index.html`
4. Read full documentation in [README.md](README.md)
5. Add new integration tests for new features

## Troubleshooting

### Tests not found
```bash
# Make sure you're in the backend directory
cd backend
python -m pytest tests/integration/ -v
```

### Import errors
```bash
# Set Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
python -m pytest tests/integration/ -v
```

### Permission denied on .sh file
```bash
chmod +x run_integration_tests.sh
./run_integration_tests.sh
```

### Port already in use
Some tests may try to start a server. Ensure port 8000 is available:
```bash
# Linux/Mac: Check what's using port 8000
lsof -i :8000

# Windows: Check what's using port 8000
netstat -ano | findstr :8000
```

## Support

For more information, see [Integration Tests README](README.md)
