# User Acceptance Testing (UAT) Plan

## Module 1: Authentication and User Management

### Document Information

- **Module**: Authentication and User Management
- **Version**: 1.0
- **Date**: January 10, 2026
- **Test Environment**: UAT Environment
- **Tester**: [To be filled by QA team]

---

## Test Cases

### FR1: User Registration and Login

| Test Case ID    | Test Scenario                                  | Step-by-Step Instructions                                                                                                                                                                                                                                                                      | Expected Result                                                                                                                                                                                                                               |
| --------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR01-01** | New user registration with valid credentials   | 1. Navigate to the registration page<br>2. Enter valid email address (e.g., testuser@example.com)<br>3. Enter a strong password (min 8 characters, with uppercase, lowercase, number)<br>4. Confirm password by entering the same password<br>5. Enter full name<br>6. Click "Register" button | • Registration form is submitted successfully<br>• Success message is displayed<br>• Verification email is sent to the provided email address<br>• User is redirected to login page or dashboard<br>• User account is created in the database |
| **UAT-FR01-02** | User registration with existing email          | 1. Navigate to the registration page<br>2. Enter an email that already exists in the system<br>3. Enter valid password and other required fields<br>4. Click "Register" button                                                                                                                 | • Error message is displayed: "Email already registered"<br>• Registration is not completed<br>• User remains on the registration page                                                                                                        |
| **UAT-FR01-03** | User registration with weak password           | 1. Navigate to the registration page<br>2. Enter valid email address<br>3. Enter a weak password (e.g., "123" or "password")<br>4. Click "Register" button                                                                                                                                     | • Validation error is displayed<br>• Error message indicates password requirements<br>• Registration is not submitted<br>• Form highlights the password field                                                                                 |
| **UAT-FR01-04** | User registration with mismatched passwords    | 1. Navigate to the registration page<br>2. Enter valid email and password<br>3. Enter a different password in "Confirm Password" field<br>4. Click "Register" button                                                                                                                           | • Error message is displayed: "Passwords do not match"<br>• Registration is not submitted<br>• User can correct the password fields                                                                                                           |
| **UAT-FR01-05** | User registration with invalid email format    | 1. Navigate to the registration page<br>2. Enter invalid email (e.g., "notanemail", "test@", "@example.com")<br>3. Enter valid password and other fields<br>4. Click "Register" button                                                                                                         | • Validation error is displayed<br>• Error message indicates invalid email format<br>• Registration is not submitted                                                                                                                          |
| **UAT-FR01-06** | User registration with missing required fields | 1. Navigate to the registration page<br>2. Leave one or more required fields empty<br>3. Click "Register" button                                                                                                                                                                               | • Validation errors are displayed for all empty required fields<br>• Registration is not submitted<br>• Form highlights missing fields                                                                                                        |
| **UAT-FR01-07** | Successful login with valid credentials        | 1. Navigate to the login page<br>2. Enter registered email address<br>3. Enter correct password<br>4. Click "Login" button                                                                                                                                                                     | • User is authenticated successfully<br>• JWT token is generated<br>• User is redirected to the dashboard/home page<br>• User session is established                                                                                          |
| **UAT-FR01-08** | Login with incorrect password                  | 1. Navigate to the login page<br>2. Enter registered email address<br>3. Enter incorrect password<br>4. Click "Login" button                                                                                                                                                                   | • Error message is displayed: "Invalid email or password"<br>• User is not authenticated<br>• User remains on the login page<br>• No session is created                                                                                       |
| **UAT-FR01-09** | Login with non-existent email                  | 1. Navigate to the login page<br>2. Enter an email that doesn't exist in the system<br>3. Enter any password<br>4. Click "Login" button                                                                                                                                                        | • Error message is displayed: "Invalid email or password"<br>• User is not authenticated<br>• User remains on the login page                                                                                                                  |
| **UAT-FR01-10** | Login with empty credentials                   | 1. Navigate to the login page<br>2. Leave email and/or password fields empty<br>3. Click "Login" button                                                                                                                                                                                        | • Validation errors are displayed for empty fields<br>• Login is not attempted<br>• Form highlights required fields                                                                                                                           |
| **UAT-FR01-11** | Successful logout                              | 1. Log in with valid credentials<br>2. Navigate to any page in the application<br>3. Click "Logout" button                                                                                                                                                                                     | • User session is terminated<br>• JWT token is invalidated<br>• User is redirected to login page<br>• Attempting to access protected pages redirects to login                                                                                 |

