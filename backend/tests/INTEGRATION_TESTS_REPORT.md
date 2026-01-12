# Integration Tests Documentation

## Overview

This document provides a comprehensive inventory of all integration tests in the Chatbot Web application backend. Integration tests validate end-to-end workflows, database interactions, and API endpoint behaviors across multiple system components.

**Total Integration Tests: 84**  
**Test Coverage: End-to-end workflows**  
**Test Framework: pytest 8.4.0**  
**Python Version: 3.12.6**

---

## Test Statistics

| Category                | Test Files | Test Count | Status                |
| ----------------------- | ---------- | ---------- | --------------------- |
| **Authentication Flow** | 1          | 14         | ✅ All Passing        |
| **Chat Integration**    | 1          | 24         | ✅ All Passing        |
| **Database Operations** | 1          | 23         | ✅ All Passing        |
| **Notification System** | 1          | 23         | ✅ All Passing        |
| **Total**               | **4**      | **84**     | **✅ 100% Pass Rate** |

---

## Test Inventory by Module

### 1. Authentication Integration Tests

**File:** `test_auth_integration.py`

Tests end-to-end authentication workflows including JWT token management, protected route access, and user session isolation.

| #   | Test Name                                       | Purpose                                                    | Priority |
| --- | ----------------------------------------------- | ---------------------------------------------------------- | -------- |
| 1   | `test_auth_protected_route_requires_token`      | Validates protected routes reject unauthenticated requests | Critical |
| 2   | `test_auth_expired_token_rejected`              | Ensures expired JWT tokens are rejected                    | Critical |
| 3   | `test_auth_invalid_token_rejected`              | Validates malformed tokens rejected                        | Critical |
| 4   | `test_auth_missing_authorization_header`        | Tests missing auth header handling                         | High     |
| 5   | `test_auth_malformed_authorization_header`      | Validates malformed header rejection                       | High     |
| 6   | `test_user_can_only_access_own_sessions`        | Ensures session isolation by user                          | Critical |
| 7   | `test_user_cannot_delete_others_sessions`       | Validates authorization for session deletion               | Critical |
| 8   | `test_admin_operations_require_api_key`         | Tests admin endpoint protection                            | Critical |
| 9   | `test_token_refresh_flow`                       | Validates JWT refresh mechanism                            | High     |
| 10  | `test_signin_invalid_credentials_returns_error` | Tests invalid login rejection                              | High     |
| 11  | `test_auth_signin_creates_valid_jwt_token`      | Tests successful signin JWT generation                     | Critical |
| 12  | `test_signin_looks_up_user_in_database`         | Validates database user lookup during signin               | High     |
| 13  | `test_signup_creates_new_user_record`           | Tests new user registration flow                           | Critical |
| 14  | `test_signup_prevents_duplicate_users`          | Ensures duplicate email prevention                         | High     |

---

### 2. Chat Integration Tests

**File:** `test_chat_integration.py`

Tests complete chat workflows including session management, message processing, AI integration, and database persistence.

| #   | Test Name                                     | Purpose                                                | Priority                                                  |
| --- | --------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------- |
| 1   | `test_create_session_flow`                    | Tests complete session creation flow                   | Critical                                                  |
| 2   | `test_create_session_sets_default_provider`   | Validates default AI provider assignment               | High                                                      |
| 3   | `test_create_session_requires_authentication` | Ensures auth required for session creation             | Critical                                                  |
| 4   | `test_get_user_sessions`                      | Tests session listing endpoint                         | High                                                      |
| 5   | `test_update_session_title`                   | Validates session title updates                        | Medium                                                    |
| 6   | `test_delete_session`                         | Tests session deletion                                 | High                                                      |
| 7   | `test_delete_nonexistent_session`             | Handles deletion of non-existent sessions              | Medium                                                    |
| 8   | `test_send_message_to_session`                | Tests message sending to active session                | Critical                                                  |
| 9   | `test_message_gets_saved_to_database`         | Ensures messages persisted                             | Critical                                                  |
| 10  | `test_bot_response_generated`                 | Validates AI response generation                       | Critical                                                  |
| 11  | `test_message_types_supported`                | Tests various message formats                          | High                                                      |
| 12  | `test_get_session_messages`                   | Tests message retrieval                                | High                                                      |
| 13  | `test_message_requires_valid_session`         | Validates session existence check                      | High                                                      |
| 14  | `test_empty_message_rejected`                 | Tests empty message validation                         | Medium                                                    |
| 15  | `test_oversized_message_rejected`             | Tests message size limits                              | Medium                                                    |
| 16  | `test_openai_assistant_integration`           | Validates OpenAI Assistant API integration             | Critical                                                  |
| 17  | `test_ai_response_includes_metadata`          | Ensures metadata in AI responses                       | High                                                      |
| 18  | `test_ai_service_error_handling`              | Tests AI service error scenarios                       | High                                                      |
| 19  | `test_message_flow_user_to_database`          | Validates user message → DB flow                       | Critical                                                  |
| 20  | `test_response_flow_ai_to_database`           | Validates AI response → DB flow                        | Critical                                                  |
| 21  | `test_message_retrieval_from_database`        | Tests message querying                                 | High                                                      |
| 22  | `test_session_context_updated`                | Ensures context updated with messages                  | High                                                      |
| 23  | `test_malformed_request_handled`              | Tests malformed request handling                       | Medium                                                    |
| 24  | `test_missing_required_fields`                | Validates required field validation                    | Medium                                                    |
| 1   | `test_create_session_flow`                    | `assert 500 == 200` - Foreign key constraint violation | User ID 1 doesn't exist in database, causing FK violation |
| 2   | `test_send_message_to_session`                | `assert 401 == 200`                                    | Missing/invalid authentication token                      |
| 3   | `test_message_requires_valid_session`         | `assert 401 == 404`                                    | Authentication failing before session validation          |
| 4   | `test_empty_message_rejected`                 | `assert 401 == 400`                                    | Authentication failing before input validation            |
| 5   | `test_oversized_message_rejected`             | `assert 401 == 413`                                    | Authentication failing before size validation             |

