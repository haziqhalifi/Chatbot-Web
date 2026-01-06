# Security Testing Guide

## Manual Security Testing Checklist

This document provides a comprehensive security checklist for manual testing and verification.

### 1. Authentication & Authorization

#### Authentication

- [ ] Can users register with weak passwords? (Should reject)
- [ ] Can users login with SQL injection in username field?
- [ ] Does password field mask input correctly?
- [ ] Are failed login attempts logged?
- [ ] Is there rate limiting on login attempts?
- [ ] Are account lockouts enforced after max failed attempts?
- [ ] Can users access API endpoints without authentication token?
- [ ] Can users use expired tokens?
- [ ] Can users use tampered tokens?
- [ ] Is token refresh working correctly?

#### Authorization

- [ ] Can regular users access admin endpoints?
- [ ] Can users modify other users' data?
- [ ] Can users elevate their role from user to admin?
- [ ] Are resource ownership checks enforced?
- [ ] Can users access resources they don't own?
- [ ] Are permission checks logged?

### 2. Injection Attacks

#### SQL Injection

- [ ] Test login with: `' OR '1'='1`
- [ ] Test username with: `'; DROP TABLE users; --`
- [ ] Test with: `admin' --`
- [ ] Are parameterized queries being used?
- [ ] Are error messages revealing database schema?
- [ ] Test with UNION-based injection
- [ ] Test with time-based blind SQL injection

#### Command Injection

- [ ] Test file upload with: `; rm -rf /`
- [ ] Test search with: `| whoami`
- [ ] Test with: `$(whoami)`
- [ ] Test with backticks: `` `whoami` ``

#### XSS (Cross-Site Scripting)

- [ ] Can users inject `<script>alert('xss')</script>` in chat?
- [ ] Can users inject event handlers: `<img onerror=alert(1)>`
- [ ] Can users inject JavaScript protocol: `javascript:alert(1)`
- [ ] Test with: `<svg onload=alert('xss')>`
- [ ] Are user inputs properly escaped in display?
- [ ] Test with encoded payloads: `%3Cscript%3E`
- [ ] Are HTML special characters escaped?

### 3. CSRF & CORS

#### CSRF Protection

- [ ] Are CSRF tokens present in forms?
- [ ] Are CSRF tokens validated on form submission?
- [ ] Can you perform state-changing operations from different domain?
- [ ] Are CSRF tokens unique per session?
- [ ] Are CSRF tokens refreshed after login?
- [ ] Is SameSite cookie attribute set?

#### CORS

- [ ] What origins are allowed in CORS policy?
- [ ] Is wildcard (\*) origin allowed? (Should not be)
- [ ] Can cross-origin requests include credentials?
- [ ] Are preflight requests properly handled?
- [ ] Can you make requests from unexpected origins?

### 4. Session Management

- [ ] Can users access sessions after logout?
- [ ] Are sessions cleared on logout?
- [ ] Can users hijack other users' sessions?
- [ ] Are session IDs random and unpredictable?
- [ ] Are sessions invalidated after timeout?
- [ ] Can users modify session data?
- [ ] Is session cookie HttpOnly flag set?
- [ ] Is session cookie Secure flag set?
- [ ] Is SameSite attribute set on session cookie?

### 5. Data Protection

#### Input Validation

- [ ] Are email addresses validated?
- [ ] Are phone numbers validated?
- [ ] Are URLs validated?
- [ ] Are file types validated on upload?
- [ ] Are file sizes limited?
- [ ] Is user input length limited?
- [ ] Are special characters handled safely?
- [ ] Is null byte injection prevented?

#### Output Encoding

- [ ] Are user inputs properly encoded before display?
- [ ] Are JSON responses properly escaped?
- [ ] Are URLs properly encoded?
- [ ] Are HTML entities used correctly?

### 6. Sensitive Data

- [ ] Are passwords hashed and salted?
- [ ] Are API keys stored securely?
- [ ] Are connection strings not hardcoded?
- [ ] Are credentials not logged?
- [ ] Is sensitive data encrypted in transit (HTTPS)?
- [ ] Is sensitive data encrypted at rest?
- [ ] Are backup files encrypted?
- [ ] Are temporary files cleaned up?
- [ ] Can users download backups with credentials?

### 7. Security Headers

- [ ] Is Content-Security-Policy header set?
- [ ] Is X-Content-Type-Options: nosniff set?
- [ ] Is X-Frame-Options set?
- [ ] Is Strict-Transport-Security header set?
- [ ] Is X-XSS-Protection header set?
- [ ] Is Referrer-Policy header set?
- [ ] Are unnecessary headers exposed (Server, X-Powered-By)?
- [ ] Are security headers applied to all responses?

### 8. HTTPS/TLS

