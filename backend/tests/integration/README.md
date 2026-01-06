# Integration Test Suite Documentation

## Overview

This document describes the comprehensive integration test suite for the Chatbot Web application. Integration tests verify that different modules, services, and components work together correctly.

## Test Structure

### Backend Integration Tests

Located in: `backend/tests/integration/`

```
tests/integration/
├── conftest.py                          # Shared fixtures and configuration
├── pytest.ini                           # Pytest configuration
├── test_auth_integration.py            # Authentication & Authorization tests
├── test_chat_integration.py            # Chat system integration tests
├── test_notifications_integration.py   # Notification system tests
└── test_database_integration.py        # Database layer tests
```

### Frontend Integration Tests

Located in: `frontend/src/test/integration/`

```
src/test/integration/
└── integration.test.js                 # Frontend integration tests
```

## Test Categories

### 1. Authentication & Authorization (`test_auth_integration.py`)

Tests the complete auth workflow:

- **SignIn Flow**: Credentials → JWT Token → Protected Routes
- **Token Validation**: Expiration, malformed tokens, invalid signatures
- **Access Control**: User isolation, session boundaries
- **Database Integration**: User creation, credential verification
- **Error Handling**: Invalid credentials, duplicate users

**Key Test Classes:**

- `TestAuthenticationFlow` - Complete auth workflows
- `TestAuthorizationFlow` - Access control and permissions
- `TestAuthIntegrationWithDatabase` - Database interaction during auth

### 2. Chat System (`test_chat_integration.py`)

Tests the complete chat workflow:

- **Session Management**: Create, retrieve, update, delete sessions
- **Message Exchange**: Send messages, receive responses
- **AI Integration**: OpenAI Assistant integration, response generation
- **Data Persistence**: Messages saved to database
- **Error Handling**: Invalid sessions, service failures

**Key Test Classes:**

- `TestChatSessionIntegration` - Session lifecycle
- `TestChatMessageIntegration` - Message sending and receiving
- `TestChatAIIntegration` - AI service integration
- `TestChatDataFlow` - Data persistence and retrieval
- `TestChatErrorHandling` - Error scenarios

### 3. Notifications (`test_notifications_integration.py`)

Tests the notification system:

- **Notification Retrieval**: Fetch, filter, paginate
- **State Management**: Mark as read, delete, clear
- **Types**: Different notification types (alert, info, warning)
- **Persistence**: Save and retrieve from database
- **Filtering**: By type, read status, timestamp

**Key Test Classes:**

- `TestNotificationIntegration` - Basic notification operations
- `TestNotificationCreation` - Notification creation flow
- `TestNotificationTypes` - Different notification types
- `TestNotificationFiltering` - Filtering and pagination
- `TestNotificationState` - State transitions and management

### 4. Database Layer (`test_database_integration.py`)

Tests database operations and integrity:

- **Transactions**: Commit, rollback, isolation
- **Data Integrity**: Foreign keys, unique constraints
- **Connection Pooling**: Pool management, reuse, timeouts
- **CRUD Operations**: Create, Read, Update, Delete
- **Data Consistency**: Relationships across tables
- **Error Recovery**: Connection failures, query errors

**Key Test Classes:**

- `TestDatabaseTransactions` - Transaction handling
- `TestDatabaseIntegrity` - Constraint enforcement
- `TestDatabaseConnectionPool` - Pool management
- `TestDatabaseCRUDOperations` - Basic data operations
- `TestDatabaseDataConsistency` - Cross-table consistency

### 5. Frontend Integration

Tests frontend component interactions:

- **Chat Flow**: Session creation, message exchange
- **Auth Integration**: Login, token management
- **Notifications**: Real-time updates, state sync
- **Settings Persistence**: LocalStorage operations
- **API Error Handling**: Retry logic, error recovery
- **Form Integration**: Validation, submission
- **Caching**: Cache invalidation, expiration

## Running the Tests

### Backend Integration Tests

#### Linux/Mac:

```bash
cd backend
chmod +x run_integration_tests.sh
./run_integration_tests.sh
```

#### Windows:

```bash
cd backend
run_integration_tests.bat
```

#### With pytest directly:

```bash
cd backend
python -m pytest tests/integration/ -v
```

#### Run specific test file:

```bash
python -m pytest tests/integration/test_chat_integration.py -v
```

#### Run specific test class:

```bash
python -m pytest tests/integration/test_chat_integration.py::TestChatSessionIntegration -v
```

#### Run specific test:

```bash
python -m pytest tests/integration/test_chat_integration.py::TestChatSessionIntegration::test_create_session_flow -v
```

#### With coverage report:

```bash
python -m pytest tests/integration/ -v --cov=services --cov=routes --cov=database --cov-report=html
```

### Frontend Integration Tests

#### Run integration tests:

```bash
cd frontend
npm run test -- src/test/integration/integration.test.js
```

#### Watch mode:

```bash
npm run test:watch
```

