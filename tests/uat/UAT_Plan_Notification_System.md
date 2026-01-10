# User Acceptance Testing (UAT) Plan

## Module 4: Notification System

### Document Information

- **Module**: Notification System
- **Version**: 1.0
- **Date**: January 10, 2026
- **Test Environment**: UAT Environment
- **Tester**: [To be filled by QA team]

---

## Test Cases

### FR24: System Sends Notifications for Relevant Events

| Test Case ID    | Test Scenario                                   | Step-by-Step Instructions                                                                                                                                                                   | Expected Result                                                                                                                                                                                                                                  |
| --------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **UAT-FR24-01** | Notify user when their report status is updated | 1. User submits incident report<br>2. Admin updates report status to "Verified"<br>3. Check user's notification center or email<br>4. Observe notification details                          | • User receives notification immediately<br>• Notification indicates status change<br>• Notification includes report details/ID<br>• Notification is clear and actionable<br>• Timestamp is included                                             |
| **UAT-FR24-02** | Notify user when report is rejected             | 1. User submits incident report<br>2. Admin rejects the report with reason<br>3. Check user's notifications<br>4. View rejection details                                                    | • User is notified of rejection<br>• Rejection reason is included (if provided)<br>• Notification prompts appropriate action<br>• User can view full report details from notification<br>• Clear next steps are communicated                     |
| **UAT-FR24-03** | Notify user when report is approved/verified    | 1. User submits report<br>2. Admin marks report as "Verified"<br>3. Check user notifications<br>4. View notification content                                                                | • Notification confirms report verification<br>• Notification thanks user for submission<br>• User sees positive feedback<br>• Notification includes relevant details<br>• User is encouraged for future reports                                 |
| **UAT-FR24-04** | Notify user of disaster/emergency alert         | 1. Admin publishes emergency alert in system<br>2. Check user notifications<br>3. Verify alert details<br>4. Confirm alert urgency                                                          | • Alert notification is sent immediately<br>• Alert includes incident type and location<br>• Alert specifies affected areas<br>• Alert includes emergency instructions<br>• Alert is prominently displayed                                       |
| **UAT-FR24-05** | Notify users about chatbot availability         | 1. Deploy chatbot or update chatbot features<br>2. Send notification to users<br>3. Check user notifications                                                                                | • Notification about chatbot is delivered<br>• Feature highlights are included<br>• User can access chatbot from notification<br>• Notification is informative<br>• Timing is appropriate                                                        |
| **UAT-FR24-06** | Notify multiple users simultaneously            | 1. Trigger event that affects multiple users (e.g., system maintenance alert)<br>2. Check if all relevant users receive notification<br>3. Verify each user receives their own notification | • All relevant users receive notification<br>• Each user gets individual notification<br>• No duplicate notifications<br>• All notifications are delivered<br>• Timing is consistent across users                                                |
| **UAT-FR24-07** | In-app notification display                     | 1. Log in to application<br>2. Trigger event that generates notification<br>3. Check in-app notification area<br>4. Observe notification presentation                                       | • In-app notification appears (badge/bell icon)<br>• Notification is visible in notification center<br>• Notification includes preview text<br>• User can click to view full details<br>• Notification count is accurate                         |
| **UAT-FR24-08** | Email notification delivery                     | 1. Ensure user email is configured<br>2. Trigger notification event<br>3. Check user's email inbox<br>4. Verify email content                                                               | • Email is sent to user's registered email<br>• Email arrives within reasonable time (5-10 min)<br>• Email content is clear and professional<br>• Email includes action links (if applicable)<br>• Email format is mobile-friendly               |
| **UAT-FR24-09** | Push notification (if supported)                | 1. Install mobile app on user device<br>2. Enable push notifications<br>3. Trigger notification event<br>4. Observe mobile notification                                                     | • Push notification appears on mobile device<br>• Notification includes relevant details<br>• User can tap to open app and view full notification<br>• Notification sound/vibration works (per settings)<br>• Notification persists until viewed |
| **UAT-FR24-10** | Notification for new system announcements       | 1. Admin creates system announcement<br>2. Publish announcement to users<br>3. Check user notifications<br>4. View announcement content                                                     | • Users are notified of new announcements<br>• Announcement details are included<br>• User can access full announcement easily<br>• Notification directs to announcement page<br>• Unread count is accurate                                      |
| **UAT-FR24-11** | Notification filtering based on event type      | 1. System generates multiple event types (report update, alert, announcement)<br>2. Check notification center<br>3. Verify notifications are appropriate                                    | • Each notification type is delivered correctly<br>• Notifications are properly categorized<br>• User can distinguish between types<br>• Relevant information is included for each type<br>• Notifications are not mixed up                      |
| **UAT-FR24-12** | Avoid duplicate notifications                   | 1. Trigger event that generates notification<br>2. Check if multiple notifications are sent for same event<br>3. Monitor notification logs                                                  | • Only one notification per event<br>• No duplicate messages<br>• System deduplication works correctly<br>• User is not overwhelmed with notifications<br>• Clean notification history                                                           |

