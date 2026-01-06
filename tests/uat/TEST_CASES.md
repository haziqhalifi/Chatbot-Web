# UAT Test Cases and Execution Guide

## Overview

This document provides detailed test case specifications and execution instructions for User Acceptance Testing (UAT). All test cases are derived from Gherkin feature files and should be executed following this guide.

---

## Test Case Structure

Each test case includes:

1. **Test ID**: Unique identifier (e.g., TC-AUTH-001)
2. **Feature**: Feature being tested
3. **Scenario**: Specific scenario from Gherkin file
4. **Preconditions**: Prerequisites before test execution
5. **Test Steps**: Step-by-step actions
6. **Expected Results**: What should happen
7. **Acceptance Criteria**: Pass/Fail conditions
8. **Notes**: Additional observations
9. **Status**: Pass/Fail/Blocked
10. **Tester Name**: Who executed the test
11. **Date**: When test was executed

---

## Test Case Template

```
TEST CASE ID: TC-[FEATURE]-[NUMBER]
Test Case Name: [Descriptive name]
Feature: [Feature name]
Scenario: [Scenario description]
Severity: [Critical/High/Medium/Low]

PRECONDITIONS:
- [ ] List preconditions here

TEST STEPS:
1. Step 1
2. Step 2
3. Step 3

EXPECTED RESULTS:
1. Expected result 1
2. Expected result 2
3. Expected result 3

ACCEPTANCE CRITERIA:
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3

STATUS: [ ] PASS [ ] FAIL [ ] BLOCKED

NOTES:
[Any additional observations or issues]

EXECUTED BY: _______________ DATE: _______________
```

---

## Authentication Test Cases

### TC-AUTH-001: User Registration - Valid Credentials

**Feature:** User Registration  
**Scenario:** User successfully registers with valid credentials  
**Severity:** Critical

**PRECONDITIONS:**

- [ ] Application is accessible
- [ ] No account exists with test email
- [ ] Email service is working

**TEST STEPS:**

1. Navigate to registration page
2. Enter username: "testuser123"
3. Enter valid email: "testuser@example.com"
4. Enter password: "SecurePass123!@"
5. Confirm password: "SecurePass123!@"
6. Accept terms and conditions
7. Click "Register" button
8. Check email for verification link
9. Click verification link
10. Return to login page
11. Login with credentials

**EXPECTED RESULTS:**

1. Registration form displays successfully
2. Password meets requirements (8+ chars, special char, number)
3. Confirmation password matches validation
4. Account created successfully
5. Verification email received within 2 minutes
6. Email link works and verifies account
7. Account is now active for login
8. First login is successful

**ACCEPTANCE CRITERIA:**

- [ ] User account created in database
- [ ] Verification email sent
- [ ] Email link works correctly
- [ ] User can login after verification
- [ ] Account status changes to "Active"

**STATUS:** [ ] PASS [ ] FAIL [ ] BLOCKED

**EXECUTED BY:** ******\_\_\_****** DATE: ******\_\_\_******

---

### TC-AUTH-002: User Login - Valid Credentials

**Feature:** User Login  
**Scenario:** User successfully logs in with valid credentials  
**Severity:** Critical

**PRECONDITIONS:**

- [ ] User account exists and is verified
- [ ] User is not currently logged in
- [ ] No account lockout is in place

**TEST STEPS:**

1. Navigate to login page
2. Enter email: "testuser@example.com"
3. Enter password: "SecurePass123!@"
4. Click "Remember Me" checkbox (optional)
5. Click "Login" button
6. Wait for redirect to home page

**EXPECTED RESULTS:**

1. Login form displays correctly
2. Form validation passes
3. Authentication succeeds
4. User is redirected to home page
5. User profile is visible in sidebar
6. Session cookie is created
7. User can access protected features

**ACCEPTANCE CRITERIA:**

- [ ] Login takes less than 2 seconds
- [ ] Session is created
- [ ] User dashboard is accessible
- [ ] User profile information is displayed
- [ ] Logout option is available

**STATUS:** [ ] PASS [ ] FAIL [ ] BLOCKED

**EXECUTED BY:** ******\_\_\_****** DATE: ******\_\_\_******

---

### TC-AUTH-003: User Login - Wrong Password

**Feature:** User Login  
**Scenario:** Login fails with incorrect password  
**Severity:** High

**PRECONDITIONS:**

- [ ] Valid user account exists
- [ ] User is not locked out
- [ ] Less than 5 failed attempts

**TEST STEPS:**

1. Navigate to login page
2. Enter email: "testuser@example.com"
3. Enter password: "WrongPassword123"
4. Click "Login" button
5. Observe error message
6. Try again with correct password

**EXPECTED RESULTS:**

