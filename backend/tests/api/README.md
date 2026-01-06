# API Test Suite

Comprehensive automated API tests for the Chatbot Web system. Tests all public endpoints with full coverage of authentication, authorization, request validation, response schemas, and error handling.

## Quick Start

### Prerequisites

- Python 3.8+
- pytest and dependencies (installed via `requirements.txt`)

### Run All Tests

**Windows:**

```bash
cd backend
tests\api\run_api_tests.bat all
```

**Linux/macOS:**

```bash
cd backend
chmod +x tests/api/run_api_tests.sh
./tests/api/run_api_tests.sh all
```

**Python:**

```bash
cd backend
python -m pytest tests/api/ -v
```

## Test Suites

### 1. Authentication Tests (`test_auth_endpoints.py`)

- User signup and validation
- User signin with credentials
- Admin authentication
- Password reset and change
- Google OAuth authentication
- JWT token validation
- Authorization header handling

**Key Tests:**

- `TestAuthenticationEndpoints` - Core auth flows
- `TestAuthorizationHeaders` - JWT and token validation
- `TestAPIKeyAuthentication` - API key handling
- `TestHTTPStatusCodes` - Status code validation
- `TestResponseSchemas` - Response format validation

### 2. Chat Endpoints (`test_chat_endpoints.py`)

- Session CRUD operations
- Message creation and retrieval
- Chat response generation
- Message type validation
- Content sanitization (XSS, SQL injection)
- Long messages and special characters

**Key Tests:**

- `TestChatSessionEndpoints` - Session management
- `TestChatMessageEndpoints` - Message operations
- `TestChatGenerationEndpoints` - AI response generation
- `TestChatContentValidation` - Input validation

### 3. Notification Endpoints (`test_notification_endpoints.py`)

- User notifications CRUD
- Unread count tracking
- Bulk operations (mark all as read, clear all)
- Admin notifications
- Notification filters and pagination

**Key Tests:**

- `TestNotificationEndpoints` - Notification management
- `TestProfileEndpoints` - User profile operations
- `TestSubscriptionEndpoints` - Subscription management
- `TestFAQEndpoints` - FAQ management

### 4. Admin & Reports (`test_admin_endpoints.py`)

- Admin dashboard and system status
- Incident reports CRUD
- Report export (CSV, PDF)
- Map/GIS data endpoints
- NADMA disaster data
- System health checks

**Key Tests:**

- `TestAdminEndpoints` - Admin operations
- `TestReportEndpoints` - Report management
- `TestMapDataEndpoints` - Map data operations
- `TestHealthCheckEndpoints` - System health
- `TestDataValidation` - Input validation

## Running Specific Tests

### Run Single Test Class

```bash
python -m pytest tests/api/test_auth_endpoints.py::TestAuthenticationEndpoints -v
```

### Run Single Test

```bash
python -m pytest tests/api/test_auth_endpoints.py::TestAuthenticationEndpoints::test_signup_success -v
```

### Run by Marker

```bash
python -m pytest tests/api/ -m authentication -v
python -m pytest tests/api/ -m security -v
```

### Run Failed Tests Only

```bash
python -m pytest tests/api/ --lf -v
```

## Test Commands

### Using Python Script

```bash
python tests/api/run_api_tests.py --all           # All tests
python tests/api/run_api_tests.py --auth          # Auth tests only
python tests/api/run_api_tests.py --coverage      # With coverage
python tests/api/run_api_tests.py --validate      # Validate setup
```

### Using Batch Script (Windows)

```bash
tests\api\run_api_tests.bat all                    # All tests
tests\api\run_api_tests.bat auth                   # Auth tests only
tests\api\run_api_tests.bat coverage               # With coverage
tests\api\run_api_tests.bat validate               # Validate setup
tests\api\run_api_tests.bat help                   # Show help
```

### Using Shell Script (Linux/macOS)

```bash
./tests/api/run_api_tests.sh all                   # All tests
./tests/api/run_api_tests.sh auth                  # Auth tests only
./tests/api/run_api_tests.sh coverage              # With coverage
./tests/api/run_api_tests.sh validate              # Validate setup
./tests/api/run_api_tests.sh help                  # Show help
```

## Advanced Options

### Coverage Report

```bash
python -m pytest tests/api/ --cov=. --cov-report=html --cov-report=term-missing
```

### HTML Report

```bash
python -m pytest tests/api/ --html=report.html --self-contained-html
```

### Parallel Execution

```bash
python -m pytest tests/api/ -n auto
```

### Verbose Output

```bash
python -m pytest tests/api/ -v -s
```

### Run with Timeout

```bash
python -m pytest tests/api/ --timeout=30
```

## Fixtures

All fixtures are defined in `conftest.py`:

### Authentication Fixtures