---

### FR25: Store Notifications in Database

| Test Case ID    | Test Scenario                           | Step-by-Step Instructions                                                                                                              | Expected Result                                                                                                                                                                                                                |
| --------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **UAT-FR25-01** | Notification stored in database         | 1. Trigger notification event<br>2. Access database (admin)<br>3. Query notifications table<br>4. Verify notification record           | • Notification is stored in database<br>• All notification details are captured<br>• Record includes user ID, event type, timestamp<br>• Notification content is preserved<br>• Database record is accurate                    |
| **UAT-FR25-02** | Notification metadata captured          | 1. Generate notification<br>2. Query database for notification<br>3. Check metadata fields<br>4. Verify all fields are populated       | • Notification ID is generated<br>• User ID is recorded<br>• Event type is stored<br>• Timestamp is recorded (creation and read time)<br>• Related IDs (report ID, alert ID) are linked<br>• Additional metadata as applicable |
| **UAT-FR25-03** | Multiple notifications stored correctly | 1. Generate 5 notifications for same user<br>2. Query database<br>3. Verify all notifications are stored<br>4. Check for any data loss | • All notifications are stored<br>• Each notification has unique ID<br>• No notifications are lost<br>• Order is maintained (chronological)<br>• Database integrity is preserved                                               |
| **UAT-FR25-04** | Notification storage across users       | 1. Trigger notification for User A<br>2. Trigger notification for User B<br>3. Query database for both users<br>4. Verify separation   | • User A's notifications are stored<br>• User B's notifications are stored separately<br>• No cross-user data contamination<br>• Each user's notifications are isolated<br>• Database relationships are correct                |
| **UAT-FR25-05** | Long notification content stored        | 1. Create notification with long content<br>2. Store in database<br>3. Retrieve from database<br>4. Verify content integrity           | • Full content is stored (no truncation)<br>• Special characters are preserved<br>• Formatting/line breaks maintained<br>• Content retrieved matches original<br>• No data corruption occurs                                   |
| **UAT-FR25-06** | Notification timestamp accuracy         | 1. Generate notification<br>2. Check database timestamp<br>3. Compare with system time<br>4. Verify timezone handling                  | • Timestamp is accurate (within 1 second)<br>• Timezone is handled correctly<br>• Both creation and read times are stored<br>• Time can be used for sorting/filtering<br>• Daylight saving time handled appropriately          |
| **UAT-FR25-07** | Notification status tracking            | 1. Generate notification<br>2. Check database for read/unread status<br>3. Mark notification as read<br>4. Verify status update        | • Unread status is initially set<br>• Status field exists in database<br>• Status can be updated<br>• Read/unread can be queried<br>• Status change timestamp is recorded                                                      |
| **UAT-FR25-08** | Email notification storage              | 1. Notification triggers email send<br>2. Check database for email notification record<br>3. Verify email delivery status is recorded  | • Email notification is stored<br>• Email address is recorded<br>• Delivery status is tracked (sent, failed)<br>• Delivery timestamp is recorded<br>• Retry attempts (if applicable) are logged                                |
| **UAT-FR25-09** | Database query performance              | 1. Generate 1000+ notifications<br>2. Query by user ID<br>3. Query by date range<br>4. Measure response time                           | • Queries return results quickly (< 1 second)<br>• Indexes are efficient<br>• Database performs well with large dataset<br>• No timeout errors<br>• Pagination works efficiently                                               |
| **UAT-FR25-10** | Data retention policy enforcement       | 1. Check old notifications (30+ days old)<br>2. Verify if they're retained or archived<br>3. Check retention policy implementation     | • Notifications are retained per policy<br>• Old notifications remain queryable OR<br>• Archived appropriately<br>• Policy is enforced automatically<br>• Admin can configure retention (if applicable)                        |

---

### FR26: Mark Notifications as Read/Unread