1. Error message displays: "Invalid email or password"
2. User is not logged in
3. Session is not created
4. User remains on login page
5. Correct credentials work on second attempt

**ACCEPTANCE CRITERIA:**

- [ ] Error message is clear
- [ ] No account information is revealed
- [ ] User can retry immediately
- [ ] Correct credentials still work

**STATUS:** [ ] PASS [ ] FAIL [ ] BLOCKED

**EXECUTED BY:** ******\_\_\_****** DATE: ******\_\_\_******

---

### TC-AUTH-004: Password Reset - Valid Email

**Feature:** Password Management  
**Scenario:** User resets password using email verification  
**Severity:** High

**PRECONDITIONS:**

- [ ] User account exists
- [ ] Email service is operational
- [ ] User is not logged in

**TEST STEPS:**

1. Navigate to login page
2. Click "Forgot Password?" link
3. Enter email: "testuser@example.com"
4. Click "Send Reset Link"
5. Check email for reset link
6. Click reset link
7. Enter new password: "NewSecure456!@"
8. Confirm new password
9. Click "Reset Password"
10. Attempt login with new password

**EXPECTED RESULTS:**

1. Password reset form displays
2. Verification email sent within 2 minutes
3. Reset link is valid
4. Password update succeeds
5. User receives confirmation email
6. Old password no longer works
7. New password works for login

**ACCEPTANCE CRITERIA:**

- [ ] Reset email contains secure link
- [ ] Link expires after 24 hours
- [ ] Password is changed in database
- [ ] Old password is invalidated
- [ ] User can login with new password
- [ ] Confirmation email is sent

**STATUS:** [ ] PASS [ ] FAIL [ ] BLOCKED

**EXECUTED BY:** ******\_\_\_****** DATE: ******\_\_\_******

---

## Chat Functionality Test Cases

### TC-CHAT-001: Send Text Message

**Feature:** Message Exchange  
**Scenario:** User sends text message in conversation  
**Severity:** Critical

**PRECONDITIONS:**

- [ ] User is logged in
- [ ] Chat conversation is open
- [ ] Internet connection is stable

**TEST STEPS:**

1. Open a chat conversation
2. Click in the message input field
3. Type: "Hello, how are you?"
4. Click "Send" button or press Enter
5. Wait for message to appear
6. Wait for response from bot

**EXPECTED RESULTS:**

1. Message appears in chat immediately
2. Message shows sender as current user
3. Timestamp is accurate
4. Message is marked as "Sent"
5. Bot response arrives within 5 seconds
6. Response appears below user message

**ACCEPTANCE CRITERIA:**

- [ ] Message sends successfully
- [ ] Message is visible to user
- [ ] Message is stored in database
- [ ] Bot response is received
- [ ] Response is relevant to input

**STATUS:** [ ] PASS [ ] FAIL [ ] BLOCKED

**EXECUTED BY:** ******\_\_\_****** DATE: ******\_\_\_******

---

### TC-CHAT-002: Edit Message

**Feature:** Message Actions  
**Scenario:** User edits previously sent message  
**Severity:** Medium

**PRECONDITIONS:**

- [ ] User has sent a message
- [ ] Message is in the conversation
- [ ] Less than 1 hour has passed

**TEST STEPS:**

1. Hover over a message sent by current user
2. Click "Edit" button (pencil icon)
3. Modify message text
4. Click "Save" or press Enter
5. Verify message is updated
6. Check timestamp shows "(edited)"

**EXPECTED RESULTS:**

1. Edit button appears on user messages only
2. Edit form displays with current message
3. Message text can be modified
4. Edited message replaces original
5. "(edited)" indicator appears
6. Timestamp of edit is recorded

**ACCEPTANCE CRITERIA:**

- [ ] Edit button is visible
- [ ] Message content updates
- [ ] Edit indicator is shown
- [ ] Edit history is maintained
- [ ] Other users can see edit indicator

**STATUS:** [ ] PASS [ ] FAIL [ ] BLOCKED

**EXECUTED BY:** ******\_\_\_****** DATE: ******\_\_\_******

---

### TC-CHAT-003: Delete Message

**Feature:** Message Actions  
**Scenario:** User deletes their message  
**Severity:** Medium

**PRECONDITIONS:**

- [ ] User has sent a message
- [ ] Message is visible in conversation
- [ ] User created the message

**TEST STEPS:**

1. Hover over user's own message
2. Click "Delete" button (trash icon)
3. Confirm deletion in popup
4. Verify message is removed

**EXPECTED RESULTS:**

1. Delete button appears only for user's messages
2. Confirmation dialog appears
3. Deletion is irreversible
4. Message is removed from conversation
5. "[Message deleted]" or similar indicator may appear
6. Message is removed from database

**ACCEPTANCE CRITERIA:**

