# Notifications UAT

## Feature: Real-Time Notifications

### UC-NOTIF-001: Message Notifications

```gherkin
Feature: Real-Time Chat Notifications
  As a user
  I want to receive notifications about new messages
  So that I don't miss any important conversations

  Scenario: User receives notification for new message
    Given I have a chat conversation with messages
    And I am not currently viewing that chat
    When A new message arrives in that conversation
    Then I should receive a notification
    And The notification should appear within 2 seconds
    And The notification should display:
      - Sender's name
      - Message preview (first 50 characters)
      - Timestamp
    And A badge with message count should appear on the chat icon

  Scenario: Notification sound plays for new message
    Given I have sound notifications enabled
    And I have chat notifications enabled
    When A new message arrives
    Then A notification sound should play
    And The sound should play only once per message
    And The sound can be muted from notification center
    And The notification should still appear (without sound if muted)

  Scenario: Notification disappears when message is read
    Given I receive a notification for a new message
    When I click on the notification or open that chat
    And I view the message
    Then The notification should disappear
    And The badge count should decrease
    And The message should be marked as read

  Scenario: Multiple messages create one grouped notification
    Given I receive multiple messages in quick succession
    When 3+ messages arrive within 5 seconds
    Then They should be grouped into one notification
    And The notification should show:
      - "3 new messages from [Conversation Name]"
      - List of senders
    And Clicking should open that conversation

  Scenario: User can reply directly from notification
    Given I have a notification for a new message
    When I click the notification
    And I see a quick reply option
    And I type a response and press send
    Then My message should be sent immediately
    And The notification should close
    And The conversation should open

  Scenario: Notification persists if user doesn't acknowledge
    Given A notification appears
    When I don't click on it for 10 seconds
    Then The notification should remain visible
    And The badge should continue to show count
    And I can click it anytime to view the message
```

### Acceptance Criteria

- [ ] Notifications appear within 2 seconds of message arrival
- [ ] Notification includes sender name and message preview
- [ ] Sound notifications work (volume can be controlled)
- [ ] Notifications disappear when message is read
- [ ] Multiple messages are grouped intelligently
- [ ] Direct reply from notification works
- [ ] Notification count is accurate
- [ ] Notifications work across browser tabs

---

## Feature: System Notifications

### UC-NOTIF-002: Administrative Notifications

```gherkin
Feature: System and Administrative Notifications
  As a user
  I want to be notified about system events
  So that I'm aware of important changes

  Scenario: User receives system announcement
    Given An admin sends a system announcement
    When The announcement is published
    Then All users should receive a notification
    And The notification should display:
      - Announcement title
      - Announcement message
      - Publish time
    And The notification should not auto-dismiss

  Scenario: User receives subscription notification
    Given I have an active subscription
    When My subscription is about to expire
    And The expiration is 7 days away
    Then I should receive a notification
    And The notification should include:
      - Renewal date
      - Renewal amount (if applicable)
      - Renewal link
    And A reminder should be sent 1 day before expiration

  Scenario: User receives account activity notification
    Given I have login notifications enabled
    When I login from a new device or location
    Then I should receive a notification that says:
      - "New login detected"
      - Device type
      - Location (city, country)
      - Date and time
      - "If this wasn't you, secure your account"

  Scenario: User receives maintenance notification
    Given Planned maintenance is scheduled
    When The maintenance window is announced
    Then All users should be notified
    And The notification should include:
      - Maintenance start time
      - Expected duration
      - Services affected
      - Reason (if applicable)

  Scenario: User receives update notification
    Given A new feature or update is released
    When The update is deployed
    Then Users should receive a notification
    And The notification should include:
      - Update title
      - Key features/changes
      - Learn more link
      - Release notes link
```

### Acceptance Criteria

- [ ] System notifications are delivered to all users
- [ ] Announcements are displayed prominently
- [ ] Subscription reminders are sent at correct intervals
- [ ] Login notifications include device and location
- [ ] Maintenance notices include accurate timing
- [ ] Update notifications include links to details
- [ ] All users receive notifications within 5 minutes

---

## Feature: Notification Delivery and Channels

### UC-NOTIF-003: Multi-Channel Notifications

```gherkin
Feature: Multi-Channel Notification Delivery
  As a user
  I want notifications delivered through my preferred channels
  So that I receive them in the way that works best for me

  Scenario: User receives in-app notification
    Given I have in-app notifications enabled
    When An event occurs that triggers a notification
    Then A notification should appear in the app
    And The notification should be in the notification center
    And The notification bell should show a badge

  Scenario: User receives browser notification
    Given I have browser notifications enabled
    And The browser supports notifications
    When A notification is triggered
    Then A browser notification should appear
    And Even if the tab is not in focus, I should see it
    And I can click the notification to focus the app
    And I can close the notification with the X button

  Scenario: User receives email notification
    Given I have email notifications enabled
    When A message arrives
    And The message is from someone important (starred contact)
    Then An email should be sent to my registered email
    And The email should include:
      - Sender name
      - Message preview
      - Link to the message in the app
    And The email should arrive within 5 minutes

  Scenario: User can customize notification channels
    Given I am on notification settings
    When I select my preferences:
      - In-app: ON
      - Browser: ON
      - Email: OFF
    And I click "Save"
    Then Only enabled channels will deliver notifications
    And Disabled channels will not send anything
    And The preferences should persist

  Scenario: User receives batched email notifications
    Given I have email notifications enabled
    And I receive multiple messages
    When More than 3 messages arrive within 1 hour
    Then They should be batched into one email
    And The email should list all messages
    And Each message should be summarized

  Scenario: Email notifications include unsubscribe link
    Given I receive an email notification
    When I open the email
    Then An unsubscribe link should be present at the bottom
    And Clicking it should disable email notifications
    And It should NOT delete my account or data
```