| Test Case ID    | Test Scenario                                  | Step-by-Step Instructions                                                                                                                         | Expected Result                                                                                                                                                                                                          |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **UAT-FR26-01** | Mark single notification as read               | 1. User has unread notification<br>2. Click on notification<br>3. Observe status change<br>4. Check notification center                           | • Notification is marked as read<br>• Read status is visually indicated (icon changes)<br>• Unread count decreases<br>• Database is updated<br>• Change is immediate                                                     |
| **UAT-FR26-02** | Mark single notification as unread             | 1. User views read notification<br>2. Right-click or find "Mark as Unread" option<br>3. Click option<br>4. Verify status change                   | • Notification is marked as unread<br>• Visual indicator shows unread<br>• Unread count increases<br>• Database is updated<br>• Change is reflected immediately                                                          |
| **UAT-FR26-03** | Unread badge/counter                           | 1. User has multiple unread notifications<br>2. Check notification badge/counter<br>3. Verify count matches actual unread                         | • Badge shows unread count<br>• Count is accurate<br>• Badge is visible and prominent<br>• Count updates as notifications are read<br>• Badge disappears when all read (if 0)                                            |
| **UAT-FR26-04** | Mark all notifications as read                 | 1. User has multiple unread notifications<br>2. Find "Mark All as Read" option<br>3. Click to mark all<br>4. Verify all are marked                | • All unread notifications marked as read<br>• Unread count goes to 0<br>• Badge disappears<br>• All notifications show read status<br>• Operation completes successfully                                                |
| **UAT-FR26-05** | Toggle read/unread multiple times              | 1. Mark notification as read<br>2. Mark same notification as unread<br>3. Mark as read again<br>4. Verify status accuracy                         | • Status toggling works correctly<br>• No data corruption with multiple toggles<br>• Final status is accurate<br>• Database consistency maintained<br>• No side effects occur                                            |
| **UAT-FR26-06** | Read status persistence                        | 1. Mark notification as read<br>2. Close application/browser<br>3. Log in again<br>4. Check notification status                                   | • Read status is persisted<br>• Status is retained after logout/login<br>• Status is consistent across sessions<br>• Database state is maintained<br>• No data loss occurs                                               |
| **UAT-FR26-07** | Read status visibility                         | 1. View notifications list<br>2. Check visual indicators for read/unread<br>3. Distinguish between read and unread<br>4. Verify clarity           | • Read notifications have different styling<br>• Unread notifications are highlighted/bold<br>• Distinction is clear<br>• Icons or colors help differentiation<br>• User can quickly identify unread                     |
| **UAT-FR26-08** | Filter by read status                          | 1. Access notification preferences/filters<br>2. Show "Unread Only" or "Read Only"<br>3. Apply filter<br>4. Verify filtered results               | • Filter option is available<br>• Can show only unread notifications<br>• Can show only read notifications<br>• Can show all (filter cleared)<br>• Filter works correctly                                                |
| **UAT-FR26-09** | Sort by read status                            | 1. Access notification list<br>2. Look for sort options<br>3. Sort by read status<br>4. Verify ordering                                           | • Unread notifications appear first (or last)<br>• Read notifications follow<br>• Sort is consistent<br>• User can customize sort order (if applicable)<br>• Sorting doesn't affect other data                           |
| **UAT-FR26-10** | Bulk mark notifications as read                | 1. Select multiple notifications (checkbox)<br>2. Choose "Mark as Read" action<br>3. Apply to all selected<br>4. Verify all are marked            | • Multiple selection is available<br>• Bulk action applies to all selected<br>• All notifications marked correctly<br>• Unread count updates<br>• Confirmation is provided                                               |
| **UAT-FR26-11** | Read/unread on mobile device                   | 1. Log in on mobile device<br>2. View notifications<br>3. Mark notifications as read/unread<br>4. Verify functionality                            | • Read/unread feature works on mobile<br>• UI is mobile-optimized<br>• Gestures/taps work correctly<br>• Status changes are immediate<br>• Mobile UX is functional                                                       |
| **UAT-FR26-12** | Automatic mark as read on view (if applicable) | 1. Receive new notification<br>2. Click to view notification details<br>3. Check if automatically marked as read<br>4. Verify behavior per design | • Notification may auto-mark as read when opened (depending on design)<br>• OR manually mark option is provided<br>• Behavior is consistent and documented<br>• No confusion for user<br>• Behavior matches expectations |

---

### FR27: Admins Send Targeted Notifications