- `test_client` - FastAPI test client
- `valid_jwt_token` - Valid JWT token
- `admin_jwt_token` - Admin token
- `expired_jwt_token` - Expired token
- `auth_headers` - Authorization headers
- `admin_headers` - Admin auth headers
- `api_key_header` - API key header

### Data Fixtures

- `sample_user_data` - User registration data
- `sample_chat_session_data` - Chat session data
- `sample_chat_message_data` - Chat message data
- `sample_notification_data` - Notification data
- `sample_profile_data` - Profile data
- `sample_subscription_data` - Subscription data
- `sample_faq_data` - FAQ data
- `sample_report_data` - Report data

## Test Coverage

### Status Codes Tested

- **2xx Success:** 200, 201, 204
- **4xx Client Errors:** 400, 401, 403, 404, 422
- **5xx Server Errors:** 500, 502, 503

### Authentication Methods

- ✓ JWT Bearer tokens
- ✓ API key headers
- ✓ Admin codes
- ✓ OAuth (Google)

### Validation

- ✓ Required fields
- ✓ Email format
- ✓ Password strength
- ✓ Data types
- ✓ Field lengths
- ✓ XSS prevention
- ✓ SQL injection prevention

### Authorization

- ✓ Missing token → 401
- ✓ Invalid token → 401
- ✓ Expired token → 401
- ✓ Non-admin access → 403
- ✓ Wrong user's data → 403/404

## Environment Variables

Required environment variables (from `.env` file):

```env
JWT_SECRET=your-jwt-secret
DATABASE_CONNECTION_STRING=your-connection-string
OPENAI_API_KEY=your-openai-key
OPENAI_ASSISTANT_ID=your-assistant-id
```

## Test Data

Tests use realistic, safe test data:

- Valid email formats
- Strong passwords
- Real location names
- Valid disaster types
- Proper date formats

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run API Tests
  run: |
    cd backend
    python -m pytest tests/api/ --cov=. --cov-report=xml

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

### GitLab CI

```yaml
api_tests:
  image: python:3.9
  script:
    - cd backend
    - pip install -r requirements.txt
    - python -m pytest tests/api/ --cov=. --cov-report=term
```

## Performance

Expected execution times (on standard hardware):

- Full test suite: 30-60 seconds
- Single test class: 5-10 seconds
- Single test: < 1 second

## Troubleshooting

### Tests fail with "401 Unauthorized"

- Ensure JWT_SECRET is set in environment
- Check that test fixtures are initialized

### "ModuleNotFoundError: No module named 'main'"

- Run tests from backend directory
- Ensure PYTHONPATH includes backend root

### "ConnectionError" or database issues

- Verify database connection string
- Ensure SQL Server is accessible
- Check database initialization

### Import errors

- Ensure all dependencies installed: `pip install -r requirements.txt`
- Check PYTHONPATH includes backend directory

## Adding New Tests

1. Create test file in `tests/api/`:

```python
import pytest

class TestNewEndpoint:
    """Test suite for new endpoint"""

    def test_success_case(self, test_client, auth_headers):
        response = test_client.post(
            "/endpoint",
            json={"key": "value"},
            headers=auth_headers
        )
        assert response.status_code == 200
```

2. Add fixtures in `conftest.py` if needed

3. Run tests:

```bash
python -m pytest tests/api/test_new_endpoint.py -v
```

## Documentation

- **[API_TEST_DOCUMENTATION.md](API_TEST_DOCUMENTATION.md)** - Detailed test documentation
- **[pytest.ini](pytest.ini)** - Pytest configuration
- **[conftest.py](conftest.py)** - Test fixtures and configuration

## File Structure

```
tests/api/
├── conftest.py                      # Fixtures and configuration
├── test_auth_endpoints.py           # Auth tests
├── test_chat_endpoints.py           # Chat tests
├── test_notification_endpoints.py   # Notification tests
├── test_admin_endpoints.py          # Admin tests
├── run_api_tests.py                 # Python test runner
├── run_api_tests.bat                # Windows batch script
├── run_api_tests.sh                 # Unix shell script
├── pytest.ini                       # Pytest config
├── API_TEST_DOCUMENTATION.md        # Detailed docs
└── README.md                        # This file
```

## Best Practices

1. **Run tests before committing:**

   ```bash
   python -m pytest tests/api/ -v
   ```

2. **Always test error cases:**

   ```bash
   python -m pytest tests/api/ -m security
   ```

3. **Check coverage regularly:**

   ```bash
   python -m pytest tests/api/ --cov=.
   ```

4. **Validate setup before starting:**
   ```bash
   python tests/api/run_api_tests.py --validate
   ```

## Support

For issues or questions:

1. Check the detailed documentation: `API_TEST_DOCUMENTATION.md`
2. Review test logs: `python -m pytest tests/api/ -v -s`
3. Validate setup: `python tests/api/run_api_tests.py --validate`

## License

Part of the Chatbot Web project.