---

### FR2: JWT Session Management

| Test Case ID    | Test Scenario                                      | Step-by-Step Instructions                                                                                                                                               | Expected Result                                                                                                                                                                                  |
| --------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **UAT-FR02-01** | JWT token generation on login                      | 1. Open browser developer tools (Network tab)<br>2. Navigate to login page<br>3. Enter valid credentials and login<br>4. Inspect the response headers and local storage | • JWT token is present in the response<br>• Token is stored securely (httpOnly cookie or local storage)<br>• Token contains user information (payload)<br>• Token has proper expiration time set |
| **UAT-FR02-02** | Access protected route with valid token            | 1. Log in successfully<br>2. Navigate to a protected page (e.g., dashboard, profile)<br>3. Observe page loading                                                         | • Page loads successfully<br>• User data is displayed correctly<br>• No authentication errors occur<br>• API requests include JWT token in headers                                               |
| **UAT-FR02-03** | Access protected route without token               | 1. Open browser in incognito/private mode<br>2. Directly navigate to a protected URL (e.g., /dashboard)<br>3. Observe behavior                                          | • User is redirected to login page<br>• Error message may indicate "Unauthorized access"<br>• Protected content is not displayed                                                                 |
| **UAT-FR02-04** | Access protected route with expired token          | 1. Log in successfully<br>2. Wait for token to expire (or manually modify token expiration)<br>3. Attempt to access a protected page or make an API call                | • User is redirected to login page<br>• Error message indicates "Session expired"<br>• User must re-authenticate                                                                                 |
| **UAT-FR02-05** | Access protected route with invalid/tampered token | 1. Log in successfully<br>2. Open browser developer tools<br>3. Modify the JWT token in storage<br>4. Attempt to access a protected page                                | • User is logged out automatically<br>• Error message indicates invalid token<br>• User is redirected to login page<br>• No unauthorized access is granted                                       |
| **UAT-FR02-06** | Token refresh mechanism (if implemented)           | 1. Log in successfully<br>2. Use the application continuously<br>3. Monitor token expiration and renewal                                                                | • Token is refreshed before expiration<br>• User session continues seamlessly<br>• No unexpected logouts occur during active use                                                                 |
| **UAT-FR02-07** | Multiple concurrent sessions                       | 1. Log in on Browser 1<br>2. Log in with the same account on Browser 2<br>3. Perform actions on both browsers                                                           | • Both sessions work independently OR<br>• Second login invalidates first session (based on business rules)<br>• System behavior is consistent and secure                                        |

---

### FR3: Password Security (Hashing)

| Test Case ID    | Test Scenario                           | Step-by-Step Instructions                                                                                                                                    | Expected Result                                                                                                                                                                                                    |
| --------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **UAT-FR03-01** | Password hashing during registration    | 1. Register a new user with password "Test@123"<br>2. Access the database (admin access required)<br>3. Query the users table and inspect the password field | • Password is stored as a hash (not plain text)<br>• Hash is using a strong algorithm (bcrypt, argon2, etc.)<br>• Original password cannot be determined from hash<br>• Each user's hash is unique (includes salt) |
| **UAT-FR03-02** | Password verification during login      | 1. Register a user with a known password<br>2. Log out<br>3. Log in with the same password<br>4. Verify successful authentication                            | • User can log in successfully<br>• System correctly verifies hashed password<br>• No errors occur during verification                                                                                             |
| **UAT-FR03-03** | Same password produces different hashes | 1. Register User A with password "Test@123"<br>2. Register User B with password "Test@123"<br>3. Access database and compare password hashes                 | • Both users have different hash values<br>• Salting is properly implemented<br>• Rainbow table attacks are prevented                                                                                              |
| **UAT-FR03-04** | Password change updates hash            | 1. Log in as a user<br>2. Note the current password hash in database<br>3. Change password to a new value<br>4. Check database for updated hash              | • Password hash in database is updated<br>• New hash is different from old hash<br>• User can log in with new password<br>• Old password no longer works                                                           |