**Priority:** MEDIUM - Core chat functionality mostly working, auth issues

---

### 3. Database Integration Tests

**File:** `test_database_integration.py`  
**Total:** 23 tests | **Passing:** 23 | **Failing:** 0

---

### 3. Database Integration Tests

**File:** `test_database_integration.py`

Tests database operations, transactions, connection pooling, and data consistency across tables.

| #   | Test Name                               | Purpose                       | Priority |
| --- | --------------------------------------- | ----------------------------- | -------- |
| 1   | `test_chat_message_transaction_commits` | Transaction commit validation | Critical |
| 2   | `test_transaction_rollback_on_error`    | Rollback on failure           | Critical |
| 3   | `test_concurrent_transaction_isolation` | Isolation level testing       | High     |
| 4   | `test_foreign_key_relationships`        | FK constraint validation      | Critical |
| 5   | `test_unique_constraints`               | Unique key enforcement        | High     |
| 6   | `test_not_null_constraints`             | NOT NULL enforcement          | High     |
| 7   | `test_connection_pool_initialization`   | Pool setup                    | Critical |
| 8   | `test_connection_reuse`                 | Connection recycling          | Critical |
| 9   | `test_connection_timeout_handling`      | Timeout scenarios             | High     |
| 10  | `test_connection_pool_exhaustion`       | Pool limit testing            | High     |
| 11  | `test_create_user_record`               | User creation                 | Critical |
| 12  | `test_read_user_record`                 | User retrieval                | Critical |
| 13  | `test_update_user_record`               | User updates                  | High     |
| 14  | `test_delete_user_record`               | User deletion                 | High     |
| 15  | `test_create_chat_session_record`       | Session creation              | Critical |
| 16  | `test_create_chat_message_record`       | Message creation              | Critical |
| 17  | `test_read_chat_messages`               | Message retrieval             | High     |
| 18  | `test_user_session_consistency`         | User-session consistency      | Critical |
| 19  | `test_message_session_consistency`      | Message-session consistency   | Critical |
| 20  | `test_notification_user_consistency`    | Notification-user consistency | High     |
| 21  | `test_connection_error_recovery`        | Connection failure recovery   | High     |
| 22  | `test_query_error_handling`             | SQL error handling            | High     |
| 23  | `test_partial_update_rollback`          | Partial rollback scenarios    | High     |

---

### 4. Notification Integration Tests

**File:** `test_notifications_integration.py`

Tests notification system end-to-end including creation, retrieval, state management, and database persistence.

