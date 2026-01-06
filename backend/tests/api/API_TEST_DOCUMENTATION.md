# API Test Suite Documentation

## Overview

This comprehensive API test suite validates all public endpoints of the Chatbot Web system. It tests HTTP status codes, request/response schemas, authentication, authorization, and edge cases.

## Test Structure

```
tests/api/
├── conftest.py                      # Shared fixtures and configuration
├── test_auth_endpoints.py           # Authentication & authorization tests
├── test_chat_endpoints.py           # Chat session & message tests
├── test_notification_endpoints.py   # Notification management tests
├── test_admin_endpoints.py          # Admin, reports, and system tests
├── API_TEST_DOCUMENTATION.md        # This file
└── pytest.ini                       # Pytest configuration
```

## Test Coverage

### Authentication Endpoints

- **Signup** (`POST /signup`)
  - Valid credentials
  - Missing/invalid email
  - Weak password
  - Duplicate email
- **Sign in** (`POST /signin`)
  - Valid credentials
  - Invalid email/password
  - Missing fields
- **Admin Sign in** (`POST /admin/signin`)
  - Valid admin code
  - Invalid code
  - Missing code
- **Password Management**
  - Forgot password (`POST /forgot-password`)
  - Reset password (`POST /reset-password`)
  - Change password (`POST /change-password`)
- **Google Auth** (`POST /google-auth`)
  - Valid token
  - Invalid token
  - Missing token

### Chat Endpoints

- **Sessions** (`/chat/sessions`)
  - Create session (`POST`)
  - List sessions (`GET`)
  - Get session details (`GET /chat/sessions/{id}`)
  - Update session title (`PUT`)
  - Delete session (`DELETE`)
- **Messages** (`/chat/sessions/{id}/messages`)
  - Post message (`POST`)
  - Get messages (`GET`)
  - Various message types (text, voice, image)
- **Chat Generation** (`POST /chat/generate`)
  - Generate responses
  - Long prompts
  - Empty prompts
  - Invalid session IDs
- **AI Providers** (`GET /chat/providers`)
  - List available providers

### Notification Endpoints

- **User Notifications**
  - Get notifications (`GET /notifications`)
  - Get unread count (`GET /notifications/unread-count`)
  - Mark as read (`PUT /notifications/{id}/read`)
  - Mark all as read (`PUT /notifications/mark-all-read`)
  - Delete notification (`DELETE /notifications/{id}`)
  - Clear all (`DELETE /notifications`)
- **Admin Notifications**
  - Create system notification (`POST /admin/notifications/system`)
  - Create targeted notification (`POST /admin/notifications/targeted`)
  - Send notification (`POST /admin/notifications/send`)

### Profile Endpoints

- **User Profile**
  - Get profile (`GET /profile`)
  - Update profile (`PUT /profile`)
  - Delete account (`DELETE /account`)
- **Subscriptions**
  - Get subscriptions (`GET /subscriptions`)
  - Create subscription (`POST /subscriptions`)
  - Delete subscription (`DELETE /subscriptions`)
  - Get disaster types (`GET /subscriptions/disaster-types`)
  - Get locations (`GET /subscriptions/locations`)

### FAQ Endpoints

- **FAQ Management**
  - List FAQs (`GET /faqs`)
  - Get FAQ by ID (`GET /faqs/{id}`)
  - Create FAQ (`POST /admin/faqs`)
  - Update FAQ (`PUT /admin/faqs/{id}`)
  - Delete FAQ (`DELETE /admin/faqs/{id}`)

### Admin Endpoints

- **Dashboard** (`GET /admin/dashboard/stats`)
- **System Status** (`GET /admin/system/status`)
- **Performance** (`GET /performance`)
- **Reports** (`/admin/reports`)
  - List reports
  - Get report by ID
  - Export as CSV
  - Export as PDF

### Map/GIS Endpoints

- **Endpoints** (`/endpoints`)
  - List endpoints
  - Get by type
- **Disaster Types** (`GET /types`)
- **NADMA Data** (`/nadma/`)
  - Get disasters
  - Post disasters
  - Sync data
  - Get statistics
  - Get history

### Health Check Endpoints

- **Database Health** (`GET /health/database`)
- **Database Stats** (`GET /health/database/stats`)

## Running the Tests

### Run All API Tests

```bash
cd backend
python -m pytest tests/api/ -v
```

### Run Specific Test Class

```bash
python -m pytest tests/api/test_auth_endpoints.py::TestAuthenticationEndpoints -v
```

### Run Specific Test

```bash
python -m pytest tests/api/test_auth_endpoints.py::TestAuthenticationEndpoints::test_signup_success -v
```

### Run with Coverage Report

```bash
python -m pytest tests/api/ --cov=. --cov-report=html
```

### Run Tests with Specific Markers

```bash
python -m pytest tests/api/ -m "authentication" -v
```

### Run Tests with Output

```bash
python -m pytest tests/api/ -v -s
```

### Run Tests in Parallel

```bash
python -m pytest tests/api/ -n auto
```

## Test Fixtures

All test fixtures are defined in `conftest.py`:

### Authentication Fixtures