---

### FR4: Role-Based Access Control (RBAC)

| Test Case ID    | Test Scenario                                      | Step-by-Step Instructions                                                                                                                          | Expected Result                                                                                                                                                                 |
| --------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR04-01** | Public user registration assigns correct role      | 1. Register a new user through public registration<br>2. Log in with the new account<br>3. Check user profile or make API call to get user details | • User is assigned "public" role by default<br>• Role is correctly stored in database<br>• User has appropriate permissions for public role                                     |
| **UAT-FR04-02** | Admin role assignment (manual/system)              | 1. Have an administrator assign admin role to a user<br>2. Log in with the admin account<br>3. Verify role and permissions                         | • User role is updated to "admin"<br>• Admin dashboard/menu is accessible<br>• Admin-specific features are available                                                            |
| **UAT-FR04-03** | Public user cannot access admin routes             | 1. Log in as a public user<br>2. Attempt to navigate to admin-only URLs (e.g., /admin/dashboard)<br>3. Observe system behavior                     | • Access is denied (403 Forbidden)<br>• User is redirected to unauthorized page or home<br>• Error message indicates insufficient permissions<br>• Admin content is not visible |
| **UAT-FR04-04** | Admin user can access admin routes                 | 1. Log in as an admin user<br>2. Navigate to admin-only pages<br>3. Verify access to admin features                                                | • All admin pages are accessible<br>• Admin features are functional<br>• Admin dashboard displays correctly<br>• Admin API endpoints are accessible                             |
| **UAT-FR04-05** | Public user can access public routes               | 1. Log in as a public user<br>2. Navigate to public routes (chatbot, profile, map, etc.)<br>3. Verify functionality                                | • All public features are accessible<br>• User can interact with chatbot<br>• User can view maps and submit reports<br>• Public API endpoints work correctly                    |
| **UAT-FR04-06** | Admin user can access both admin and public routes | 1. Log in as an admin user<br>2. Navigate to both admin and public routes<br>3. Test features from both access levels                              | • Admin can access admin pages<br>• Admin can access public pages<br>• All features work correctly<br>• No permission errors occur                                              |
| **UAT-FR04-07** | Role verification in API responses                 | 1. Log in as public user and make API call to get profile<br>2. Log in as admin user and make the same API call<br>3. Compare responses            | • Response includes role information<br>• Role matches the authenticated user's role<br>• Role is used for authorization decisions                                              |
| **UAT-FR04-08** | Direct API access with wrong role                  | 1. Log in as public user<br>2. Use API tools (Postman/curl) to directly call admin-only endpoints<br>3. Observe response                           | • API returns 403 Forbidden<br>• Error message indicates insufficient permissions<br>• No data is returned<br>• Operation is not executed                                       |

---

### FR5: Password Reset via Email

