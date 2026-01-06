# Security Testing Suite

Comprehensive security testing for the Chatbot Web application.

## Overview

This security testing suite includes:
- **Authentication & Authorization Tests** - JWT validation, token security, RBAC
- **Injection Attack Prevention** - SQL, XSS, Command, LDAP injection tests
- **CORS & CSRF Protection** - Cross-origin and cross-site request forgery tests
- **Security Headers** - HTTP security header validation
- **Data Validation** - Input validation and sanitization tests
- **Rate Limiting & DOS Prevention** - Rate limiting and brute-force protection
- **Manual Security Checklist** - Comprehensive manual testing guide

## Test Structure

```
tests/security/
├── __init__.py
├── conftest.py
├── test_auth_security.py           # Authentication & authorization
├── test_injection_attacks.py        # Injection attack prevention
├── test_cors_csrf_headers.py        # CORS, CSRF, security headers
├── test_data_validation.py          # Data validation & rate limiting
├── MANUAL_TESTING_CHECKLIST.md      # Manual testing guide
└── README.md                        # This file
```

## Test Categories

### 1. Authentication & Authorization Tests (`test_auth_security.py`)

Tests for JWT token validation, authentication bypass, role-based access control, and session security.

**Test Classes:**
- `TestJWTTokenValidation` - JWT token validation
- `TestAuthenticationBypass` - Authentication bypass attempts
- `TestRoleBasedAccessControl` - RBAC enforcement
- `TestSessionSecurity` - Session handling
- `TestCredentialValidation` - Password security
- `TestBruteForceProtection` - Brute-force attack prevention

**Key Tests:**
- ✓ Valid/invalid/expired token handling
- ✓ Token tampering detection
- ✓ Role elevation prevention
- ✓ Weak password rejection
- ✓ Failed login attempt tracking
- ✓ Account lockout enforcement

### 2. Injection Attack Prevention (`test_injection_attacks.py`)

Tests for SQL, XSS, command, LDAP injection, and path traversal prevention.

**Test Classes:**
- `TestSQLInjectionPrevention` - SQL injection prevention
- `TestXSSPrevention` - Cross-Site Scripting prevention
- `TestCommandInjectionPrevention` - Command injection prevention
- `TestPathTraversalPrevention` - Path traversal attack prevention
- `TestLDAPInjectionPrevention` - LDAP injection prevention
- `TestInputValidationGeneral` - General input validation

**Key Tests:**
- ✓ SQL injection payload detection
- ✓ Parameterized query usage
- ✓ Script tag escaping
- ✓ Event handler removal
- ✓ JavaScript protocol blocking
- ✓ Shell metacharacter escaping
- ✓ Path traversal sequence blocking
- ✓ Null byte rejection

### 3. CORS, CSRF & Security Headers (`test_cors_csrf_headers.py`)

Tests for CORS configuration, CSRF token validation, and security header presence.

**Test Classes:**
- `TestCORSValidation` - CORS configuration validation
- `TestCSRFProtection` - CSRF token validation
- `TestSecurityHeaders` - HTTP security headers
- `TestHTTPSEnforcement` - HTTPS/TLS enforcement
- `TestCookieSecurity` - Cookie security attributes
- `TestHTTPParameterPollution` - HTTP parameter handling

**Key Tests:**
- ✓ Allowed origins configuration
- ✓ Wildcard CORS prevention
- ✓ CSRF token generation and validation
- ✓ CSP, X-Frame-Options, HSTS headers
- ✓ Cookie HttpOnly/Secure flags
- ✓ SameSite attribute validation

### 4. Data Validation & Rate Limiting (`test_data_validation.py`)

Tests for input validation, rate limiting, DOS prevention, and resource limits.

**Test Classes:**
- `TestDataValidation` - Input validation and sanitization
- `TestRateLimiting` - Rate limiting enforcement
- `TestBruteForceProtection` - Brute-force protection
- `TestDOSPrevention` - DOS/DDOS prevention
- `TestResourceLimits` - Resource quotas and limits

**Key Tests:**
- ✓ Email/URL/phone validation
- ✓ String length limits
- ✓ Null byte prevention
- ✓ Unicode normalization
- ✓ Request rate limiting per user/IP
- ✓ Endpoint-specific rate limits
- ✓ Request size limits
- ✓ Bandwidth limiting

## Running Security Tests

### Prerequisites

```bash
cd backend
pip install -r requirements.txt
pip install pytest pytest-cov
```

### Run All Security Tests

```bash
# Basic run
python -m pytest tests/security/ -v

# With detailed output
python -m pytest tests/security/ -vv

# Show print statements
python -m pytest tests/security/ -v -s
```

### Run Specific Test Category

```bash
# Authentication tests only
python -m pytest tests/security/test_auth_security.py -v

# Injection attack tests only
python -m pytest tests/security/test_injection_attacks.py -v

# CORS/CSRF/Headers tests only
python -m pytest tests/security/test_cors_csrf_headers.py -v

# Data validation tests only
python -m pytest tests/security/test_data_validation.py -v
```

### Run Specific Test Class