| Test Case ID    | Test Scenario                             | Step-by-Step Instructions                                                                                                                                                                                 | Expected Result                                                                                                                                                                                                              |
| --------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR27-01** | Admin access notification creation        | 1. Log in as admin<br>2. Navigate to admin panel<br>3. Locate "Send Notification" option<br>4. Access notification creation form                                                                          | • Admin can access notification feature<br>• Form is available and functional<br>• All required fields are present<br>• Form loads without errors                                                                            |
| **UAT-FR27-02** | Send notification to all users            | 1. Log in as admin<br>2. Create notification<br>3. Select "All Users" as recipient<br>4. Send notification<br>5. Verify all users receive it                                                              | • "All Users" recipient option exists<br>• Notification is sent to all active users<br>• Each user receives individual notification<br>• No user is missed<br>• Delivery is successful                                       |
| **UAT-FR27-03** | Send notification to specific user        | 1. Log in as admin<br>2. Create notification<br>3. Select specific user as recipient<br>4. Send notification<br>5. Verify only that user receives it                                                      | • Single user selection is available<br>• Notification is sent only to selected user<br>• Other users don't receive it<br>• User receives correct notification<br>• Targeting is accurate                                    |
| **UAT-FR27-04** | Send notification to user group           | 1. Log in as admin<br>2. Create notification<br>3. Select user group (e.g., by location, disaster type)<br>4. Send to group<br>5. Verify group receives it                                                | • Group selection is available<br>• Groups can be predefined (by location, interests)<br>• Notification sent to all group members<br>• Non-members don't receive<br>• Group targeting works correctly                        |
| **UAT-FR27-05** | Compose notification content              | 1. Access notification creation form<br>2. Enter title/subject<br>3. Enter message body<br>4. Include any attachments/links<br>5. Preview before sending                                                  | • Text editor is functional<br>• Title field is present<br>• Message body allows rich text (optional)<br>• Formatting options available<br>• Preview shows how notification will appear                                      |
| **UAT-FR27-06** | Schedule notification for future delivery | 1. Create notification<br>2. Look for scheduling option<br>3. Set delivery date and time<br>4. Schedule notification<br>5. Verify delivery at scheduled time                                              | • Scheduling option is available (if supported)<br>• Date/time picker works<br>• Notification is sent at scheduled time<br>• Timezone is handled correctly<br>• Confirmation of scheduling provided                          |
| **UAT-FR27-07** | Emergency/Priority notification           | 1. Create notification<br>2. Mark as "Emergency" or "High Priority"<br>3. Send notification<br>4. Check notification appearance                                                                           | • Priority level can be set<br>• High priority appears differently to users<br>• Users can identify urgent notifications<br>• Delivery may be prioritized<br>• Special handling for emergencies                              |
| **UAT-FR27-08** | Notification template usage               | 1. Look for pre-made templates (if available)<br>2. Select template<br>3. Customize template content<br>4. Send using template                                                                            | • Templates exist for common notifications<br>• Templates save time for admins<br>• Templates can be customized<br>• Templates are professional and clear<br>• Admin can create new templates (if applicable)                |
| **UAT-FR27-09** | Cancel/Recall notification (if supported) | 1. Send notification<br>2. Attempt to recall (if feature exists)<br>3. Verify action<br>4. Check if users see revocation                                                                                  | • Recall option may be available for recently sent<br>• Notification is cancelled/retracted<br>• Users are notified of cancellation (if applicable)<br>• System prevents accidental sends                                    |
| **UAT-FR27-10** | Notification audit log                    | 1. Send notifications as admin<br>2. Access admin audit/activity log<br>3. Check notification sending history<br>4. Verify details are logged                                                             | • Each notification send is logged<br>• Log includes: admin, recipients, timestamp, content<br>• Log is searchable/filterable<br>• Audit trail is maintained<br>• Historical record is accurate                              |
| **UAT-FR27-11** | Target by disaster type/location          | 1. Admin creates notification about specific disaster type<br>2. Select targeting by disaster (e.g., "Flood")<br>3. Select location (e.g., "Kuala Lumpur")<br>4. Send notification<br>5. Verify targeting | • Disaster type filter is available<br>• Location filter is available<br>• Notification sent to users interested in that disaster type/location<br>• Irrelevant users don't receive<br>• Targeting respects user preferences |
| **UAT-FR27-12** | Multi-channel notification from admin     | 1. Create notification as admin<br>2. Select delivery channels (in-app, email, SMS)<br>3. Send notification<br>4. Verify delivery across channels                                                         | • Multiple channel options available<br>• Admin can select channels to use<br>• Notification sent via selected channels<br>• Users receive on chosen channels<br>• Consistent message across channels                        |

---

### FR28: Real-Time Notification Delivery