### Acceptance Criteria

- [ ] In-app notifications appear immediately
- [ ] Browser notifications work in supported browsers
- [ ] Browser notifications work even when tab is not focused
- [ ] Email notifications include message preview
- [ ] Email notifications include direct action link
- [ ] Notification channels respect user preferences
- [ ] Batched emails are intelligently grouped
- [ ] All email notifications have unsubscribe option

---

## Feature: Notification Management

### UC-NOTIF-004: User Controls

```gherkin
Feature: Notification Management
  As a user
  I want full control over my notifications
  So that I can manage information overload

  Scenario: User views notification history
    Given I am on the notification center
    When I scroll through notifications
    Then I should see:
      - All notifications from the past 30 days
      - Each notification with timestamp
      - Unread indicators
      - Notification type/category
    And I should be able to filter by type

  Scenario: User marks notification as important
    Given I have a notification
    When I click the star icon on the notification
    Then The notification should be marked as important
    And It should appear in an "Important" section
    And Important notifications should never be auto-deleted

  Scenario: User archives a notification
    Given I have a notification
    When I click the archive button
    Then The notification should be moved to archive
    And It should no longer appear in the main list
    And I can view archived notifications separately
    And The badge count should decrease

  Scenario: User clears all notifications
    Given I have multiple notifications
    When I click "Clear All"
    And I confirm the action
    Then All notifications should be deleted
    And The notification badge should disappear
    And The notification center should show "No notifications"

  Scenario: User temporarily silences notifications
    Given Notifications are enabled
    When I click "Do Not Disturb" mode
    And I select a duration (30 min, 1 hour, 2 hours, 1 day)
    Then No notifications should appear during that time
    And A "Do Not Disturb" indicator should show
    And Important notifications can still be configured to bypass this
    And The mode will automatically turn off after the duration

  Scenario: User sets quiet hours
    Given I am on notification settings
    When I enable "Quiet Hours"
    And I set quiet hours from 22:00 to 08:00
    And I save
    Then No notifications will be delivered during those hours
    And Messages will be queued and delivered after quiet hours end
    And High-priority notifications can bypass this (configurable)
```

### Acceptance Criteria

- [ ] Notification history shows 30 days of data
- [ ] Filtering by type works correctly
- [ ] Star/important marking persists
- [ ] Archive functionality works
- [ ] Clearing notifications deletes all
- [ ] Do Not Disturb mode silences notifications
- [ ] Quiet hours are respected
- [ ] Duration settings work correctly

---

## Feature: Notification Settings

### UC-NOTIF-005: Preference Configuration

```gherkin
Feature: Notification Preferences Configuration
  As a user
  I want to configure exactly what notifications I receive
  So that I'm not overwhelmed by irrelevant notifications

  Scenario: User configures message notifications
    Given I am on notification settings
    When I navigate to "Message Notifications"
    Then I should see toggles for:
      - New message notifications (ON)
      - Message reactions (OFF)
      - Mentions (@username) (ON)
      - Direct mentions in group chats (ON)
    And Each toggle should save immediately

  Scenario: User configures frequency of notifications
    Given I am on notification settings
    When I navigate to "Notification Frequency"
    And I select "Batched - Every 30 minutes"
    And I click Save
    Then Notifications should be grouped and sent every 30 minutes
    And I can select: Instant / Hourly / Daily / Weekly / Never

  Scenario: User creates custom notification rules
    Given I am on notification settings
    When I click "Create Custom Rule"
    And I set the rule:
      - When: Message from [specific contact]
      - Then: High priority notification + sound
    And I save the rule
    Then The rule should apply to future notifications
    And Messages from that contact will use these settings

  Scenario: User whitelist/blacklist contacts for notifications
    Given I am on notification settings
    When I navigate to "Notification Exceptions"
    And I add contacts to "Always Notify" list
    And I add contacts to "Never Notify" list
    And I save
    Then The specified contacts will override global settings
    And "Always Notify" contacts will always trigger notifications
    And "Never Notify" contacts will never trigger notifications

  Scenario: User receives notification summary
    Given I have "Notification Summary" enabled
    When The summary time arrives (daily/weekly)
    Then I should receive one email with:
      - All notifications from that period
      - Important events highlighted
      - Statistics (messages, mentions, etc.)
    And The summary format should be clear and organized
```

### Acceptance Criteria

- [ ] All notification toggles work correctly
- [ ] Settings save immediately or show confirmation
- [ ] Notification frequency options work
- [ ] Custom rules are applied correctly
- [ ] Whitelist/blacklist override global settings
- [ ] Summary emails are sent at correct intervals
- [ ] All preferences persist across sessions