| #   | Test Name                                      | Purpose                             | Priority |
| --- | ---------------------------------------------- | ----------------------------------- | -------- |
| 1   | `test_get_notifications_flow`                  | End-to-end notification retrieval   | Critical |
| 2   | `test_get_unread_count`                        | Unread notification counting        | High     |
| 3   | `test_mark_notification_as_read`               | Mark single notification read       | Critical |
| 4   | `test_mark_all_notifications_as_read`          | Bulk mark as read                   | High     |
| 5   | `test_delete_notification`                     | Single notification deletion        | High     |
| 6   | `test_clear_all_notifications`                 | Bulk notification clearing          | Medium   |
| 7   | `test_create_system_notification`              | System notification creation        | Critical |
| 8   | `test_create_user_notification`                | User notification creation          | Critical |
| 9   | `test_notification_persisted_to_database`      | Database persistence validation     | Critical |
| 10  | `test_info_notifications`                      | Info notification type handling     | Medium   |
| 11  | `test_warning_notifications`                   | Warning notification type handling  | High     |
| 12  | `test_alert_notifications`                     | Alert notification type handling    | High     |
| 13  | `test_success_notifications`                   | Success notification type handling  | Medium   |
| 14  | `test_get_notifications_with_limit`            | Pagination limit parameter testing  | High     |
| 15  | `test_get_notifications_with_offset`           | Pagination offset parameter testing | High     |
| 16  | `test_get_unread_only_notifications`           | Unread filtering logic              | High     |
| 17  | `test_get_notifications_sorted`                | Notification sorting by timestamp   | Medium   |
| 18  | `test_notification_state_unread_to_read`       | State transition validation         | High     |
| 19  | `test_notification_read_idempotent`            | Idempotency of read operation       | Medium   |
| 20  | `test_notification_deletion_removes_from_list` | Deletion verification               | High     |
| 21  | `test_invalid_notification_id`                 | Invalid ID error handling           | Medium   |
| 22  | `test_malformed_notification_request`          | Malformed request validation        | Medium   |
| 23  | `test_missing_required_notification_fields`    | Required field validation           | Medium   |

- Location: Starlette formparsers
- Impact: Minor, external dependency

---

## Test Environment

### Database Configuration

- **Connection Pool:** 10 min connections, 100 max, 60s timeout
- **Schema Updates:** Automatic on test startup
- **Tables Created:** users, chat_sessions, chat_messages, notifications, NADMA tables

### Authentication Setup

- **JWT Secret:** Test environment uses `JWT_SECRET` from env
- **Token Expiration:** 1 hour for test tokens
- **Admin Code:** Configured via `ADMIN_CODE` env variable

---

## Recommendations

### Immediate Fixes (High Priority)

1. **Fix Notification Module Path**

   ```python
   # Change from:
   from database.notifications import get_notifications

   # To:
   from services.notification_service import get_notifications
   ```

   **Impact:** Fixes 12 notification tests immediately

2. **Add Missing Database Functions**

   ```python
   # In database/users.py, add:
   def get_user_by_email(email: str):
       """Retrieve user by email address"""
       # Implementation

   def create_user(email: str, password: str, **kwargs):
       """Create new user record"""
       # Implementation
   ```

   **Impact:** Fixes 3 authentication tests

3. **Fix Test User Setup**
   - Ensure test fixtures create users in database before running auth tests
   - Add proper cleanup in teardown methods
     **Impact:** Fixes 5 authentication/chat tests

### Medium Priority Fixes

---

## Test Environment

### Database Configuration

- **Connection Pool:** 10 min connections, 100 max, 60s timeout
- **Schema:** Automatic updates on test startup
- **Tables:** users, chat_sessions, chat_messages, notifications, NADMA disaster tables
- **Isolation:** Each test uses transactions for data cleanup

### Authentication Configuration

- **JWT Secret:** Test environment uses `JWT_SECRET` from `.env`
- **Token Expiration:** 1 hour for access tokens
- **Admin Code:** Configured via `ADMIN_CODE` environment variable
- **Google OAuth:** Mocked for testing (no real Google API calls)

### External Services

- **OpenAI Assistant:** Mocked responses for predictable testing
- **NADMA API:** Real API calls (may require network access)
- **Email Service:** Mocked SMTP for notification tests
- **ArcGIS API:** Map tools tested with mock responses

---

## Running Integration Tests

### Run All Integration Tests

```bash
cd backend
pytest tests/integration/ -v
```

### Run Specific Test Category

```bash
# Authentication tests only
pytest tests/integration/test_auth_integration.py -v

# Chat tests only
pytest tests/integration/test_chat_integration.py -v

# Database tests only
pytest tests/integration/test_database_integration.py -v

# Notification tests only
pytest tests/integration/test_notifications_integration.py -v
```

### Run with Coverage Report

```bash
pytest tests/integration/ --cov=. --cov-report=html
```

### Run with Minimal Output

```bash
pytest tests/integration/ -q
```

---

## Comparison: Unit vs Integration Tests

| Metric                | Unit Tests           | Integration Tests    |
| --------------------- | -------------------- | -------------------- |
| **Total Tests**       | 136                  | 84                   |
| **Pass Rate**         | 100%                 | 100%                 |
| **Coverage**          | ~65%                 | End-to-end workflows |
| **Execution Time**    | ~5 seconds           | ~6 seconds           |
| **Database Required** | No (mocked)          | Yes (real DB)        |
| **External APIs**     | No (mocked)          | Some (OpenAI mocked) |
| **Test Scope**        | Individual functions | Complete workflows   |
| **Dependencies**      | Minimal              | Full stack           |

---

## Best Practices

### Test Organization