| Test Case ID    | Test Scenario                              | Step-by-Step Instructions                                                                                                                                     | Expected Result                                                                                                                                                                                             |
| --------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR28-01** | Real-time in-app notification              | 1. User has browser open with app active<br>2. Admin sends notification<br>3. Check user's notification area<br>4. Observe notification appearance            | • Notification appears in real-time (< 2 seconds)<br>• No page refresh needed<br>• Notification badge updates immediately<br>• Sound/visual alert (if enabled)<br>• User sees notification instantly        |
| **UAT-FR28-02** | WebSocket connection for real-time updates | 1. Trigger notification event<br>2. Monitor network (developer tools)<br>3. Check for WebSocket messages<br>4. Verify real-time push                          | • WebSocket connection is established<br>• Real-time updates use WebSocket (or similar)<br>• Messages are pushed instantly<br>• Connection is maintained<br>• No polling delays                             |
| **UAT-FR28-03** | Real-time across multiple tabs             | 1. Open application in 2 browser tabs<br>2. Trigger notification event<br>3. Check both tabs<br>4. Verify notification appears in both                        | • Notification delivered to all active tabs<br>• Badge updates in both tabs<br>• No discrepancy between tabs<br>• User sees consistent state<br>• Synchronization works                                     |
| **UAT-FR28-04** | Real-time across multiple devices          | 1. Log in on mobile device<br>2. Keep desktop logged in too<br>3. Trigger notification event<br>4. Check both devices                                         | • Notification delivered to mobile<br>• Notification delivered to desktop<br>• Both receive simultaneously<br>• User sees on active device<br>• Real-time works across platforms                            |
| **UAT-FR28-05** | Fallback when real-time unavailable        | 1. Disable WebSocket (simulate connection loss)<br>2. Trigger notification event<br>3. Check if notification still delivered<br>4. Verify fallback mechanism  | • If WebSocket fails, system falls back to polling<br>• Notification still delivered (with slight delay)<br>• User is eventually notified<br>• No notifications are lost<br>• Graceful degradation works    |
| **UAT-FR28-06** | Real-time notification status update       | 1. Notification is sent to user<br>2. Admin updates notification status<br>3. Check user's in-app view<br>4. Observe real-time status change                  | • Status changes are pushed in real-time<br>• User sees updated status immediately<br>• No manual refresh needed<br>• Real-time update is smooth<br>• Database reflects change                              |
| **UAT-FR28-07** | Real-time performance with multiple users  | 1. System with 100+ concurrent users<br>2. Send notification to all<br>3. Measure delivery time<br>4. Monitor system performance                              | • All users receive within reasonable time<br>• Delivery time is consistent (< 2 seconds)<br>• No performance degradation<br>• Server handles concurrent load<br>• Real-time doesn't impact other functions |
| **UAT-FR28-08** | Real-time connection stability             | 1. Keep application open for extended period<br>2. Trigger multiple notifications over time<br>3. Monitor connection stability<br>4. Check for disconnections | • Connection remains stable over time<br>• No unexpected disconnections<br>• Reconnection is automatic if dropped<br>• All notifications delivered<br>• No data loss                                        |
| **UAT-FR28-09** | Real-time with slow network                | 1. Simulate slow/high-latency network<br>2. Trigger notification<br>3. Measure delivery time<br>4. Verify graceful handling                                   | • Notification delivered (with longer delay)<br>• System handles latency appropriately<br>• No crashes or errors<br>• User experience degraded but functional<br>• Timeout handling works                   |
| **UAT-FR28-10** | Real-time notification ordering            | 1. Send multiple notifications in quick succession<br>2. Check order in user's notification center<br>3. Verify chronological order<br>4. Check consistency   | • Notifications appear in correct order<br>• Most recent appears first<br>• Ordering is consistent across devices<br>• No race conditions<br>• Order matches send sequence                                  |
| **UAT-FR28-11** | Server-Sent Events (SSE) fallback          | 1. If WebSocket unavailable, check SSE support<br>2. Trigger notification<br>3. Verify real-time delivery via SSE<br>4. Check performance                     | • SSE is supported as fallback<br>• Real-time delivery via SSE works<br>• Delivery is near-real-time<br>• Performance is acceptable<br>• Transparent to user                                                |
| **UAT-FR28-12** | Real-time with notifications off           | 1. User disables notifications<br>2. Trigger notification event<br>3. Check if real-time mechanism still works<br>4. Verify notification is not shown         | • Real-time connection still active<br>• Notification processed but not displayed<br>• Stored in notification center (unshown)<br>• No errors in system<br>• User preference respected                      |

---

### FR29: View Notification History