- [ ] Delete button is visible
- [ ] Confirmation dialog appears
- [ ] Message is permanently removed
- [ ] Conversation layout adjusts
- [ ] Deletion is logged

**STATUS:** [ ] PASS [ ] FAIL [ ] BLOCKED

**EXECUTED BY:** ******\_\_\_****** DATE: ******\_\_\_******

---

## Profile and Settings Test Cases

### TC-PROFILE-001: View User Profile

**Feature:** Profile Management  
**Scenario:** User views their profile information  
**Severity:** Medium

**PRECONDITIONS:**

- [ ] User is logged in
- [ ] User profile is complete
- [ ] Profile page is accessible

**TEST STEPS:**

1. Click user profile icon/menu
2. Select "Profile" or "View Profile"
3. Wait for profile page to load
4. Verify all information displays

**EXPECTED RESULTS:**

1. Profile page loads within 2 seconds
2. User's name is displayed correctly
3. Profile picture appears
4. Email is visible
5. Account creation date is shown
6. Edit button is available

**ACCEPTANCE CRITERIA:**

- [ ] All profile data is accurate
- [ ] Profile loads quickly
- [ ] Data privacy is maintained
- [ ] Edit option is available
- [ ] Logout option is visible

**STATUS:** [ ] PASS [ ] FAIL [ ] BLOCKED

**EXECUTED BY:** ******\_\_\_****** DATE: ******\_\_\_******

---

### TC-SETTINGS-001: Change Theme to Dark Mode

**Feature:** User Settings  
**Scenario:** User switches to dark theme  
**Severity:** Low

**PRECONDITIONS:**

- [ ] User is logged in
- [ ] Settings page is accessible
- [ ] Light theme is currently active

**TEST STEPS:**

1. Navigate to Settings
2. Click "Appearance"
3. Select "Dark Theme" radio button
4. Click "Save"
5. Verify theme change
6. Refresh page
7. Verify theme persists

**EXPECTED RESULTS:**

1. Theme selection options appear
2. Dark theme button can be selected
3. UI switches to dark colors immediately
4. All text remains readable
5. Theme persists after page refresh
6. Theme applies to all pages

**ACCEPTANCE CRITERIA:**

- [ ] Theme changes immediately
- [ ] Dark mode is properly implemented
- [ ] All colors are accessible
- [ ] Theme setting is saved
- [ ] Theme persists across sessions

**STATUS:** [ ] PASS [ ] FAIL [ ] BLOCKED

**EXECUTED BY:** ******\_\_\_****** DATE: ******\_\_\_******

---

## Notification Test Cases

### TC-NOTIF-001: Receive Message Notification

**Feature:** Real-Time Notifications  
**Scenario:** User receives notification for new message  
**Severity:** High

**PRECONDITIONS:**

- [ ] User is logged in
- [ ] Notifications are enabled in settings
- [ ] User is not actively viewing the chat
- [ ] Another user/bot can send messages

**TEST STEPS:**

1. User A is logged in but away from chat
2. User B sends a message in conversation with A
3. Observe notification in User A's session
4. Verify notification content

**EXPECTED RESULTS:**

1. Notification appears within 2 seconds
2. Notification shows sender name
3. Notification preview shows message excerpt
4. Notification badge appears on chat icon
5. Clicking notification opens conversation
6. Notification disappears after reading

**ACCEPTANCE CRITERIA:**

- [ ] Notification appears in real-time
- [ ] Notification content is correct
- [ ] Badge count is accurate
- [ ] Clicking opens conversation
- [ ] No notifications after message is read

**STATUS:** [ ] PASS [ ] FAIL [ ] BLOCKED

**EXECUTED BY:** ******\_\_\_****** DATE: ******\_\_\_******

---

### TC-NOTIF-002: Enable/Disable Notifications

**Feature:** Notification Preferences  
**Scenario:** User disables message notifications  
**Severity:** Medium

**PRECONDITIONS:**

- [ ] User is logged in
- [ ] Notification settings are accessible
- [ ] Notifications are currently enabled

**TEST STEPS:**

1. Navigate to Settings → Notifications
2. Find "Message notifications" toggle
3. Click to toggle OFF
4. Click "Save"
5. Return to chat
6. Have another user send a message
7. Verify no notification appears

**EXPECTED RESULTS:**

1. Notification toggle is visible and functional
2. Setting is saved successfully
3. Confirmation message appears
4. No notifications received when disabled
5. Message still arrives but without notification
6. Toggle can be turned back ON

**ACCEPTANCE CRITERIA:**

- [ ] Toggle works correctly
- [ ] Settings are saved
- [ ] Notifications are disabled
- [ ] Messages still arrive
- [ ] Setting persists across sessions

**STATUS:** [ ] PASS [ ] FAIL [ ] BLOCKED