```bash
# JWT token validation only
python -m pytest tests/security/test_auth_security.py::TestJWTTokenValidation -v

# SQL injection tests only
python -m pytest tests/security/test_injection_attacks.py::TestSQLInjectionPrevention -v

# XSS prevention only
python -m pytest tests/security/test_injection_attacks.py::TestXSSPrevention -v
```

### Run Specific Test

```bash
# Single test
python -m pytest tests/security/test_auth_security.py::TestJWTTokenValidation::test_expired_token_rejected -v
```

### Generate Coverage Report

```bash
# Terminal report
python -m pytest tests/security/ --cov=. --cov-report=term-missing

# HTML report
python -m pytest tests/security/ --cov=. --cov-report=html
# Open htmlcov/index.html
```

### Run with Markers

```bash
# Run only slow tests
python -m pytest tests/security/ -m slow

# Run everything except slow
python -m pytest tests/security/ -m "not slow"
```

### Parallel Execution

```bash
# Install pytest-xdist
pip install pytest-xdist

# Run in parallel with 4 workers
python -m pytest tests/security/ -n 4
```

## Manual Security Testing

For manual testing, refer to [MANUAL_TESTING_CHECKLIST.md](MANUAL_TESTING_CHECKLIST.md).

The checklist covers:
1. Authentication & Authorization
2. Injection Attacks
3. CSRF & CORS
4. Session Management
5. Data Protection
6. Sensitive Data
7. Security Headers
8. HTTPS/TLS
9. Access Control
10. API Security
11. Logging & Monitoring
12. Database Security
13. Third-Party Libraries
14. Error Handling
15. File Upload Security

## Test Fixtures

The `conftest.py` provides test fixtures:

```python
# Token fixtures
valid_jwt_token          # Valid JWT token
expired_jwt_token        # Expired token
invalid_jwt_signature    # Invalid signature
admin_token             # Admin role token
user_token              # User role token

# Payload fixtures
sql_injection_payloads   # SQL injection payloads
xss_payloads            # XSS payloads
command_injection_payloads  # Command injection payloads
ldap_injection_payloads # LDAP injection payloads
path_traversal_payloads # Path traversal payloads
large_payload           # Large payload for DOS testing
null_byte_payloads      # Null byte injection payloads

# Configuration fixtures
jwt_secret              # JWT secret key
jwt_algorithm          # JWT algorithm
```

## Common Security Tests

### Test JWT Token Validation

```python
def test_expired_token_rejected(expired_jwt_token, jwt_secret, jwt_algorithm):
    with pytest.raises(jwt.ExpiredSignatureError):
        jwt.decode(expired_jwt_token, jwt_secret, algorithms=[jwt_algorithm])
```

### Test SQL Injection Prevention

```python
def test_basic_sql_injection_attempt(sql_injection_payloads):
    for payload in sql_injection_payloads:
        # Check for dangerous patterns
        dangerous_patterns = [...]
        is_dangerous = any(re.search(pattern, payload, re.IGNORECASE) 
                          for pattern in dangerous_patterns)
        assert is_dangerous
```

### Test XSS Prevention

```python
def test_script_tags_escaped(xss_payloads):
    for payload in xss_payloads:
        escaped = payload.replace("<", "&lt;").replace(">", "&gt;")
        assert "<script>" not in escaped
```

## Security Testing Best Practices

1. **Test in dedicated environment** - Never test on production
2. **Document all findings** - Keep detailed records
3. **Verify fixes** - Re-test after fixes
4. **Automate repetitive tests** - Use automated testing
5. **Stay updated** - Follow security advisories
6. **Review regularly** - Schedule security reviews
7. **Involve security team** - Collaborate with specialists
8. **Test edge cases** - Don't just test happy paths
9. **Focus on integration** - Test system interactions
10. **Think like attacker** - Consider malicious scenarios

## OWASP Top 10 Coverage

| Vulnerability | Coverage |
|---|---|
| Broken Access Control | ✓ RBAC tests, permission tests |
| Cryptographic Failures | ✓ Token validation, SSL/TLS tests |
| Injection | ✓ SQL, XSS, Command, LDAP tests |
| Insecure Design | ✓ Security headers, CSRF tests |
| Security Misconfiguration | ✓ Headers, CORS, HTTPS tests |
| Vulnerable Components | Manual dependency review needed |
| Authentication Failures | ✓ Token, session, brute-force tests |
| Data Integrity Failures | ✓ Input validation tests |
| Logging & Monitoring Failures | Manual review needed |
| SSRF | Manual testing needed |

## Continuous Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/security.yml
- name: Run security tests
  run: pytest tests/security/ -v --cov=tests/security
  
- name: Check for vulnerabilities
  run: pip-audit
  
- name: Run SAST scan
  uses: github/super-linter@v4
```

## Reporting Issues

When reporting security vulnerabilities:
1. Document clearly with reproduction steps
2. Explain the impact
3. Suggest remediation if possible
4. Practice responsible disclosure
5. Don't publish until fixed

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [JWT Security](https://tools.ietf.org/html/rfc7519)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Support

For questions or issues with security tests, please contact the security team.