| Test Case ID    | Test Scenario                             | Step-by-Step Instructions                                                                                                                                | Expected Result                                                                                                                                                                       |
| --------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR29-01** | Access notification history               | 1. Log in as user<br>2. Click notification icon/bell<br>3. View notification list/history<br>4. Observe all notifications                                | • Notification center/history is accessible<br>• Lists all notifications (read and unread)<br>• Organized in reverse chronological order<br>• Clear layout with notification details  |
| **UAT-FR29-02** | View full notification details            | 1. Access notification history<br>2. Click on a notification<br>3. View full content<br>4. See all associated information                                | • Full notification text is displayed<br>• Timestamp is shown<br>• Related information (report ID, alert type) visible<br>• Action links/buttons available<br>• Context is clear      |
| **UAT-FR29-03** | Notification history pagination           | 1. User with 100+ notifications logs in<br>2. Check notification history<br>3. Navigate through pages<br>4. Verify pagination                            | • Notifications paginated (e.g., 10-20 per page)<br>• Pagination controls visible<br>• Can navigate between pages<br>• Page numbers or next/previous work<br>• Current page indicated |
| **UAT-FR29-04** | Notification history sorting              | 1. Access notification history<br>2. Look for sort options<br>3. Sort by date, type, status<br>4. Verify ordering                                        | • Sort by newest/oldest available<br>• Sort by notification type<br>• Sort by read/unread status<br>• Sorting applies correctly<br>• User can customize order                         |
| **UAT-FR29-05** | Search notification history               | 1. Access notification history<br>2. Enter search term<br>3. Search for specific notification<br>4. Verify results                                       | • Search box is present<br>• Can search by keywords<br>• Matching notifications displayed<br>• Search is case-insensitive<br>• Results are relevant                                   |
| **UAT-FR29-06** | Filter notification by type               | 1. Access notification history<br>2. Look for filter options<br>3. Filter by type (e.g., "Report Updates")<br>4. Verify filtered results                 | • Filter options available<br>• All notification types listed<br>• Filtered results show only selected type<br>• Can filter by multiple types<br>• Can clear filters                  |
| **UAT-FR29-07** | Filter notification by date range         | 1. Access notification history<br>2. Select date range filter<br>3. Choose date range<br>4. Apply filter<br>5. Verify results                            | • Date range filter available<br>• Calendar picker for dates<br>• Predefined ranges (Today, Last 7 days)<br>• Only notifications in range shown<br>• Filter works accurately          |
| **UAT-FR29-08** | Filter by read/unread status              | 1. Access notification history<br>2. Apply read/unread filter<br>3. Show only unread notifications<br>4. Clear filter<br>5. Show only read notifications | • Filter shows unread only<br>• Filter shows read only<br>• Filter shows all (default)<br>• Filter works correctly<br>• Accurate results                                              |
| **UAT-FR29-09** | Notification history on mobile            | 1. Log in on mobile device<br>2. Access notification history<br>3. Scroll through notifications<br>4. Perform search/filter on mobile                    | • History is accessible on mobile<br>• Mobile-responsive layout<br>• All features work on mobile<br>• Scrolling is smooth<br>• Mobile UX is functional                                |
| **UAT-FR29-10** | Clear notification history (if supported) | 1. Access notification settings<br>2. Look for "Clear History" option<br>3. Clear old notifications<br>4. Verify deletion                                | • Clear option available (if feature exists)<br>• Can delete old notifications<br>• Confirmation before deletion<br>• Notifications removed from history<br>• Unread badges updated   |
| **UAT-FR29-11** | Notification retention in history         | 1. Create old notifications (30+ days)<br>2. Check if still visible in history<br>3. Verify retention policy<br>4. Check if archival occurs              | • Old notifications remain in history<br>• Per data retention policy<br>• OR archived appropriately<br>• Full history is searchable<br>• Policy enforced automatically                |
| **UAT-FR29-12** | Download notification history             | 1. Access notification history<br>2. Look for export/download option<br>3. Export history to file<br>4. Verify export content                            | • Export option available (if feature exists)<br>• Can download as PDF or CSV<br>• All notifications included<br>• Format is readable<br>• Export is complete                         |
| **UAT-FR29-13** | Notification summary/dashboard            | 1. Access user dashboard<br>2. Check for notification widget<br>3. View summary of recent notifications<br>4. Access full history from widget            | • Dashboard shows notification summary<br>• Recent notifications displayed<br>• Quick stats (unread count)<br>• Link to full notification center<br>• Widget updates in real-time     |

---

### FR30: Configure Notification Preferences