| Test Case ID    | Test Scenario                                    | Step-by-Step Instructions                                                                                                                                                                          | Expected Result                                                                                                                                                                            |
| --------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **UAT-FR05-01** | Request password reset with valid email          | 1. Navigate to login page<br>2. Click "Forgot Password" link<br>3. Enter registered email address<br>4. Click "Submit" or "Send Reset Link" button<br>5. Check email inbox                         | • Success message is displayed<br>• Password reset email is sent to the address<br>• Email contains a unique reset link<br>• Email is received within a few minutes                        |
| **UAT-FR05-02** | Request password reset with non-existent email   | 1. Navigate to "Forgot Password" page<br>2. Enter an email that is not registered<br>3. Click "Submit" button                                                                                      | • Generic success message is displayed (security best practice) OR<br>• Error message indicates email not found<br>• No reset email is sent<br>• No user information is leaked             |
| **UAT-FR05-03** | Request password reset with invalid email format | 1. Navigate to "Forgot Password" page<br>2. Enter invalid email format<br>3. Click "Submit" button                                                                                                 | • Validation error is displayed<br>• Form indicates invalid email format<br>• Request is not submitted                                                                                     |
| **UAT-FR05-04** | Reset password using valid reset link            | 1. Request password reset and receive email<br>2. Click the reset link in the email<br>3. Enter new password (meeting requirements)<br>4. Confirm new password<br>5. Click "Reset Password" button | • User is redirected to reset password page<br>• New password is accepted<br>• Success message is displayed<br>• Password is updated in database<br>• User can log in with new password    |
| **UAT-FR05-05** | Reset password with mismatched passwords         | 1. Click valid reset link<br>2. Enter new password<br>3. Enter different password in confirm field<br>4. Click "Reset Password" button                                                             | • Validation error is displayed<br>• Error indicates passwords don't match<br>• Password is not updated<br>• User can correct and resubmit                                                 |
| **UAT-FR05-06** | Reset password with weak password                | 1. Click valid reset link<br>2. Enter weak password (not meeting requirements)<br>3. Click "Reset Password" button                                                                                 | • Validation error is displayed<br>• Error indicates password requirements<br>• Password is not updated<br>• User must enter stronger password                                             |
| **UAT-FR05-07** | Use expired reset link                           | 1. Request password reset<br>2. Wait for reset link to expire (or use old link)<br>3. Click the expired reset link<br>4. Attempt to reset password                                                 | • Error message indicates link has expired<br>• Password reset form may not be accessible<br>• User is prompted to request new reset link<br>• Password is not changed                     |
| **UAT-FR05-08** | Use reset link multiple times                    | 1. Request password reset and receive link<br>2. Click link and successfully reset password<br>3. Click the same reset link again                                                                  | • Error message indicates link has been used<br>• Link is invalidated after first use<br>• User cannot reset password again with same link<br>• User must request new reset link if needed |
| **UAT-FR05-09** | Multiple reset requests for same account         | 1. Request password reset for an account<br>2. Before clicking link, request another reset<br>3. Check if both links work or only the latest                                                       | • Latest reset link works<br>• Previous links are invalidated (recommended) OR<br>• Multiple links work until expiration (less secure)<br>• System behavior is consistent                  |
| **UAT-FR05-10** | Old password doesn't work after reset            | 1. Note current password<br>2. Complete password reset process<br>3. Attempt to login with old password                                                                                            | • Login with old password fails<br>• Error message indicates invalid credentials<br>• Only new password works for authentication                                                           |

---

### FR6: View and Update Profile

| Test Case ID    | Test Scenario                                 | Step-by-Step Instructions                                                                                                                  | Expected Result                                                                                                                                                           |
| --------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR06-01** | View user profile                             | 1. Log in with valid credentials<br>2. Navigate to "Profile" or "My Account" page<br>3. Observe displayed information                      | • Profile page loads successfully<br>• User's current information is displayed (name, email, etc.)<br>• All profile fields are visible<br>• Data matches database records |
| **UAT-FR06-02** | Update profile name                           | 1. Navigate to profile page<br>2. Click "Edit" or edit mode<br>3. Change the name field<br>4. Click "Save" button<br>5. Verify update      | • Name is updated successfully<br>• Success message is displayed<br>• Updated name is reflected immediately<br>• Profile page shows new name                              |
| **UAT-FR06-03** | Update profile with invalid data              | 1. Navigate to profile page<br>2. Enter invalid data (e.g., empty name, invalid email format)<br>3. Click "Save" button                    | • Validation errors are displayed<br>• Profile is not updated<br>• Error messages indicate specific issues<br>• Original data remains unchanged                           |
| **UAT-FR06-04** | Update profile email to existing email        | 1. Navigate to profile page<br>2. Change email to one already used by another account<br>3. Click "Save" button                            | • Error message is displayed<br>• Error indicates email already in use<br>• Email is not updated<br>• User can enter different email                                      |
| **UAT-FR06-05** | Update multiple profile fields simultaneously | 1. Navigate to profile page<br>2. Change multiple fields (name, phone, address, etc.)<br>3. Click "Save" button<br>4. Verify all changes   | • All fields are updated successfully<br>• Success message is displayed<br>• All changes are reflected in profile<br>• Database is updated correctly                      |
| **UAT-FR06-06** | Cancel profile update                         | 1. Navigate to profile page<br>2. Make changes to one or more fields<br>3. Click "Cancel" button (if available)<br>4. Verify original data | • Changes are discarded<br>• Original data is restored in form<br>• No database update occurs<br>• User is notified of cancellation                                       |
| **UAT-FR06-07** | Profile page access control                   | 1. Log in as User A<br>2. Attempt to access User B's profile URL directly<br>3. Observe system behavior                                    | • Access is denied OR<br>• User is redirected to their own profile<br>• User B's data is not visible to User A<br>• Error message if applicable                           |
| **UAT-FR06-08** | View profile with optional fields empty       | 1. Register with only required fields<br>2. Navigate to profile page<br>3. Observe display                                                 | • Profile page loads successfully<br>• Required fields show correct data<br>• Optional fields are empty or show placeholder<br>• No errors or crashes occur               |

