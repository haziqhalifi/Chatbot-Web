# User Profile and Settings UAT

## Feature: Profile Management

### UC-PROFILE-001: User Profile

```gherkin
Feature: User Profile Management
  As a user
  I want to manage my profile information
  So that my account reflects my preferences and identity

  Scenario: User views their profile
    Given I am logged in
    When I click on my profile icon
    And I select "View Profile"
    Then I should see my profile information
    And My email should be displayed
    And My account creation date should be shown
    And An "Edit Profile" button should be visible

  Scenario: User updates profile information
    Given I am on my profile page
    When I click "Edit Profile"
    And I update my display name to "John Doe"
    And I upload a new profile picture
    And I click "Save Changes"
    Then My profile should be updated
    And The changes should be visible immediately
    And A confirmation message should appear

  Scenario: User uploads profile picture
    Given I am editing my profile
    When I click "Upload Profile Picture"
    And I select an image file (JPG, PNG)
    And The file is less than 5MB
    Then The image should be uploaded
    And The image should be displayed as my avatar
    And A thumbnail should appear in chat

  Scenario: User removes profile picture
    Given I have a profile picture
    When I click "Remove Picture"
    And I confirm the removal
    Then The picture should be deleted
    And A default avatar should be displayed
    And The change should be saved

  Scenario: User views account statistics
    Given I am on my profile page
    When I view the statistics section
    Then I should see:
      - Total number of conversations
      - Total number of messages sent
      - Account age
      - Last login date and time
      - Subscription status (if applicable)
```

### Acceptance Criteria

- [ ] Profile loads within 2 seconds
- [ ] Profile picture upload works for JPG, PNG
- [ ] Max file size is 5MB
- [ ] Changes are saved immediately
- [ ] Avatar appears in all relevant places
- [ ] Profile is viewable by user only
- [ ] Statistics are calculated correctly

---

## Feature: User Settings

### UC-SETTINGS-001: Application Settings

```gherkin
Feature: User Settings
  As a user
  I want to customize my application experience
  So that the app works the way I prefer

  Scenario: User changes interface theme
    Given I am on the settings page
    When I navigate to "Appearance" section
    And I select "Dark Theme"
    And I click "Save"
    Then The interface should switch to dark theme
    And The setting should persist across sessions
    And All pages should display in dark theme

  Scenario: User adjusts text size
    Given I am on the settings page
    When I navigate to "Appearance" section
    And I set text size to "Large"
    And I click "Save"
    Then All text should appear larger
    And The change should apply to all pages
    And The setting should be saved

  Scenario: User enables/disables notifications
    Given I am on the settings page
    When I navigate to "Notifications" section
    And I toggle "Message notifications" OFF
    And I click "Save"
    Then I should not receive notifications for new messages
    And A confirmation should appear
    And The setting should persist

  Scenario: User sets notification preferences
    Given I am on the settings page
    When I navigate to "Notifications" section
    And I select notification types:
      - Sound notifications (ON)
      - Browser notifications (ON)
      - Email notifications (OFF)
    And I click "Save"
    Then Only selected notification types should be active
    And The preferences should be saved

  Scenario: User selects preferred language
    Given I am on the settings page
    When I navigate to "Language" section
    And I select "Spanish" from dropdown
    And I click "Save"
    Then The entire interface should switch to Spanish
    And All messages should be in Spanish
    And The setting should persist
```

### Acceptance Criteria

- [ ] Settings are saved to database
- [ ] Settings persist across sessions
- [ ] Theme changes apply immediately
- [ ] Text size changes are applied site-wide
- [ ] Notification toggles work correctly
- [ ] Language changes affect all text
- [ ] Settings validation prevents invalid values
- [ ] User can reset to defaults

---

## Feature: Account Security Settings

### UC-SETTINGS-002: Security Settings

```gherkin
Feature: Account Security Settings
  As a user
  I want to manage my account security
  So that my account is protected

  Scenario: User changes password
    Given I am on the security settings page
    When I click "Change Password"
    And I enter my current password
    And I enter a new password "NewSecure123!@"
    And I confirm the new password
    And I click "Change Password"
    Then My password should be changed
    And I should see a confirmation message
    And I should be able to login with the new password

  Scenario: User enables two-factor authentication
    Given I am on the security settings page
    When I click "Enable Two-Factor Authentication"
    And I select "Authenticator App"
    And I scan the QR code with an authenticator app
    And I enter the 6-digit code
    Then Two-factor authentication should be enabled
    And A backup code should be provided
    And I should save the backup code securely

  Scenario: User disables two-factor authentication
    Given Two-factor authentication is enabled
    When I click "Disable Two-Factor Authentication"
    And I enter my password for confirmation
    And I confirm the action
    Then Two-factor authentication should be disabled
    And I should see a confirmation message

  Scenario: User reviews active sessions
    Given I am on the security settings page
    When I navigate to "Active Sessions"
    Then I should see a list of all active sessions including:
      - Device type (Desktop, Mobile, Tablet)
      - Browser and OS
      - IP address
      - Last activity time
    And I should be able to logout from any session

  Scenario: User logs out from another device
    Given I have multiple active sessions
    When I click "Logout" on a session
    And I confirm the action
    Then That session should be terminated
    And That device will be logged out
    And A notification should be sent to that device
```