| Test Case ID    | Test Scenario                               | Step-by-Step Instructions                                                                                                                                                                                                   | Expected Result                                                                                                                                                                                 |
| --------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR30-01** | Access notification preferences             | 1. Log in as user<br>2. Go to account settings<br>3. Locate "Notification Preferences"<br>4. Open preferences page                                                                                                          | • Preferences page is accessible<br>• Clear navigation to settings<br>• Preferences page loads fully<br>• Options are organized logically                                                       |
| **UAT-FR30-02** | Enable/disable all notifications            | 1. Access notification preferences<br>2. Find global enable/disable toggle<br>3. Toggle notifications on/off<br>4. Save and verify                                                                                          | • Master toggle exists<br>• Disables all notifications when off<br>• Re-enables all when turned on<br>• Change is saved<br>• Takes effect immediately                                           |
| **UAT-FR30-03** | Disable notifications by type               | 1. Access preferences<br>2. Select "Report Updates" notifications<br>3. Disable this type<br>4. Verify setting is saved<br>5. Test that these notifications aren't sent                                                     | • Each notification type has toggle<br>• Can disable specific types<br>• Other types still enabled<br>• Preference is saved<br>• System respects preference                                     |
| **UAT-FR30-04** | Choose notification by disaster type        | 1. Access preferences<br>2. Select disaster type preferences<br>3. Choose "Flood" and "Fire" only<br>4. Uncheck "Earthquake"<br>5. Save preferences<br>6. Verify alerts respect choices                                     | • Disaster types listed<br>• User can select/deselect types<br>• Only selected types trigger notifications<br>• Preference saved to profile<br>• Notifications filtered by preference           |
| **UAT-FR30-05** | Choose notifications by location            | 1. Access preferences<br>2. Select location preferences<br>3. Choose specific locations (e.g., Kuala Lumpur, Selangor)<br>4. Save preferences<br>5. Verify notifications respect location                                   | • Location list available<br>• User can select multiple locations<br>• Notifications only for selected locations<br>• Can add/remove locations anytime<br>• Preference applied system-wide      |
| **UAT-FR30-06** | Choose notification channels                | 1. Access preferences<br>2. Enable/disable in-app notifications<br>3. Enable/disable email notifications<br>4. Enable/disable SMS (if available)<br>5. Save preferences                                                     | • Channel options available<br>• Can enable/disable each channel<br>• Independent channel control<br>• Preferences saved<br>• Notifications sent via chosen channels only                       |
| **UAT-FR30-07** | Email frequency preferences                 | 1. Access preferences<br>2. Set email frequency<br>3. Choose "Immediate", "Daily Digest", "Weekly"<br>4. Save and verify                                                                                                    | • Frequency options available<br>• Immediate - emails sent as events occur<br>• Daily - digest email at set time<br>• Weekly - weekly summary<br>• Preference applied correctly                 |
| **UAT-FR30-08** | Notification quiet hours                    | 1. Access preferences<br>2. Set quiet hours (e.g., 10 PM - 7 AM)<br>3. Disable notifications during this time<br>4. Save preferences<br>5. Test during quiet hours                                                          | • Quiet hours setting available<br>• Can set start and end times<br>• Notifications suppressed during quiet hours<br>• Non-critical notifications queued<br>• Urgent notifications may override |
| **UAT-FR30-09** | Reset preferences to default                | 1. Access preferences<br>2. Find "Reset to Default" option<br>3. Reset preferences<br>4. Verify all defaults are applied                                                                                                    | • Reset option available<br>• Confirmation before reset<br>• All settings return to default<br>• User notified of reset<br>• Preferences saved as default                                       |
| **UAT-FR30-10** | Save preference changes                     | 1. Access preferences<br>2. Change multiple settings<br>3. Click "Save" button<br>4. Navigate away<br>5. Return to preferences<br>6. Verify changes are saved                                                               | • Save button is prominent<br>• Success message displayed<br>• Changes persisted to database<br>• Changes survive page refresh/logout<br>• User is notified of success                          |
| **UAT-FR30-11** | Notification language preference            | 1. Access preferences<br>2. Select language for notifications<br>3. Choose English or Malay<br>4. Save preference<br>5. Receive notifications in chosen language                                                            | • Language options available<br>• User can select preferred language<br>• Notifications sent in selected language<br>• Preference saved to profile<br>• Consistent across all notifications     |
| **UAT-FR30-12** | Timezone preference for notifications       | 1. Access preferences<br>2. Set timezone<br>3. Configure time-dependent settings<br>4. Save preferences                                                                                                                     | • Timezone selector available<br>• User can select their timezone<br>• Scheduled notifications respect timezone<br>• Quiet hours use correct timezone<br>• Daily digest sent at correct time    |
| **UAT-FR30-13** | Notification preferences on mobile          | 1. Log in on mobile device<br>2. Access notification preferences<br>3. Change settings<br>4. Save changes<br>5. Verify mobile UX                                                                                            | • Preferences accessible on mobile<br>• Mobile-responsive layout<br>• All options available<br>• Easy to use on small screen<br>• Changes saved successfully                                    |
| **UAT-FR30-14** | Advanced notification rules (if supported)  | 1. Access preferences<br>2. Create custom rule (if supported)<br>3. Example: "Notify about flood in Kuala Lumpur immediately"<br>4. Save rule<br>5. Test rule                                                               | • Advanced rules may be available<br>• Custom conditions can be set<br>• Rules can be combined (AND/OR)<br>• Rules are saved<br>• System enforces custom rules                                  |
| **UAT-FR30-15** | Notification preference sync across devices | 1. Set preferences on desktop<br>2. Log in on mobile<br>3. Check if preferences synced<br>4. Change preference on mobile<br>5. Check desktop reflects change                                                                | • Preferences synced across devices<br>• Changes on one device appear on other<br>• Consistent behavior everywhere<br>• Real-time synchronization<br>• No discrepancies                         |
| **UAT-FR30-16** | Test notification with changed preferences  | 1. Disable certain notification types<br>2. Trigger those notification events<br>3. Verify user doesn't receive disabled notifications<br>4. Enable them back<br>5. Trigger same events<br>6. Verify user now receives them | • Disabled notifications not sent<br>• Enabled notifications sent<br>• Preferences enforced system-wide<br>• No notifications leak through<br>• Settings work as intended                       |

---