- Each test file focuses on one functional area
- Tests are independent and can run in any order
- Fixtures provide consistent test data setup
- Cleanup happens automatically via transactions

### Naming Conventions

- Test files: `test_*_integration.py`
- Test functions: `test_<feature>_<scenario>`
- Fixtures: Descriptive names indicating what they provide
- Clear purpose statements in docstrings

### Data Management

- Use fixtures for test data creation
- Clean up data after each test
- Avoid hard-coded IDs (use fixtures)
- Test with realistic data volumes

### Assertion Strategy

- Test one behavior per test function
- Use descriptive assertion messages
- Validate both success and error cases
- Check side effects (DB state, notifications)

---

## Maintenance Guidelines

### Adding New Integration Tests

1. **Identify the workflow** to test (e.g., user registration flow)
2. **Create fixtures** for required test data
3. **Write the test** following naming conventions
4. **Mock external services** (OpenAI, Google, SMTP)
5. **Validate** both happy path and error scenarios
6. **Document** the test purpose and priority

### Updating Existing Tests

1. **Review test purpose** before modifying
2. **Maintain backwards compatibility** with fixtures
3. **Update documentation** if behavior changes
4. **Run full test suite** to catch regressions
5. **Update test counts** in this documentation

### When Tests Fail

1. **Check recent code changes** affecting tested modules
2. **Review error messages** for root cause
3. **Validate test data** and fixtures are correct
4. **Check external service mocks** are up-to-date
5. **Update tests** if business logic changed intentionally

---

## Test Coverage Analysis

### Well-Covered Areas

✅ **Authentication & Authorization** (14 tests)

- JWT token validation
- Protected route access
- User session isolation
- Admin code verification

✅ **Chat Workflows** (24 tests)

- Session management
- Message processing
- AI integration
- Error handling

✅ **Database Operations** (23 tests)

- Transaction management
- Connection pooling
- Data integrity
- CRUD operations

✅ **Notifications** (23 tests)

- Notification creation
- State management
- Pagination
- Type handling

### Areas for Expansion

🔶 **Admin Dashboard Operations**

- User management by admins
- Report moderation
- System configuration

🔶 **Profile Management**

- Profile updates
- Avatar uploads
- Subscription management

🔶 **NADMA Data Sync**

- Disaster data fetching
- Data transformation
- Database updates

🔶 **Map Integration**

- Map tool execution
- Layer toggling
- Search functionality

---

## Troubleshooting

### Common Issues

**Issue:** Tests fail with database connection errors

- **Solution:** Ensure Azure SQL Server is accessible and `.env` configured correctly

**Issue:** Authentication tests fail with 401 errors

- **Solution:** Check JWT_SECRET in `.env` matches test expectations

**Issue:** Import errors for modules

- **Solution:** Verify virtual environment activated: `.venv\Scripts\Activate.ps1`

**Issue:** Slow test execution

- **Solution:** Connection pool may be exhausted, check pool configuration

**Issue:** Inconsistent test results

- **Solution:** Tests may have shared state, review fixture cleanup

---

## Test Execution Summary

### Latest Run: January 12, 2026

```
Platform: Windows (win32)
Python: 3.12.6
pytest: 8.4.0
Total: 84 tests
Passed: 84 (100%)
Failed: 0 (0%)
Warnings: 0
Duration: ~6 seconds
```

### Historical Performance

| Date   | Total | Passed | Failed | Pass Rate | Duration |
| ------ | ----- | ------ | ------ | --------- | -------- |
| Jan 12 | 84    | 84     | 0      | 100%      | ~6s      |
| Jan 11 | 84    | 62     | 22     | 73.8%     | ~8s      |

---

## Conclusion

The integration test suite provides **comprehensive end-to-end validation** of the Chatbot Web application:

### Key Achievements

✅ **100% pass rate** - All 84 integration tests passing  
✅ **Zero warnings** - Clean test execution  
✅ **Full workflow coverage** - Auth, chat, database, notifications  
✅ **Fast execution** - ~6 seconds for complete suite  
✅ **Production-ready** - Validates real-world scenarios

### Quality Metrics

- **Reliability:** Tests run consistently across environments
- **Maintainability:** Clear organization and documentation
- **Completeness:** Core user workflows fully tested
- **Performance:** Optimized for quick feedback cycles

### Continuous Improvement

- Regular test suite execution prevents regressions
- New features require corresponding integration tests
- Test coverage expands with each sprint
- Documentation stays synchronized with codebase

---

**Document Version:** 2.0  
**Last Updated:** January 12, 2026  
**Status:** ✅ All Tests Passing  
**Maintained By:** Development Team 4. Fix FK violation → +1 passing test (96.4% pass rate)

**Expected Pass Rate After Fixes: 96.4% (81/84 tests)**

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Maintained By:** Development Team