**EXECUTED BY:** ******\_\_\_****** DATE: ******\_\_\_******

---

## Performance Test Cases

### TC-PERF-001: Page Load Time

**Feature:** Application Performance  
**Scenario:** Homepage loads within acceptable time  
**Severity:** High

**PRECONDITIONS:**

- [ ] Application is deployed
- [ ] Network connection is stable
- [ ] Browser is Chrome latest version
- [ ] No cache clearing needed

**TEST STEPS:**

1. Open browser developer tools (F12)
2. Go to Performance/Network tab
3. Navigate to application homepage
4. Record load time
5. Verify all elements are rendered

**EXPECTED RESULTS:**

1. Page loads within 3 seconds
2. Critical content renders within 2 seconds
3. Time to Interactive is under 2 seconds
4. No blocking JavaScript
5. Images load progressively

**ACCEPTANCE CRITERIA:**

- [ ] Load time < 3 seconds
- [ ] Time to Interactive < 2 seconds
- [ ] No 404 errors
- [ ] All images load
- [ ] Responsive to user input

**STATUS:** [ ] PASS [ ] FAIL [ ] BLOCKED

**EXECUTED BY:** ******\_\_\_****** DATE: ******\_\_\_******

---

### TC-PERF-002: Message Send Latency

**Feature:** Application Performance  
**Scenario:** Message appears immediately after sending  
**Severity:** High

**PRECONDITIONS:**

- [ ] User is logged in
- [ ] Chat is open
- [ ] Network is stable
- [ ] Developer tools available

**TEST STEPS:**

1. Open browser developer tools
2. Note current time
3. Type and send message
4. Observe when message appears
5. Calculate latency
6. Record result

**EXPECTED RESULTS:**

1. Message appears in UI within 200ms
2. No UI freezing during send
3. Input field remains responsive
4. User can send multiple messages quickly

**ACCEPTANCE CRITERIA:**

- [ ] Message latency < 200ms
- [ ] UI remains responsive
- [ ] No lag during typing
- [ ] Multiple rapid sends work
- [ ] Network latency acceptable

**STATUS:** [ ] PASS [ ] FAIL [ ] BLOCKED

**EXECUTED BY:** ******\_\_\_****** DATE: ******\_\_\_******

---

## Browser Compatibility Test Cases

### TC-COMPAT-001: Chrome Compatibility

**Feature:** Browser Compatibility  
**Scenario:** Application works fully on Chrome  
**Severity:** Critical

**PRECONDITIONS:**

- [ ] Chrome latest version is installed
- [ ] Application is deployed
- [ ] Network connection is working

**TEST STEPS:**

1. Open application in Chrome
2. Test core features:
   - Login
   - Send message
   - Open profile
   - Change settings
   - Receive notification
3. Check console for errors
4. Test file uploads
5. Test voice input

**EXPECTED RESULTS:**

1. All features work without issues
2. No console errors (except 3rd party)
3. Performance is optimal
4. Rendering is correct
5. Audio/video works properly

**ACCEPTANCE CRITERIA:**

- [ ] All features functional
- [ ] No critical errors
- [ ] Performance is good
- [ ] UI renders correctly
- [ ] File uploads work

**STATUS:** [ ] PASS [ ] FAIL [ ] BLOCKED

**EXECUTED BY:** ******\_\_\_****** DATE: ******\_\_\_******

---

## Test Execution Checklist

### Pre-Testing

- [ ] Test environment is set up
- [ ] Test data is prepared
- [ ] Test accounts are created
- [ ] All features are accessible
- [ ] Network connectivity is stable

### During Testing

- [ ] Record test results in test case format
- [ ] Take screenshots of failures
- [ ] Note any unexpected behavior
- [ ] Test in various network conditions
- [ ] Test on multiple devices

### Post-Testing

- [ ] Compile all results
- [ ] Identify failed test cases
- [ ] Log defects with details
- [ ] Calculate test coverage
- [ ] Prepare sign-off document

---

## Test Execution Status Report Template

```
TEST EXECUTION REPORT
Date: _______________
Tested By: _______________
Test Environment: _______________
Build Version: _______________

SUMMARY:
- Total Test Cases: ___
- Passed: ___
- Failed: ___
- Blocked: ___
- Pass Rate: ___%

FAILED TEST CASES:
[List all failed tests with ID and reason]

CRITICAL ISSUES:
[List any critical issues found]

SIGN-OFF:

QA Lead: _______________ Date: _______________
Product Owner: _______________ Date: _______________
Development Lead: _______________ Date: _______________
```

---

## Notes

- Each test should be completed independently
- Record results immediately after execution
- Document any issues with screenshots
- Time tests for performance metrics
- Test on multiple browsers when possible
- Test on both desktop and mobile devices
- Network testing should include slow connections