#### With coverage:

```bash
npm run test:coverage
```

## Test Fixtures

### Backend Fixtures (conftest.py)

#### Database Fixtures

- `mock_db_connection` - Mock database connection
- `mock_create_chat_session` - Mock session creation
- `mock_get_chat_session` - Mock session retrieval
- `mock_save_chat_message` - Mock message saving

#### Authentication Fixtures

- `valid_jwt_token` - Valid JWT token
- `expired_jwt_token` - Expired JWT token
- `auth_headers` - Authorization headers with valid token
- `mock_user_service` - Mocked user service

#### Service Fixtures

- `mock_openai_service` - Mock OpenAI API client
- `mock_notification_service` - Mock notification service

#### Test Client Fixtures

- `client` - FastAPI TestClient
- `integration_test_env` - Environment setup for tests

#### Helper Fixtures

- `chat_session_request` - Builder for chat session requests
- `chat_message_request` - Builder for chat message requests
- `capture_logs` - Log capture for debugging

## Test Patterns

### 1. Setup and Teardown

```python
def test_something(client, auth_headers, mock_db):
    # Setup
    data = setup_test_data()

    # Act
    response = client.post('/endpoint', json=data, headers=auth_headers)

    # Assert
    assert response.status_code == 200

    # Cleanup is automatic with fixtures
```

### 2. Mocking External Services

```python
def test_with_mocked_service(client, mock_openai_service):
    # Mock service is already patched
    response = client.post('/chat/generate', json={...})

    # Verify service was called
    assert mock_openai_service.call_count > 0
```

### 3. Testing Error Paths

```python
def test_error_handling(client):
    with patch('service.method') as mock:
        mock.side_effect = Exception('Service error')

        response = client.post('/endpoint', json={...})

        assert response.status_code in [500, 502, 503]
```

### 4. Testing Data Flow

```python
def test_data_persistence(client, mock_save_message, mock_get_messages):
    # Send message
    response = client.post('/chat/generate', json={...})

    # Verify persisted
    messages = mock_get_messages(session_id=1)
    assert len(messages) > 0
```

## Mocking Strategy

### What to Mock

- **External APIs**: OpenAI, NADMA, Google
- **Email Services**: SMTP, SendGrid
- **File Storage**: S3, local filesystem (for rapid tests)

### What NOT to Mock

- Internal service interactions (chat_service → database)
- Database operations (use in-memory DB or fixtures)
- HTTP requests between API routes and services
- Request/response parsing and validation

## Coverage Goals

- **Services**: 70%+ coverage
- **Routes**: 60%+ coverage (excluding WebSocket)
- **Database**: 50%+ coverage (focus on happy paths)
- **Overall**: 65%+ coverage

## Continuous Integration

### GitHub Actions Example

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.11
      - name: Install dependencies
        run: |
          pip install -r backend/requirements.txt
      - name: Run integration tests
        run: |
          cd backend
          python -m pytest tests/integration/ -v --cov
```

## Common Issues and Solutions

### Issue: Tests timeout

**Solution**: Add timeout markers and increase fixture timeouts

```python
@pytest.mark.timeout(10)
def test_something(client):
    ...
```

### Issue: Database state pollution

**Solution**: Ensure proper fixture cleanup

```python
@pytest.fixture
def clean_db():
    # Setup
    yield
    # Cleanup - always runs
    db.clear()
```

### Issue: Flaky tests

**Solution**: Add retries and proper waiting

```python
@pytest.mark.flaky(reruns=3)
def test_async_operation(client):
    ...
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Clarity**: Test names should describe what they test
3. **Speed**: Mock external services to keep tests fast
4. **Comprehensiveness**: Test happy paths AND error cases
5. **Maintainability**: Use fixtures to reduce duplication
6. **Documentation**: Document complex test scenarios
7. **Consistency**: Follow naming conventions and patterns

## Debugging Failed Tests

### View test output:

```bash
python -m pytest tests/integration/test_file.py -v -s
```

### Run specific test with debugging:

```bash
python -m pytest tests/integration/test_file.py::TestClass::test_method -vv --tb=long
```

### Capture logs:

```python
def test_with_logs(client, caplog):
    import logging
    caplog.set_level(logging.DEBUG)

    response = client.post('/endpoint', json={...})

    # View logs
    print(caplog.text)
```

## Related Documentation

- [Backend Unit Tests](../unit/README.md)
- [Frontend Unit Tests](../../frontend/src/test/README.md)
- [API Documentation](../../docs/api/)
- [Architecture Guide](../../docs/architecture/)

## Contributing

When adding new integration tests:

1. Create test file in appropriate subdirectory
2. Use provided fixtures from `conftest.py`
3. Follow naming conventions (`test_` prefix)
4. Add docstrings explaining test purpose
5. Include both success and error cases
6. Update this documentation
7. Ensure tests pass locally before submitting PR

## Support

For issues or questions about integration tests, contact the QA team.