---

### FR7: Profile Changes Persistence

| Test Case ID    | Test Scenario                              | Step-by-Step Instructions                                                                                                                                              | Expected Result                                                                                                                                                                                |
| --------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR07-01** | Profile changes persist after logout/login | 1. Log in and update profile information<br>2. Log out<br>3. Log in again<br>4. Navigate to profile page<br>5. Verify information                                      | • Updated information is still present<br>• Changes are persisted in database<br>• All modifications are retained<br>• No data loss occurs                                                     |
| **UAT-FR07-02** | Database verification of profile update    | 1. Note current profile data in database<br>2. Update profile through UI<br>3. Query database for user record<br>4. Compare values                                     | • Database contains updated values<br>• All changed fields are reflected in DB<br>• Timestamp/audit fields are updated (if applicable)<br>• Data integrity is maintained                       |
| **UAT-FR07-03** | Profile changes reflect across sessions    | 1. Update profile on Browser/Device 1<br>2. Log in to same account on Browser/Device 2<br>3. Navigate to profile<br>4. Verify information                              | • Updated information is displayed on second device<br>• Changes are synchronized<br>• No stale data is shown<br>• Database serves as single source of truth                                   |
| **UAT-FR07-04** | Concurrent profile updates handling        | 1. Log in on two different browsers with same account<br>2. Update different fields on each browser simultaneously<br>3. Save changes on both<br>4. Verify final state | • System handles concurrent updates gracefully<br>• Last write wins OR optimistic locking prevents conflicts<br>• No data corruption occurs<br>• User is notified of conflicts (if applicable) |
| **UAT-FR07-05** | Profile update transaction integrity       | 1. Update multiple profile fields<br>2. Simulate network interruption during save (if testable)<br>3. Check database state<br>4. Retry update                          | • Either all changes are saved or none<br>• No partial updates occur<br>• Database integrity is maintained<br>• User can retry the operation                                                   |

---

### FR8: Change Password