## Testing Prerequisites

### Test Environment Setup

- [ ] UAT environment with notification system enabled
- [ ] Database with notification tables configured
- [ ] WebSocket or real-time communication configured
- [ ] Email server configured for notification testing
- [ ] Push notification service configured (if applicable)
- [ ] Test user accounts with various preferences
- [ ] Admin account with notification sending capabilities

### Required Access

- [ ] UAT application URL
- [ ] Test user credentials (multiple accounts)
- [ ] Admin user credentials
- [ ] Email test accounts for verification
- [ ] Database access for verification testing
- [ ] Mobile devices for mobile testing
- [ ] Network monitoring tools (developer tools)

### Test Data Requirements

- [ ] Sample notification events (report updates, alerts, announcements)
- [ ] Various incident types and locations
- [ ] Pre-configured notification preferences
- [ ] Test email addresses
- [ ] Sample disaster scenarios for testing targeted notifications

### Technical Requirements

- [ ] Modern browsers (Chrome, Firefox, Safari, Edge) with latest versions
- [ ] Mobile devices (iOS and Android) for mobile testing
- [ ] Email client access for verification
- [ ] Network monitoring tools (browser DevTools)
- [ ] WebSocket/real-time support in test environment
- [ ] Admin tools for database verification

---

## Test Execution Guidelines

### General Testing Notes

1. **Real-Time Testing**: Use multiple devices/tabs to verify real-time delivery
2. **Email Testing**: Use test email accounts and check inbox regularly
3. **Preference Testing**: Rigorously verify settings are respected
4. **Performance**: Monitor system under load with many concurrent users
5. **Coverage**: Test all notification types and triggers
6. **Integration**: Verify notifications integrate properly with all modules
7. **Database**: Verify data integrity and consistency

### Defect Reporting

When a test case fails, document:

- Test Case ID
- Actual Result vs Expected Result
- Steps to Reproduce
- Screenshots/Screen recordings
- Browser and Device Information
- Notification type being tested
- User preferences in effect
- Network conditions (if applicable)
- Severity: Critical, High, Medium, Low

### Pass/Fail Criteria

- **Pass**: All expected results are achieved, notifications function as specified
- **Fail**: Any expected result is not achieved, functionality is broken
- **Blocked**: Test cannot be executed due to dependencies or environment issues
- **N/A**: Test case not applicable for this release or configuration

### Special Considerations for Notification Testing

- **Real-Time Delivery**: Focus on < 2 second delivery times for in-app notifications
- **Database Consistency**: Ensure all notifications are properly stored and retrievable
- **User Privacy**: Verify user preferences are respected and enforced
- **Admin Capabilities**: Test all admin notification functions thoroughly
- **Multi-Channel**: Verify notifications across in-app, email, and push (if applicable)
- **Performance**: Test with 1000+ users sending notifications simultaneously
- **Fallbacks**: Test graceful degradation when real-time unavailable

---

## Sign-Off

| Role                | Name | Signature | Date |
| ------------------- | ---- | --------- | ---- |
| QA Lead             |      |           |      |
| Test Manager        |      |           |      |
| Product Owner       |      |           |      |
| Development Lead    |      |           |      |
| Infrastructure Lead |      |           |      |

---

## Test Summary

| Total Test Cases | Passed | Failed | Blocked | N/A |
| ---------------- | ------ | ------ | ------- | --- |
| 97               |        |        |         |     |

### Test Coverage by Functional Requirement

| FR   | Description                            | Test Cases | Status |
| ---- | -------------------------------------- | ---------- | ------ |
| FR24 | Send notifications for relevant events | 12         |        |
| FR25 | Store notifications in database        | 10         |        |
| FR26 | Mark notifications as read/unread      | 12         |        |
| FR27 | Admins send targeted notifications     | 12         |        |
| FR28 | Real-time notification delivery        | 12         |        |
| FR29 | View notification history              | 13         |        |
| FR30 | Configure notification preferences     | 16         |        |

### Notes

_Use this section to document any additional observations, risks, or recommendations from the testing phase._

**Key Risks Identified:**

- Real-time delivery performance at scale (1000+ users)
- Email deliverability and spam filtering
- WebSocket stability and fallback mechanisms
- Database performance with large notification volumes
- User preference enforcement across all modules
- Timezone handling for scheduled notifications

**Recommendations:**

- Load test with 1000+ concurrent users
- Test email delivery with major providers (Gmail, Outlook, etc.)
- Verify WebSocket and fallback (SSE/polling) both work
- Performance test database queries with 100k+ notifications
- Verify preference changes propagate system-wide immediately
- Test notification deduplication to prevent duplicates
- Conduct UAT in different timezones
- Monitor system resources during notification spikes

---

**Document Version Control**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 10, 2026 | QA Team | Initial UAT Plan for Notification System Module |