- [ ] Is the entire site using HTTPS?
- [ ] Do HTTP requests redirect to HTTPS?
- [ ] Is certificate valid and trusted?
- [ ] Are mixed content (HTTP + HTTPS) issues present?
- [ ] Is TLS version 1.2 or higher used?
- [ ] Are weak ciphers disabled?
- [ ] Is HSTS preload enabled?

### 9. Access Control

- [ ] Can unauthenticated users access protected resources?
- [ ] Are directory listings disabled?
- [ ] Can users access .env, .git, or other config files?
- [ ] Are backup files protected?
- [ ] Are admin panels protected?
- [ ] Is path traversal prevented? (`../../../etc/passwd`)
- [ ] Are file permissions set correctly?

### 10. API Security

- [ ] Are all API endpoints authenticated?
- [ ] Is API versioning handled securely?
- [ ] Are API rate limits enforced?
- [ ] Is API response size limited?
- [ ] Are API errors not leaking sensitive information?
- [ ] Is API documentation not exposing internal details?

### 11. Logging & Monitoring

- [ ] Are security events logged?
- [ ] Are failed login attempts logged?
- [ ] Are unauthorized access attempts logged?
- [ ] Are logs not exposing sensitive data?
- [ ] Are logs stored securely?
- [ ] Are logs regularly reviewed?
- [ ] Is there alerting on suspicious activity?

### 12. Database Security

- [ ] Are database credentials not hardcoded?
- [ ] Are database connections using encryption?
- [ ] Is database running with minimal privileges?
- [ ] Are database backups encrypted?
- [ ] Are database backups tested?
- [ ] Is database activity logged?
- [ ] Are sensitive fields encrypted in database?
- [ ] Is SQL injection prevented with parameterized queries?

### 13. Third-Party Libraries

- [ ] Are dependencies up to date?
- [ ] Are there known vulnerabilities in dependencies?
- [ ] Is dependency scanning enabled in CI/CD?
- [ ] Are unused dependencies removed?
- [ ] Are third-party services using HTTPS?
- [ ] Are third-party services properly authenticated?

### 14. Error Handling

- [ ] Are error messages generic for users?
- [ ] Are detailed errors only shown in development?
- [ ] Are stack traces not exposed to users?
- [ ] Are error pages consistent?
- [ ] Are common errors handled gracefully?
- [ ] Is error information logged?

### 15. File Upload Security

- [ ] Are file types validated?
- [ ] Are file sizes limited?
- [ ] Are uploaded files scanned for malware?
- [ ] Are uploaded files stored outside web root?
- [ ] Are uploaded files executed?
- [ ] Are file permissions set correctly?
- [ ] Are filenames sanitized?
- [ ] Can users download arbitrary files?

## Testing Tools

### Automated Security Testing

- OWASP ZAP
- Burp Suite
- sqlmap
- nikto
- nessus

### Manual Testing Tools

- Postman
- curl
- Browser DevTools
- Burp Suite Community
- OWASP Dependency Check

## Running Security Tests

### Run All Security Tests

```bash
cd backend
python -m pytest tests/security/ -v
```

### Run Specific Test Category

```bash
# Authentication tests
python -m pytest tests/security/test_auth_security.py -v

# Injection attack tests
python -m pytest tests/security/test_injection_attacks.py -v

# CORS/CSRF tests
python -m pytest tests/security/test_cors_csrf_headers.py -v

# Data validation tests
python -m pytest tests/security/test_data_validation.py -v
```

### Run with Coverage

```bash
python -m pytest tests/security/ --cov=. --cov-report=html
```

## Security Testing Best Practices

1. **Test in dedicated environment** - Never test on production
2. **Document findings** - Keep detailed records of all issues found
3. **Verify fixes** - Re-test after fixes are applied
4. **Automate repetitive tests** - Use automated testing for consistency
5. **Stay updated** - Follow security advisories and best practices
6. **Review regularly** - Schedule regular security reviews
7. **Involve security team** - Collaborate with security specialists
8. **Test edge cases** - Don't just test happy paths
9. **Test integration points** - Focus on where systems interact
10. **Think like attacker** - Consider how malicious users might attack

## Common Vulnerabilities Found

### OWASP Top 10

1. **Broken Access Control** - Verify authorization on all endpoints
2. **Cryptographic Failures** - Ensure proper encryption/hashing
3. **Injection** - Test for SQL, command, LDAP injection
4. **Insecure Design** - Review threat models
5. **Security Misconfiguration** - Check headers, SSL, etc.
6. **Vulnerable Components** - Keep dependencies updated
7. **Authentication Failures** - Test token validation, session handling
8. **Data Integrity Failures** - Verify data validation
9. **Logging & Monitoring Failures** - Ensure events are logged
10. **SSRF** - Test for Server-Side Request Forgery

## Reporting Security Issues

When reporting security vulnerabilities:

1. Document the vulnerability clearly
2. Provide steps to reproduce
3. Explain the impact
4. Suggest remediation (if possible)
5. Keep disclosure responsible (don't publish until fixed)