| Test Case ID    | Test Scenario                                   | Step-by-Step Instructions                                                                                                                                                                                          | Expected Result                                                                                                                                                                                                                             |
| --------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR08-01** | Change password with valid credentials          | 1. Log in to user account<br>2. Navigate to "Change Password" section<br>3. Enter current password<br>4. Enter new password (meeting requirements)<br>5. Confirm new password<br>6. Click "Change Password" button | • Success message is displayed<br>• Password is updated in database<br>• User can log in with new password<br>• Old password no longer works                                                                                                |
| **UAT-FR08-02** | Change password with incorrect current password | 1. Navigate to "Change Password" page<br>2. Enter wrong current password<br>3. Enter valid new password and confirmation<br>4. Click "Change Password" button                                                      | • Error message is displayed<br>• Error indicates current password is incorrect<br>• Password is not changed<br>• User can retry with correct password                                                                                      |
| **UAT-FR08-03** | Change password with weak new password          | 1. Navigate to "Change Password" page<br>2. Enter correct current password<br>3. Enter weak new password (not meeting requirements)<br>4. Click "Change Password" button                                           | • Validation error is displayed<br>• Error indicates password requirements<br>• Password is not changed<br>• Password strength indicator shows weakness                                                                                     |
| **UAT-FR08-04** | Change password with mismatched confirmation    | 1. Navigate to "Change Password" page<br>2. Enter correct current password<br>3. Enter new password<br>4. Enter different password in confirmation field<br>5. Click "Change Password" button                      | • Validation error is displayed<br>• Error indicates passwords don't match<br>• Password is not changed<br>• User can correct and resubmit                                                                                                  |
| **UAT-FR08-05** | Change password to same as current              | 1. Navigate to "Change Password" page<br>2. Enter current password<br>3. Enter the same password as new password<br>4. Click "Change Password" button                                                              | • Error message may indicate password must be different OR<br>• Password is updated (hash will be different due to new salt)<br>• System behavior follows business rules                                                                    |
| **UAT-FR08-06** | Session management after password change        | 1. Log in on Browser 1<br>2. Change password on Browser 1<br>3. Check if logged out automatically<br>4. Verify session on Browser 2 (if logged in there)                                                           | • User may be logged out after password change (security best practice) OR<br>• Current session continues, new password required for next login<br>• Other sessions are terminated (recommended)<br>• Behavior is documented and consistent |
| **UAT-FR08-07** | Change password validates all fields            | 1. Navigate to "Change Password" page<br>2. Leave one or more fields empty<br>3. Click "Change Password" button                                                                                                    | • Validation errors for all empty fields<br>• Form highlights required fields<br>• Password is not changed<br>• User is prompted to fill all fields                                                                                         |
| **UAT-FR08-08** | Password change notification (if implemented)   | 1. Complete successful password change<br>2. Check registered email inbox                                                                                                                                          | • Notification email is sent (security best practice)<br>• Email confirms password was changed<br>• Email includes timestamp and device/location info (optional)<br>• User can report unauthorized changes                                  |

---

### FR9: Account Deletion

| Test Case ID    | Test Scenario                                     | Step-by-Step Instructions                                                                                                                                                                                         | Expected Result                                                                                                                                                                                                                 |
| --------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR09-01** | Delete account with password confirmation         | 1. Log in to user account<br>2. Navigate to account settings or profile<br>3. Click "Delete Account" button<br>4. Enter password for confirmation<br>5. Confirm deletion action<br>6. Click final "Delete" button | • Confirmation dialog is displayed<br>• User must confirm deletion (prevent accidental deletion)<br>• Account is deleted from database OR marked as deleted<br>• User is logged out<br>• Success/confirmation message is shown  |
| **UAT-FR09-02** | Delete account with incorrect password            | 1. Navigate to "Delete Account" section<br>2. Click "Delete Account"<br>3. Enter incorrect password<br>4. Attempt to confirm deletion                                                                             | • Error message is displayed<br>• Error indicates incorrect password<br>• Account is not deleted<br>• User can retry or cancel                                                                                                  |
| **UAT-FR09-03** | Cancel account deletion                           | 1. Navigate to "Delete Account" section<br>2. Click "Delete Account"<br>3. View confirmation dialog<br>4. Click "Cancel" or "No" button                                                                           | • Deletion is cancelled<br>• Account remains active<br>• User is returned to previous page<br>• No changes to database                                                                                                          |
| **UAT-FR09-04** | Verify account deletion in database               | 1. Note user ID before deletion<br>2. Delete user account<br>3. Access database (admin)<br>4. Query for the deleted user                                                                                          | • User record is removed OR marked as deleted<br>• User data is anonymized/removed per privacy policy<br>• Related data is handled appropriately (cascade delete or soft delete)<br>• Deletion follows GDPR/privacy regulations |
| **UAT-FR09-05** | Login attempt with deleted account                | 1. Delete user account successfully<br>2. Navigate to login page<br>3. Attempt to login with deleted account credentials                                                                                          | • Login fails<br>• Error message indicates invalid credentials<br>• Account is not accessible<br>• No session is created                                                                                                        |
| **UAT-FR09-06** | Deleted account data cleanup                      | 1. Create account and generate data (chats, reports, etc.)<br>2. Delete account<br>3. Check database for user's associated data                                                                                   | • User's personal data is removed (per business rules)<br>• Chat history may be deleted or anonymized<br>• Reports may be retained for analytics or deleted<br>• Data handling follows privacy policy and regulations           |
| **UAT-FR09-07** | Account deletion notification (if implemented)    | 1. Delete user account<br>2. Check registered email (if not deleted immediately)                                                                                                                                  | • Confirmation email is sent<br>• Email confirms account deletion<br>• Email may include data export link (GDPR compliance)<br>• User is informed of data retention policy                                                      |
| **UAT-FR09-08** | Prevent deletion of admin account (if applicable) | 1. Log in as admin user<br>2. Navigate to "Delete Account"<br>3. Attempt to delete admin account                                                                                                                  | • Warning message is displayed OR<br>• Deletion is prevented for sole admin account<br>• System ensures at least one admin exists<br>• Additional confirmation required for admin deletion                                      |
| **UAT-FR09-09** | Re-registration with deleted account email        | 1. Delete user account<br>2. Attempt to register new account with same email                                                                                                                                      | • Registration succeeds (email is available)<br>• New account is created with fresh data<br>• No data from deleted account is accessible<br>• System treats it as completely new user                                           |