- `test_client` - FastAPI TestClient instance
- `valid_jwt_token` - Valid JWT token with 1-hour expiration
- `admin_jwt_token` - Admin JWT token
- `expired_jwt_token` - Expired JWT token for negative tests
- `auth_headers` - Authorization headers with valid token
- `admin_headers` - Authorization headers with admin token
- `api_key_header` - API key header

### Data Fixtures

- `sample_user_data` - Valid user registration data
- `sample_admin_code` - Admin authentication code
- `sample_chat_session_data` - Chat session creation data
- `sample_chat_message_data` - Chat message data
- `sample_notification_data` - Notification data
- `sample_profile_data` - User profile data
- `sample_subscription_data` - Subscription data
- `sample_faq_data` - FAQ data
- `sample_report_data` - Incident report data

## Test Categories

### Success Cases (2xx Status Codes)

- Valid requests with proper authentication
- Correct data formats
- Existing resources

### Client Error Cases (4xx Status Codes)

- **400 Bad Request** - Invalid request format
- **401 Unauthorized** - Missing/invalid authentication
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource doesn't exist
- **422 Unprocessable Entity** - Invalid data

### Server Error Cases (5xx Status Codes)

- **500 Internal Server Error** - Server failures
- Service unavailability
- Database connection errors

## Authentication Testing

### JWT Token Validation

Tests verify that:

- Tokens must include Bearer prefix
- Token has 3 parts separated by dots
- Expired tokens are rejected
- Invalid tokens are rejected
- Missing tokens result in 401

### Authorization Testing

Tests verify that:

- Non-admin users cannot access admin endpoints
- Users can only access their own data
- API key is validated when required

## Data Validation Testing

### Input Validation

- Empty strings
- Null values
- Very long strings
- Special characters
- Unicode characters
- XSS payloads
- SQL injection attempts

### Response Validation

- JSON content type
- Valid JSON structure
- Expected fields present
- Data types match schema

## Security Testing

### XSS Prevention

- HTML injection in message content
- JavaScript in session titles
- Script tags in descriptions

### SQL Injection Prevention

- SQL keywords in text fields
- Parameterized query verification

### Authentication

- Bearer token format
- JWT signature validation
- Token expiration

## Performance Considerations

The API tests use realistic data sizes and request patterns:

- Standard messages (< 1000 chars)
- Long prompts (up to 5000 chars)
- Large payloads (1000000 chars for stress testing)
- Pagination limits
- Concurrent requests

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run API Tests
  run: |
    cd backend
    python -m pytest tests/api/ --cov=. --cov-report=xml

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage.xml
```

## Test Data

Tests use realistic test data:

- Valid email formats
- Strong passwords (8+ chars, uppercase, lowercase, numbers)
- Real location names (Kuala Lumpur, Selangor, etc.)
- Valid disaster types (flood, earthquake, landslide)
- Proper ISO date formats

## Expected HTTP Status Codes

| Endpoint         | Method | Success | Failure  | Notes                            |
| ---------------- | ------ | ------- | -------- | -------------------------------- |
| /signup          | POST   | 201     | 400, 409 | May return 409 if user exists    |
| /signin          | POST   | 200     | 401      | -                                |
| /chat/sessions   | POST   | 201     | 401      | Requires authentication          |
| /chat/generate   | POST   | 200     | 404      | May return 500 if AI unavailable |
| /notifications   | GET    | 200     | 401      | -                                |
| /admin/\*        | Any    | 200     | 403      | Requires admin role              |
| /health/database | GET    | 200     | 500      | May fail if DB unavailable       |

## Troubleshooting

### Common Issues

**ModuleNotFoundError: No module named 'main'**

- Ensure you're running tests from the backend directory
- Check that PYTHONPATH includes the backend directory

**401 Unauthorized**

- Verify JWT_SECRET environment variable is set
- Check that test_client is properly initialized

**500 Internal Server Error**

- Check if all database dependencies are available
- Verify OPENAI_API_KEY is set (if testing OpenAI features)
- Check application logs for detailed errors

**Connection Refused**

- Ensure FastAPI app is configured correctly
- Verify database connection string in environment variables

## Adding New Tests

To add new API tests:

1. Create test class in appropriate file:

```python
class TestNewEndpoint:
    """Test suite for new endpoint"""

    def test_success_case(self, test_client, auth_headers):
        response = test_client.get("/new-endpoint", headers=auth_headers)
        assert response.status_code == 200
```

2. Add test fixture in `conftest.py` if needed:

```python
@pytest.fixture
def sample_new_data():
    return {"key": "value"}
```

3. Run tests:

```bash
python -m pytest tests/api/test_new_file.py -v
```

## Maintenance

Regular maintenance tasks:

- Update test data to match API schema changes
- Review and update expected status codes
- Add tests for new endpoints
- Remove tests for deprecated endpoints
- Update documentation as APIs evolve

## Performance Baseline

Expected test execution times (on standard hardware):

- Full API test suite: 30-60 seconds
- Single test class: 5-10 seconds
- Single test: < 1 second

## References

- [FastAPI Testing Documentation](https://fastapi.tiangolo.com/advanced/testing-events/)
- [Pytest Documentation](https://docs.pytest.org/)
- [JWT.io](https://jwt.io/)
- [HTTP Status Codes](https://httpwg.org/specs/rfc7231.html#status.codes)
