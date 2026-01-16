# System/E2E Tests Documentation

## Overview

Automated system and end-to-end (E2E) tests that validate complete user workflows by testing the entire application stack (frontend + backend + database + external services) through browser automation.

**Framework:** pytest-bdd (Behavior-Driven Development)  
**Browser Automation:** Playwright  
**Test Count:** 15+ scenarios  
**Coverage:** Authentication, Chat, Map Integration

---

## Architecture

### Test Layers

```
┌─────────────────────────────────────────────────┐
│          System/E2E Tests (This Layer)          │
│  Browser Automation → Frontend → Backend → DB  │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              API Integration Tests              │
│        HTTP Endpoints (FastAPI TestClient)      │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│               Service Layer Tests               │
│         Routes → Services → Database            │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│                   Unit Tests                    │
│          Individual Functions/Classes           │
└─────────────────────────────────────────────────┘
```

### Technology Stack

- **pytest-bdd**: BDD framework for writing tests in Gherkin syntax
- **Playwright**: Modern browser automation (Chromium, Firefox, WebKit)
- **requests**: API calls for test data setup
- **pytest fixtures**: Reusable test components

---

## Directory Structure

```
tests/system/
├── conftest.py                 # Pytest fixtures and configuration
├── requirements.txt            # System test dependencies
├── features/                   # Gherkin feature files
│   ├── authentication.feature  # Auth scenarios
│   └── chat.feature           # Chat scenarios
├── steps/                      # Step definitions (Python)
│   ├── auth_steps.py          # Authentication step implementations
│   └── chat_steps.py          # Chat step implementations
├── test_auth_system.py        # Auth test scenarios
├── test_chat_system.py        # Chat test scenarios
└── screenshots/               # Error screenshots (auto-generated)
```

---

## Installation

### 1. Install Dependencies

```bash
# From backend directory
cd backend
pip install -r tests/system/requirements.txt
```

### 2. Install Playwright Browsers

```bash
playwright install chromium
# Optional: Install other browsers
playwright install firefox webkit
```

### 3. Verify Installation

```bash
python -c "import pytest_bdd; from playwright.sync_api import sync_playwright; print('✅ Ready')"
```

---

## Running Tests

### Prerequisites

**Both backend and frontend must be running:**

```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --host 127.0.0.1 --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev  # Usually starts on http://localhost:5173
```

### Run All System Tests

**Windows:**

```bash
cd backend
.\run_system_tests.bat
```

**Linux/Mac:**

```bash
cd backend
chmod +x run_system_tests.sh
./run_system_tests.sh
```

### Run Specific Test Files

```bash
# Authentication tests only
pytest tests/system/test_auth_system.py -v

# Chat tests only
pytest tests/system/test_chat_system.py -v
```

### Run Specific Scenarios

```bash
# By test function name
pytest tests/system/test_auth_system.py::test_user_login -v

# By scenario name (using -k)
pytest tests/system/ -k "login with valid" -v
```

### Configuration Options

**Environment Variables:**

```bash
# API backend URL (default: http://127.0.0.1:8000)
export API_BASE_URL=http://localhost:8000

# Frontend URL (default: http://localhost:5173)
export FRONTEND_BASE_URL=http://localhost:5173

# Run browser in headless mode (default: true)
export HEADLESS=false  # Set to false to see browser

# Browser type (default: chromium)
export BROWSER=firefox  # chromium, firefox, or webkit
```

**Example with custom config:**

```bash
# Windows
set HEADLESS=false
set BROWSER=firefox
.\run_system_tests.bat

# Linux/Mac
HEADLESS=false BROWSER=firefox ./run_system_tests.sh
```

---

## Test Scenarios

### Authentication (6 scenarios)

| Scenario                | Description                             | Priority |
| ----------------------- | --------------------------------------- | -------- |
| Successful registration | Register new user with valid data       | Critical |
| Valid login             | Login with correct credentials          | Critical |
| Invalid login           | Login attempt with wrong password       | High     |
| User logout             | Logout and session cleanup              | High     |
| Protected page auth     | Redirect when accessing protected pages | Critical |
| Password reset          | Request password reset email            | Medium   |

### Chat Functionality (9 scenarios)

| Scenario           | Description                          | Priority |
| ------------------ | ------------------------------------ | -------- |
| Create new session | Create chat session                  | Critical |
| Send text message  | Send message and receive AI response | Critical |
| View chat history  | Load previous messages               | High     |
| Voice message      | Speech-to-text input                 | Medium   |
| Map interaction    | Chatbot triggers map updates         | High     |
| Delete session     | Remove chat session                  | Medium   |
| Rename session     | Update session title                 | Low      |
| Empty message      | Validate empty input                 | Medium   |
| Multi-language     | Malay/English language support       | High     |

---

## Writing New Tests

### 1. Create Feature File

Create or edit a feature file in `tests/system/features/`:

```gherkin
# tests/system/features/notifications.feature
Feature: Notification System
  As a user
  I want to receive and manage notifications
  So that I stay informed about disasters

  Scenario: View unread notifications
    Given I am logged in as a regular user
    And I have 3 unread notifications
    When I click the notification bell icon
    Then I should see 3 notifications
    And the notification count should show "3"
```

### 2. Create Step Definitions

Add step implementations in `tests/system/steps/`:

```python
# tests/system/steps/notification_steps.py
from pytest_bdd import given, when, then, parsers

@given(parsers.parse("I have {count:d} unread notifications"))
def create_notifications(api_client, registered_user, count):
    """Create test notifications via API"""
    for i in range(count):
        api_client.post("/notifications", json_data={
            "title": f"Test Notification {i+1}",
            "message": "Test message"
        })

@when("I click the notification bell icon")
def click_notification_bell(page):
    page.locator('[data-testid="notification-bell"]').click()

@then(parsers.parse('the notification count should show "{count}"'))
def verify_notification_count(page, count):
    badge = page.locator('.notification-badge')
    assert badge.inner_text() == count
```

