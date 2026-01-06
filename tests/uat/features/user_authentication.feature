# User Authentication UAT

## Acceptance Criteria

Users must be able to register, authenticate, and manage their accounts securely.

---

## Feature: User Registration

### UC-AUTH-001: Successful User Registration

```gherkin
Feature: User Registration
  As a new user
  I want to create an account
  So that I can access the chatbot application

  Scenario: User registers with valid credentials
    Given I am on the registration page
    When I enter a valid email "newuser@example.com"
    And I enter a strong password "SecurePass123!@"
    And I confirm the password "SecurePass123!@"
    And I click the "Register" button
    Then I should see a success message "Account created successfully"
    And I should be logged in automatically
    And I should see the chat interface
    And A welcome notification should be created

  Scenario: User attempts to register with existing email
    Given A user account exists for "existing@example.com"
    When I enter the email "existing@example.com"
    And I enter a password "NewPass123!@"
    And I click the "Register" button
    Then I should see an error message "Email already in use"
    And No new account should be created

  Scenario: User attempts to register with weak password
    Given I am on the registration page
    When I enter the email "newuser@example.com"
    And I enter a weak password "123456"
    And I click the "Register" button
    Then I should see an error message "Password is too weak"
    And The password requirements should be displayed

  Scenario: User attempts to register with mismatched passwords
    Given I am on the registration page
    When I enter the email "newuser@example.com"
    And I enter the password "SecurePass123!@"
    And I confirm the password "DifferentPass456!@"
    And I click the "Register" button
    Then I should see an error message "Passwords do not match"
    And No account should be created

  Scenario: User attempts to register with invalid email
    Given I am on the registration page
    When I enter the email "invalid-email"
    And I enter the password "SecurePass123!@"
    And I click the "Register" button
    Then I should see an error message "Invalid email format"
    And No account should be created
```

### Acceptance Criteria

- [ ] User can register with valid email and strong password
- [ ] System validates email uniqueness
- [ ] System validates password strength (min 8 chars, uppercase, lowercase, number, special char)
- [ ] System validates password confirmation match
- [ ] System validates email format
- [ ] User is automatically logged in after registration
- [ ] Welcome notification is created
- [ ] Error messages are clear and actionable

---

## Feature: User Login

### UC-AUTH-002: Successful User Login

```gherkin
Feature: User Login
  As a registered user
  I want to log in to my account
  So that I can access my chat history and settings

  Scenario: User logs in with valid credentials
    Given I am on the login page
    And A user account exists with email "user@example.com" and password "SecurePass123!@"
    When I enter the email "user@example.com"
    And I enter the password "SecurePass123!@"
    And I click the "Login" button
    Then I should be logged in successfully
    And I should be redirected to the chat dashboard
    And I should see my previous chat sessions

  Scenario: User logs in with incorrect password
    Given I am on the login page
    And A user account exists with email "user@example.com"
    When I enter the email "user@example.com"
    And I enter the password "WrongPassword123!@"
    And I click the "Login" button
    Then I should see an error message "Invalid email or password"
    And I should NOT be logged in
    And The login form should remain visible

  Scenario: User logs in with non-existent email
    Given I am on the login page
    When I enter the email "nonexistent@example.com"
    And I enter the password "SomePassword123!@"
    And I click the "Login" button
    Then I should see an error message "Invalid email or password"
    And I should NOT be logged in

  Scenario: User account is locked after multiple failed login attempts
    Given I am on the login page
    And A user account exists with email "user@example.com"
    When I attempt to login 5 times with incorrect password
    Then I should see an error message "Account is temporarily locked"
    And Login should be disabled for 15 minutes
    And A security notification should be sent to the user

  Scenario: User can login with remember me option
    Given I am on the login page
    When I enter valid credentials
    And I check the "Remember me" checkbox
    And I click the "Login" button
    Then I should be logged in successfully
    And My session should persist for 30 days
    And When I return to the site, I should be automatically logged in
```

### Acceptance Criteria

- [ ] User can login with correct credentials
- [ ] User is denied access with incorrect password
- [ ] User is denied access with non-existent email
- [ ] Account locks after 5 failed attempts
- [ ] Lockout duration is 15 minutes
- [ ] "Remember me" functionality works correctly
- [ ] Session expires after 24 hours of inactivity
- [ ] Logout clears session

---

## Feature: Password Management

### UC-AUTH-003: Password Reset

```gherkin
Feature: Password Reset
  As a user
  I want to reset my forgotten password
  So that I can regain access to my account

  Scenario: User resets password with valid email
    Given I am on the login page
    When I click the "Forgot Password" link
    And I enter the email "user@example.com"
    And I click the "Send Reset Email" button
    Then I should see a message "Check your email for reset instructions"
    And An email should be sent with a reset link
    And The reset link should be valid for 1 hour

  Scenario: User resets password with reset token
    Given I have received a password reset email
    And I click the reset link in the email
    When I enter a new password "NewSecurePass456!@"
    And I confirm the password "NewSecurePass456!@"
    And I click the "Reset Password" button
    Then I should see a success message "Password has been reset"
    And I should be able to login with the new password
    And Old password should no longer work

  Scenario: User attempts to use expired reset token
    Given I have a password reset token that expired 2 hours ago
    When I attempt to use the reset link
    Then I should see an error message "Reset link has expired"
    And I should be prompted to request a new reset

  Scenario: User changes password from settings
    Given I am logged in
    And I am on the account settings page
    When I enter my current password "OldPass123!@"
    And I enter a new password "NewPass456!@"
    And I confirm the new password "NewPass456!@"
    And I click the "Change Password" button
    Then I should see a success message "Password changed successfully"
    And I should be able to login with the new password
```

### Acceptance Criteria

- [ ] Password reset email is sent within 30 seconds
- [ ] Reset link is valid for exactly 1 hour
- [ ] New password must meet strength requirements
- [ ] User must confirm new password
- [ ] Expired reset links are rejected
- [ ] Old password no longer works after reset
- [ ] User is notified of password change

---

## Feature: Session Management

### UC-AUTH-004: Session Security

```gherkin
Feature: Session Management
  As a user
  I want my session to be secure
  So that my account is protected from unauthorized access

  Scenario: User session expires after inactivity
    Given I am logged in
    When I remain inactive for 24 hours
    Then My session should expire
    And I should be asked to login again
    And My chat history should be preserved

  Scenario: User can logout successfully
    Given I am logged in
    When I click the "Logout" button
    Then I should be logged out successfully
    And I should be redirected to the login page
    And My session should be cleared
    And Browser back button should not access protected pages

  Scenario: User can force logout all sessions
    Given I am logged in on multiple devices
    When I click "Logout all sessions" from settings
    Then All my active sessions should be terminated
    And I should need to login again on all devices
    And A security notification should be sent

  Scenario: Session prevents CSRF attacks
    Given I am logged in
    When A malicious site attempts to make requests on my behalf
    Then The requests should be blocked
    And A CSRF token should be required
    And The malicious request should fail with 403 Forbidden
```

### Acceptance Criteria

- [ ] Session expires after 24 hours of inactivity
- [ ] Logout clears all session data
- [ ] User is redirected to login on session expiry
- [ ] Chat history is preserved after logout
- [ ] CSRF protection is enabled
- [ ] Multiple sessions can coexist
- [ ] "Logout all" functionality works across devices