---

## Testing Prerequisites

### Test Environment Setup

- [ ] UAT environment is configured and accessible
- [ ] Database is set up with test data
- [ ] Email server is configured for testing (or email simulation tool)
- [ ] Test user accounts are created (public and admin roles)
- [ ] Browser developer tools are available for testers

### Required Access

- [ ] UAT application URL
- [ ] Test email accounts for verification emails
- [ ] Database access (read-only) for verification testing
- [ ] Admin credentials for role-based testing
- [ ] API documentation (if testing API endpoints directly)

### Test Data Requirements

- [ ] List of valid test emails
- [ ] List of test passwords (meeting requirements)
- [ ] Pre-registered user accounts
- [ ] Admin user accounts
- [ ] Sample user profile data

---

## Test Execution Guidelines

### General Testing Notes

1. **Browser Testing**: Execute tests on multiple browsers (Chrome, Firefox, Safari, Edge)
2. **Device Testing**: Test on desktop and mobile devices where applicable
3. **Network Conditions**: Test under normal and slow network conditions
4. **Documentation**: Document all defects with screenshots and steps to reproduce
5. **Security**: Never use real user credentials or sensitive data in UAT environment
6. **Email Verification**: Allow up to 5 minutes for email delivery in test environment

### Defect Reporting

When a test case fails, document:

- Test Case ID
- Actual Result vs Expected Result
- Steps to Reproduce
- Screenshots/Screen recordings
- Browser and Device Information
- Severity: Critical, High, Medium, Low
- Environment Details

### Pass/Fail Criteria

- **Pass**: All expected results are achieved
- **Fail**: Any expected result is not achieved
- **Blocked**: Test cannot be executed due to dependencies
- **N/A**: Test case not applicable for this release

---

## Sign-Off

| Role             | Name | Signature | Date |
| ---------------- | ---- | --------- | ---- |
| QA Lead          |      |           |      |
| Test Manager     |      |           |      |
| Product Owner    |      |           |      |
| Development Lead |      |           |      |

---

## Test Summary

| Total Test Cases | Passed | Failed | Blocked | N/A |
| ---------------- | ------ | ------ | ------- | --- |
| 59               |        |        |         |     |

### Notes

_Use this section to document any additional observations, risks, or recommendations from the testing phase._

---

**Document Version Control**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 10, 2026 | QA Team | Initial UAT Plan for Authentication and User Management |