### 3. Create Test File

Create test file that imports scenarios:

```python
# tests/system/test_notifications_system.py
from pytest_bdd import scenarios

scenarios('../features/notifications.feature')
```

### 4. Run Your New Tests

```bash
pytest tests/system/test_notifications_system.py -v
```

---

## Fixtures Reference

### Browser Fixtures

- `browser`: Playwright browser instance (session scope)
- `context`: Browser context with isolated storage (function scope)
- `page`: Browser page for interacting with UI (function scope)

### API Fixtures

- `api_client`: API client for backend requests
- `registered_user`: Pre-registered user with auth token
- `admin_credentials`: Admin user credentials

### Helper Fixtures

- `test_user_credentials`: Random test user data
- `authenticated_page`: Browser page with logged-in user

### Example Usage

```python
def test_example(page, api_client, registered_user):
    # page: Browser page for UI interaction
    # api_client: For API calls to setup test data
    # registered_user: User with auth token

    # Setup via API
    api_client.set_auth_token(registered_user["token"])
    api_client.post("/chat/sessions", json_data={"title": "Test"})

    # Interact via UI
    page.goto("http://localhost:5173/chat")
    page.locator("button:has-text('New Chat')").click()
```

---

## Debugging

### Visual Mode (See Browser)

```bash
# Windows
set HEADLESS=false
pytest tests/system/test_auth_system.py::test_user_login -v

# Linux/Mac
HEADLESS=false pytest tests/system/test_auth_system.py::test_user_login -v
```

### Screenshots on Failure

Screenshots are automatically saved to `tests/system/screenshots/` when tests fail.

### Playwright Inspector

Debug with Playwright's interactive inspector:

```bash
PWDEBUG=1 pytest tests/system/test_auth_system.py::test_user_login -v
```

### Verbose Output

```bash
pytest tests/system/ -vv --capture=no
```

---

## Best Practices

### 1. Test Isolation

Each test should be independent:

```python
@pytest.fixture(autouse=True)
def cleanup_after_test(api_client, registered_user):
    """Cleanup test data after each test"""
    yield
    # Cleanup code here
```

### 2. Explicit Waits

Use Playwright's built-in waiting:

```python
# ✅ Good - Wait for element
page.locator("button").wait_for(state="visible")
page.locator("button").click()

# ❌ Bad - Hardcoded sleep
time.sleep(2)
page.locator("button").click()
```

### 3. Robust Selectors

Prefer data attributes over CSS classes:

```python
# ✅ Best - Data attribute
page.locator('[data-testid="login-button"]')

# ✅ Good - Text content
page.locator('button:has-text("Login")')

# ⚠️  Okay - ID
page.locator('#login-btn')

# ❌ Avoid - CSS class (can change)
page.locator('.btn-primary')
```

### 4. Setup via API, Assert via UI

```python
def test_chat_history(api_client, authenticated_page, registered_user):
    # Setup via API (faster)
    api_client.post("/chat/sessions", json_data={"title": "Test"})

    # Assert via UI (user perspective)
    authenticated_page.goto("http://localhost:5173/chat")
    assert authenticated_page.locator('.chat-session').is_visible()
```

---

## Troubleshooting

### Backend Not Running

```
⚠️  WARNING: Backend API is not responding at http://127.0.0.1:8000
```

**Solution:** Start backend server:

```bash
cd backend
uvicorn main:app --host 127.0.0.1 --port 8000
```

### Frontend Not Running

```
⚠️  WARNING: Frontend is not responding at http://localhost:5173
```

**Solution:** Start frontend dev server:

```bash
cd frontend
npm run dev
```

### Playwright Not Installed

```
Error: Playwright is not installed
```

**Solution:**

```bash
pip install playwright
playwright install chromium
```

### Timeout Errors

```
TimeoutError: Timeout 30000ms exceeded
```

**Solution:** Increase timeout or check selector:

```python
# Increase timeout
page.locator("button").click(timeout=60000)

# Or use wait_for
page.wait_for_selector("button", timeout=60000)
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: System Tests

on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install -r tests/system/requirements.txt
          playwright install chromium --with-deps

      - name: Start backend
        run: |
          cd backend
          uvicorn main:app --host 127.0.0.1 --port 8000 &
          sleep 10

      - name: Start frontend
        run: |
          cd frontend
          npm install
          npm run dev &
          sleep 10

      - name: Run system tests
        run: |
          cd backend
          ./run_system_tests.sh
        env:
          HEADLESS: true
          API_BASE_URL: http://127.0.0.1:8000
          FRONTEND_BASE_URL: http://localhost:5173

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-screenshots
          path: backend/tests/system/screenshots/
```

---

## Next Steps

1. **Run existing tests** to verify setup
2. **Add more scenarios** to `features/` files
3. **Implement step definitions** for new scenarios
4. **Add admin workflow tests** (user management, reports)
5. **Add notification tests** (alerts, subscriptions)
6. **Add map integration tests** (GIS queries, layer toggles)

---

## Related Documentation

- [Integration Tests](../integration/README.md) - Service layer integration
- [API Tests](../api/API_TEST_DOCUMENTATION.md) - HTTP endpoint testing
- [Unit Tests](../unit/UNIT_TESTS_DOCUMENTATION.md) - Component testing
- [UAT Plans](../../../tests/uat/) - Manual acceptance tests