### Acceptance Criteria

- [ ] Password change requires current password
- [ ] 2FA setup requires QR code scan
- [ ] Backup codes are provided and saved
- [ ] Sessions list shows all active sessions
- [ ] Logout from another device works
- [ ] Security notifications are sent
- [ ] Session timeouts are enforced

---

## Feature: Notification Preferences

### UC-NOTIF-001: Notification Management

```gherkin
Feature: Notification Preferences
  As a user
  I want to manage my notification settings
  So that I only receive relevant notifications

  Scenario: User views all notifications
    Given I am logged in
    When I click the notification bell icon
    Then A notification panel should open
    And I should see all my recent notifications
    And Notifications should be sorted by date (newest first)
    And Unread notifications should be highlighted

  Scenario: User marks notification as read
    Given I have unread notifications
    When I click on a notification
    Then The notification should be marked as read
    And The highlight should disappear
    And The notification count should update

  Scenario: User deletes a notification
    Given I have notifications
    When I hover over a notification
    And I click the delete (X) button
    And I confirm the deletion
    Then The notification should be removed
    And The notification count should decrease

  Scenario: User marks all notifications as read
    Given I have multiple unread notifications
    When I click "Mark all as read"
    Then All notifications should be marked as read
    And The notification count should reset to 0
    And The highlights should disappear

  Scenario: User receives new notification in real-time
    Given I am on the chat page
    When A new message arrives
    Then A notification should appear in real-time
    And The notification bell should show a badge with count
    And Sound and/or popup should appear (if enabled)
    And I should be able to click the notification to go to the message
```

### Acceptance Criteria

- [ ] Notifications load within 2 seconds
- [ ] Real-time notifications appear instantly
- [ ] Notification count is accurate
- [ ] Delete removes permanently
- [ ] Read/unread status changes immediately
- [ ] Notifications persist in database
- [ ] Sound notifications respect settings

---

## Feature: Multi-Language Support

### UC-LANG-001: Language Settings

```gherkin
Feature: Multi-Language Support
  As a user who speaks multiple languages
  I want the application to be available in my language
  So that I can use it comfortably

  Scenario: User changes application language
    Given I am on the settings page
    When I navigate to "Language"
    And I select "Spanish" from the language dropdown
    And I click "Save"
    Then The entire interface should display in Spanish
    And All menus, buttons, and labels should be translated
    And The change should persist on next login

  Scenario: Chat responses are in user's preferred language
    Given My language is set to "French"
    When I send a chat message
    Then The bot response should be in French
    And Formatting should be preserved
    And Special characters should display correctly

  Scenario: Right-to-left languages are supported
    Given I am using a right-to-left language (Arabic, Hebrew)
    When I interact with the application
    Then All text should flow right to left
    And Messages should align correctly
    And Chat input should support RTL text entry

  Scenario: Date and time format matches language
    Given My language is set to "German"
    When I view timestamps and dates
    Then Dates should use German format (DD.MM.YYYY)
    And Time should display in 24-hour format
    And Currency (if applicable) should use locale symbol
```

### Acceptance Criteria

- [ ] All UI text is translated
- [ ] Chat responses are in selected language
- [ ] Language changes are persistent
- [ ] RTL languages display correctly
- [ ] Date/time formats match locale
- [ ] At least 5 languages supported (EN, ES, FR, DE, ZH)
- [ ] Translation quality is professional

---

## Feature: Data Export and Privacy

### UC-PRIVACY-001: User Data Management

```gherkin
Feature: Data Export and Privacy
  As a user
  I want to manage my data
  So that I can export or delete my information as needed

  Scenario: User exports their data
    Given I am on the privacy settings page
    When I click "Export My Data"
    And I confirm the action
    Then An export process should start
    And I should receive an email with download link within 1 hour
    And The export should include:
      - Profile information
      - All chat messages
      - Settings
      - Notification preferences

  Scenario: User deletes their account
    Given I am on the account settings page
    When I scroll to "Delete Account"
    And I click "Delete My Account"
    And I enter my password for confirmation
    And I confirm that I understand this is irreversible
    Then My account should be scheduled for deletion
    And I should receive a confirmation email
    And After 30 days, all my data should be permanently deleted
    And A grace period of 30 days allows account recovery
```

### Acceptance Criteria

- [ ] Data export includes all user data
- [ ] Export is provided in standard format (JSON/CSV)
- [ ] Account deletion requires password confirmation
- [ ] 30-day grace period before permanent deletion
- [ ] Deletion email is sent immediately
- [ ] GDPR compliance is met
