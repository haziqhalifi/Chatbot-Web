# User Acceptance Testing (UAT) Plan

## Module 3: Incident Reporting

### Document Information

- **Module**: Incident Reporting
- **Version**: 1.0
- **Date**: January 10, 2026
- **Test Environment**: UAT Environment
- **Tester**: [To be filled by QA team]

---

## Test Cases

### FR18: Submit Incident/Disaster Reports

| Test Case ID    | Test Scenario                               | Step-by-Step Instructions                                                                                                                                                                          | Expected Result                                                                                                                                                                                           |
| --------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR18-01** | Submit basic incident report                | 1. Log in to the application<br>2. Navigate to "Report Incident" page<br>3. Fill in all required fields (type, location, description, time)<br>4. Click "Submit" button<br>5. Observe confirmation | • Report form is displayed correctly<br>• All fields are accessible<br>• Form submission is successful<br>• Success message is displayed<br>• Report is saved to database<br>• User receives confirmation |
| **UAT-FR18-02** | Access report submission form               | 1. Log in as a public user<br>2. Navigate to main menu or dashboard<br>3. Locate "Report Incident" option<br>4. Click to access form                                                               | • Report option is visible in navigation<br>• Option is clearly labeled<br>• Form loads successfully<br>• User can access reporting feature easily                                                        |
| **UAT-FR18-03** | Submit report with all optional fields      | 1. Navigate to report form<br>2. Fill in all required fields<br>3. Fill in all optional fields (photos, additional details, etc.)<br>4. Submit report                                              | • All optional fields are functional<br>• Optional data is accepted<br>• Report includes all provided information<br>• No errors occur with full data                                                     |
| **UAT-FR18-04** | Submit report with missing required fields  | 1. Navigate to report form<br>2. Leave one or more required fields empty<br>3. Attempt to submit<br>4. Observe validation                                                                          | • Validation errors are displayed<br>• Error messages indicate which fields are required<br>• Form highlights missing fields<br>• Report is not submitted<br>• User can correct and resubmit              |
| **UAT-FR18-05** | Submit report without authentication        | 1. Open application without logging in<br>2. Attempt to access report submission<br>3. Observe system behavior                                                                                     | • User is redirected to login page OR<br>• Error message indicates authentication required<br>• Report form is not accessible<br>• System enforces authentication                                         |
| **UAT-FR18-06** | Submit multiple reports                     | 1. Submit first incident report<br>2. Submit second incident report<br>3. Submit third incident report<br>4. Verify all submissions                                                                | • All reports are submitted successfully<br>• Each report is stored independently<br>• User can submit unlimited reports (or limit is enforced)<br>• All reports are saved correctly                      |
| **UAT-FR18-07** | Cancel report submission                    | 1. Start filling report form<br>2. Enter some data<br>3. Click "Cancel" or "Back" button<br>4. Observe behavior                                                                                    | • Confirmation dialog appears (if applicable)<br>• Data is not saved<br>• User is returned to previous page<br>• No incomplete report is created                                                          |
| **UAT-FR18-08** | Report form field validation                | 1. Navigate to report form<br>2. Enter invalid data in various fields<br>3. Attempt to submit<br>4. Verify validation messages                                                                     | • Each field has appropriate validation<br>• Validation messages are clear<br>• Invalid formats are rejected<br>• User is guided to correct input                                                         |
| **UAT-FR18-09** | Submit report with maximum character limits | 1. Fill description field to character limit<br>2. Attempt to exceed limit<br>3. Submit report<br>4. Verify submission                                                                             | • Character limit is enforced<br>• Counter shows remaining characters (if applicable)<br>• User cannot exceed limit<br>• Report with maximum characters is accepted                                       |
| **UAT-FR18-10** | Submit report on mobile device              | 1. Access application on mobile device<br>2. Navigate to report form<br>3. Fill in all fields using mobile interface<br>4. Submit report                                                           | • Form is mobile-responsive<br>• All fields are accessible on mobile<br>• Submission works on mobile<br>• User experience is optimized for mobile                                                         |
| **UAT-FR18-11** | Report submission confirmation details      | 1. Submit a report<br>2. Observe confirmation message<br>3. Check for report ID or reference number                                                                                                | • Confirmation includes report ID/reference<br>• Submission timestamp is shown<br>• User can track the report<br>• Confirmation is clear and informative                                                  |
| **UAT-FR18-12** | Auto-save draft report (if supported)       | 1. Start filling report form<br>2. Navigate away without submitting<br>3. Return to report form<br>4. Check if data is preserved                                                                   | • Draft is auto-saved (if feature exists)<br>• Data is restored when user returns OR<br>• User is warned before losing data<br>• System handles unsaved data appropriately                                |

---

### FR19: Report Fields (Type, Location, Description, Time)

| Test Case ID    | Test Scenario                            | Step-by-Step Instructions                                                                                                                                                              | Expected Result                                                                                                                                                                                               |
| --------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR19-01** | Select incident type                     | 1. Navigate to report form<br>2. Click on "Incident Type" field<br>3. View available options<br>4. Select an incident type (e.g., Flood, Fire, Earthquake)<br>5. Verify selection      | • Dropdown/selection shows all incident types<br>• Types are clearly labeled<br>• Selection is saved correctly<br>• Selected type is displayed<br>• Type options are comprehensive                            |
| **UAT-FR19-02** | Incident type field validation           | 1. Navigate to report form<br>2. Leave incident type field empty<br>3. Attempt to submit<br>4. Verify error message                                                                    | • Incident type is required field<br>• Validation error is displayed<br>• Error message is clear<br>• Form cannot be submitted without type                                                                   |
| **UAT-FR19-03** | Enter incident location - text address   | 1. Navigate to report form<br>2. Enter location as text address<br>3. Submit report<br>4. Verify location is saved                                                                     | • Text input field accepts address<br>• Address is stored correctly<br>• Location is displayed in report details<br>• No character restrictions on address                                                    |
| **UAT-FR19-04** | Select incident location - map interface | 1. Navigate to report form<br>2. Click "Select on Map" option (if available)<br>3. Click location on map<br>4. Verify location coordinates<br>5. Submit report                         | • Map interface is displayed<br>• User can click to select location<br>• Coordinates are captured (latitude, longitude)<br>• Selected location is shown on map<br>• Location is saved correctly               |
| **UAT-FR19-05** | Use current location (GPS)               | 1. Navigate to report form on mobile/device with GPS<br>2. Click "Use Current Location" button<br>3. Allow location permissions<br>4. Verify location is populated<br>5. Submit report | • GPS location option is available<br>• Browser/device requests location permission<br>• Current coordinates are captured<br>• Address is reverse-geocoded (if supported)<br>• Location is accurate and saved |
| **UAT-FR19-06** | Location field validation                | 1. Navigate to report form<br>2. Leave location field empty<br>3. Attempt to submit<br>4. Verify error message                                                                         | • Location is required field<br>• Validation error is displayed<br>• Error message indicates location is needed<br>• Form cannot be submitted without location                                                |
| **UAT-FR19-07** | Enter incident description               | 1. Navigate to report form<br>2. Enter detailed description in text area<br>3. Include special characters and line breaks<br>4. Submit report<br>5. Verify description is saved        | • Description field accepts text input<br>• Multi-line input is supported<br>• Special characters are preserved<br>• Description is stored completely<br>• Formatting is maintained                           |
| **UAT-FR19-08** | Description field character limit        | 1. Navigate to report form<br>2. Enter very long description<br>3. Observe character counter (if exists)<br>4. Attempt to exceed limit                                                 | • Character limit is enforced (e.g., 500, 1000 chars)<br>• Counter shows remaining characters<br>• User cannot exceed limit OR<br>• Warning shown when approaching limit                                      |
| **UAT-FR19-09** | Description field validation             | 1. Navigate to report form<br>2. Leave description field empty<br>3. Attempt to submit<br>4. Verify error message                                                                      | • Description is required field<br>• Validation error is displayed<br>• Error message is clear<br>• Minimum length may be enforced                                                                            |
| **UAT-FR19-10** | Select incident time - current time      | 1. Navigate to report form<br>2. Click "Use Current Time" or observe auto-populated time<br>3. Verify timestamp<br>4. Submit report                                                    | • Current date/time is populated by default<br>• Timestamp is accurate<br>• Time includes date, hour, minute<br>• Timezone is handled correctly                                                               |
| **UAT-FR19-11** | Select incident time - custom time       | 1. Navigate to report form<br>2. Click on date/time field<br>3. Select past date and time<br>4. Verify selection<br>5. Submit report                                                   | • Date/time picker is displayed<br>• User can select past date/time<br>• Selected time is saved correctly<br>• Custom time is accepted (within reasonable range)<br>• Time format is clear (12/24 hour)       |
| **UAT-FR19-12** | Time field validation                    | 1. Navigate to report form<br>2. Select future date/time<br>3. Attempt to submit<br>4. Verify validation                                                                               | • Future dates may be rejected OR accepted<br>• Validation message indicates time requirements<br>• Reasonable time constraints are enforced<br>• Error handling for invalid times                            |
| **UAT-FR19-13** | All required fields together             | 1. Fill incident type, location, description, and time<br>2. Verify all fields are populated<br>3. Submit report<br>4. View submitted report details                                   | • All fields are saved correctly<br>• Report displays all information<br>• Data integrity is maintained<br>• All required data is present                                                                     |
| **UAT-FR19-14** | Edit field values before submission      | 1. Fill all report fields<br>2. Change incident type<br>3. Update location<br>4. Modify description<br>5. Submit report                                                                | • All fields can be edited before submission<br>• Changes are reflected immediately<br>• Final values are saved<br>• No data conflicts occur                                                                  |

---

### FR20: Link Reports to Reporting User

| Test Case ID    | Test Scenario                            | Step-by-Step Instructions                                                                                                                                             | Expected Result                                                                                                                                                             |
| --------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR20-01** | Report ownership assignment              | 1. Log in as User A<br>2. Submit an incident report<br>3. Access database (admin)<br>4. Query the report<br>5. Verify user association                                | • Report is linked to User A's account<br>• User ID is stored with report<br>• Association is established in database<br>• Report shows correct owner                       |
| **UAT-FR20-02** | User identification in report            | 1. Submit a report as logged-in user<br>2. View report details (as admin or user)<br>3. Check for user information                                                    | • Report displays reporter's name/username<br>• User information is visible<br>• Reporter identity is clear<br>• Privacy settings are respected (if applicable)             |
| **UAT-FR20-03** | Multiple reports from same user          | 1. Log in as User A<br>2. Submit Report 1<br>3. Submit Report 2<br>4. Submit Report 3<br>5. Verify all reports are linked to User A                                   | • All reports are associated with User A<br>• User can view all their reports<br>• Each report maintains user link<br>• No cross-contamination with other users             |
| **UAT-FR20-04** | Reports isolated between different users | 1. User A submits reports<br>2. User B submits reports<br>3. Verify User A cannot see User B's reports (unless admin)<br>4. Verify User B cannot see User A's reports | • Each user sees only their own reports<br>• Reports are properly isolated<br>• No unauthorized access to other users' reports<br>• User privacy is maintained              |
| **UAT-FR20-05** | Reporter information in report details   | 1. Submit a report<br>2. View report as admin<br>3. Check reporter metadata                                                                                           | • Reporter name/email is stored<br>• User ID is linked<br>• Submission timestamp includes user info<br>• Contact information is available (if needed)                       |
| **UAT-FR20-06** | Anonymous reporting restriction          | 1. Log out of application<br>2. Attempt to submit report without login<br>3. Observe system behavior                                                                  | • Anonymous reporting is blocked OR<br>• User must log in to report<br>• System enforces user authentication<br>• All reports are attributed to users                       |
| **UAT-FR20-07** | User account deletion impact on reports  | 1. Create test user and submit reports<br>2. Delete user account<br>3. Check if reports are retained or deleted<br>4. Verify data handling                            | • Reports are retained with anonymized user OR<br>• Reports are deleted with user (per policy)<br>• Data handling follows privacy policy<br>• System behavior is documented |
| **UAT-FR20-08** | Report ownership cannot be changed       | 1. Submit report as User A<br>2. Attempt to transfer ownership to User B (if testable)<br>3. Verify ownership remains with User A                                     | • Report ownership is immutable<br>• Original reporter is always preserved<br>• Audit trail maintains original submitter<br>• Data integrity is protected                   |
| **UAT-FR20-09** | User profile link from report            | 1. View report as admin<br>2. Click on reporter's name/link (if clickable)<br>3. Verify navigation to user profile                                                    | • Reporter name is clickable (for admins)<br>• Link navigates to user profile/details<br>• User information is accessible<br>• Admin can view reporter context              |

---

### FR21: Admin View, Verify, and Update Report Status

| Test Case ID    | Test Scenario                                | Step-by-Step Instructions                                                                                                                              | Expected Result                                                                                                                                                                        |
| --------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR21-01** | Admin view all reports                       | 1. Log in as admin<br>2. Navigate to admin dashboard<br>3. Click "Incident Reports" or similar menu<br>4. View report list                             | • Admin can access all reports<br>• Reports from all users are visible<br>• Report list displays key information<br>• Reports are organized (table/list format)                        |
| **UAT-FR21-02** | Admin view individual report details         | 1. Log in as admin<br>2. Navigate to reports list<br>3. Click on a specific report<br>4. View full details                                             | • Full report details are displayed<br>• All fields are visible (type, location, description, time)<br>• Reporter information is shown<br>• Report metadata is accessible              |
| **UAT-FR21-03** | View report status field                     | 1. Log in as admin<br>2. Open a report<br>3. Locate status field<br>4. Check current status                                                            | • Status field is clearly displayed<br>• Current status is shown (e.g., Pending, Verified, Rejected)<br>• Status is prominently visible<br>• Status history may be available           |
| **UAT-FR21-04** | Update report status - verify report         | 1. Log in as admin<br>2. Open report with "Pending" status<br>3. Change status to "Verified"<br>4. Save changes<br>5. Verify update                    | • Status dropdown/options are available<br>• "Verified" option can be selected<br>• Status is updated successfully<br>• Success message is displayed<br>• Change is saved to database  |
| **UAT-FR21-05** | Update report status - reject report         | 1. Log in as admin<br>2. Open a report<br>3. Change status to "Rejected" or "Invalid"<br>4. Add rejection reason (if required)<br>5. Save changes      | • "Rejected" status option is available<br>• Reason field may be required<br>• Status is updated successfully<br>• Rejection is recorded<br>• User may be notified (if applicable)     |
| **UAT-FR21-06** | Update report status - mark as resolved      | 1. Log in as admin<br>2. Open a verified report<br>3. Change status to "Resolved" or "Completed"<br>4. Save changes                                    | • "Resolved" status option is available<br>• Status is updated successfully<br>• Report is marked as completed<br>• Status change is logged<br>• Update is visible immediately         |
| **UAT-FR21-07** | Add admin notes to report                    | 1. Log in as admin<br>2. Open a report<br>3. Locate "Admin Notes" or "Internal Comments" field<br>4. Add notes<br>5. Save changes                      | • Admin notes field is available<br>• Notes can be added/edited<br>• Notes are saved with report<br>• Notes are visible to other admins<br>• Notes are not visible to public users     |
| **UAT-FR21-08** | Status update timestamp                      | 1. Update report status<br>2. View report details<br>3. Check for status change timestamp                                                              | • Status change timestamp is recorded<br>• Time of update is displayed<br>• Admin who made change is logged (if applicable)<br>• Audit trail is maintained                             |
| **UAT-FR21-09** | Status update notifications (if implemented) | 1. Update report status<br>2. Check if reporter receives notification<br>3. Verify notification content                                                | • Reporter is notified of status change (email/in-app)<br>• Notification includes new status<br>• Notification is timely<br>• Reporter can view updated status                         |
| **UAT-FR21-10** | Multiple status updates on same report       | 1. Update report from "Pending" to "Verified"<br>2. Update again from "Verified" to "In Progress"<br>3. Update to "Resolved"<br>4. View status history | • Status can be updated multiple times<br>• Each update is recorded<br>• Status history is maintained (if supported)<br>• Current status is always accurate                            |
| **UAT-FR21-11** | Public user cannot change status             | 1. Log in as public user<br>2. View own report<br>3. Attempt to change status (if interface exists)<br>4. Verify restriction                           | • Status field is read-only for public users<br>• Public users cannot update status<br>• Only admins have status update rights<br>• Access control is enforced                         |
| **UAT-FR21-12** | Edit other report fields as admin            | 1. Log in as admin<br>2. Open a report<br>3. Edit location, description, or other fields<br>4. Save changes<br>5. Verify update                        | • Admin can edit report fields<br>• Changes are saved successfully<br>• Original data is updated<br>• Edit timestamp is recorded (if applicable)<br>• Audit trail shows admin edits    |
| **UAT-FR21-13** | Bulk status update (if supported)            | 1. Log in as admin<br>2. Select multiple reports (checkbox)<br>3. Choose "Update Status" action<br>4. Select new status<br>5. Apply to all selected    | • Bulk selection is available<br>• Multiple reports can be selected<br>• Status update applies to all selected<br>• All reports are updated successfully<br>• Confirmation is provided |
| **UAT-FR21-14** | Delete report as admin                       | 1. Log in as admin<br>2. Select a report<br>3. Click "Delete" option<br>4. Confirm deletion<br>5. Verify removal                                       | • Delete option is available to admins<br>• Confirmation dialog appears<br>• Report is deleted from database<br>• Report is removed from list<br>• Deletion is logged (if applicable)  |

---

### FR22: Users View Their Own Reports

| Test Case ID    | Test Scenario                       | Step-by-Step Instructions                                                                                                                          | Expected Result                                                                                                                                                                                     |
| --------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR22-01** | Access "My Reports" page            | 1. Log in as public user<br>2. Navigate to user dashboard/profile<br>3. Click "My Reports" or similar option<br>4. View report list                | • "My Reports" option is visible in navigation<br>• Page displays user's submitted reports<br>• Only user's own reports are shown<br>• Reports are organized in list/table format                   |
| **UAT-FR22-02** | View list of own reports            | 1. User who has submitted multiple reports logs in<br>2. Navigate to "My Reports"<br>3. Observe report list                                        | • All user's reports are displayed<br>• Report list shows key information (type, date, status)<br>• Reports are sorted (newest first, typically)<br>• List is paginated if many reports             |
| **UAT-FR22-03** | View report details                 | 1. Navigate to "My Reports"<br>2. Click on a specific report<br>3. View full details                                                               | • Full report details are displayed<br>• All submitted information is shown<br>• Current status is visible<br>• Submission timestamp is shown                                                       |
| **UAT-FR22-04** | View report status                  | 1. Navigate to "My Reports"<br>2. Check status column/field for each report<br>3. Verify status display                                            | • Status is clearly displayed for each report<br>• Status labels are understandable (Pending, Verified, Resolved)<br>• Status is color-coded (optional but helpful)<br>• Current status is accurate |
| **UAT-FR22-05** | Empty reports list                  | 1. Log in as new user who hasn't submitted reports<br>2. Navigate to "My Reports"<br>3. Observe page                                               | • Page displays empty state message<br>• Message guides user to submit first report<br>• Link/button to create new report is available<br>• No errors occur with empty list                         |
| **UAT-FR22-06** | Report sorting options              | 1. Navigate to "My Reports"<br>2. Look for sort options (date, status, type)<br>3. Apply different sorts<br>4. Verify ordering                     | • Sort options are available<br>• Reports can be sorted by date, status, type<br>• Sorting works correctly (ascending/descending)<br>• User can organize reports as needed                          |
| **UAT-FR22-07** | Report filtering by status          | 1. Navigate to "My Reports"<br>2. Apply filter (e.g., show only "Pending" reports)<br>3. Verify filtered results<br>4. Clear filter                | • Filter options are available<br>• Filter works correctly<br>• Only matching reports are shown<br>• Filter can be cleared to show all                                                              |
| **UAT-FR22-08** | View report on mobile device        | 1. Log in on mobile device<br>2. Navigate to "My Reports"<br>3. View report list and details                                                       | • Reports page is mobile-responsive<br>• All information is accessible on mobile<br>• List is readable on small screen<br>• User can view details on mobile                                         |
| **UAT-FR22-09** | Report details match submitted data | 1. Submit a report with specific data<br>2. Navigate to "My Reports"<br>3. Open the report<br>4. Compare displayed data with submitted data        | • All submitted data is displayed correctly<br>• No data is lost or corrupted<br>• Fields match original submission<br>• Data integrity is maintained                                               |
| **UAT-FR22-10** | Cannot view other users' reports    | 1. Log in as User A<br>2. Navigate to "My Reports"<br>3. Attempt to access User B's report (via direct URL if testable)<br>4. Verify access denial | • Only User A's reports are listed<br>• Direct access to other users' reports is blocked<br>• 403 Forbidden or similar error is shown<br>• Access control is enforced                               |
| **UAT-FR22-11** | Report pagination                   | 1. User with 50+ reports logs in<br>2. Navigate to "My Reports"<br>3. Check pagination controls<br>4. Navigate between pages                       | • Reports are paginated (e.g., 10-20 per page)<br>• Pagination controls are visible<br>• User can navigate between pages<br>• Page numbers/next/previous work correctly                             |
| **UAT-FR22-12** | View admin updates on own report    | 1. Submit a report<br>2. Admin updates status to "Verified"<br>3. User refreshes "My Reports"<br>4. Check for status update                        | • Updated status is visible to user<br>• Status change is reflected immediately<br>• User can see admin's updates<br>• Notification of update may be shown                                          |
| **UAT-FR22-13** | Download/Export own reports         | 1. Navigate to "My Reports"<br>2. Look for export option (if available)<br>3. Export reports (PDF, CSV, etc.)<br>4. Verify export                  | • Export option is available (if feature exists)<br>• User can download their reports<br>• All report data is included in export<br>• Export format is readable                                     |

---

### FR23: Admin Filter and Search Reports

| Test Case ID    | Test Scenario                                | Step-by-Step Instructions                                                                                                                                        | Expected Result                                                                                                                                                                                                    |
| --------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **UAT-FR23-01** | Access admin reports with filter options     | 1. Log in as admin<br>2. Navigate to reports management page<br>3. Locate filter/search interface<br>4. Observe available options                                | • Filter/search interface is visible<br>• Multiple filter options are available<br>• Search bar is present<br>• Interface is intuitive and organized                                                               |
| **UAT-FR23-02** | Filter reports by status                     | 1. Navigate to admin reports page<br>2. Select status filter (e.g., "Pending")<br>3. Apply filter<br>4. Verify results                                           | • Status filter dropdown is available<br>• All status options are listed<br>• Only reports with selected status are shown<br>• Filter works accurately<br>• Result count is displayed                              |
| **UAT-FR23-03** | Filter reports by incident type              | 1. Navigate to admin reports page<br>2. Select incident type filter (e.g., "Flood")<br>3. Apply filter<br>4. Verify results                                      | • Incident type filter is available<br>• All incident types are listed<br>• Only reports of selected type are shown<br>• Filter works correctly<br>• Results match selected type                                   |
| **UAT-FR23-04** | Filter reports by date range                 | 1. Navigate to admin reports page<br>2. Select date range (e.g., Last 7 days, Custom range)<br>3. Apply filter<br>4. Verify results                              | • Date range filter is available<br>• Predefined ranges may be offered (Today, Last 7 days, Last month)<br>• Custom date picker is available<br>• Only reports within date range are shown<br>• Filter is accurate |
| **UAT-FR23-05** | Filter reports by location                   | 1. Navigate to admin reports page<br>2. Enter location in filter field<br>3. Apply filter<br>4. Verify results                                                   | • Location filter is available<br>• Text search or area selection works<br>• Reports from specified location are shown<br>• Location matching is appropriate (exact or proximity)<br>• Results are relevant        |
| **UAT-FR23-06** | Filter reports by reporter/user              | 1. Navigate to admin reports page<br>2. Enter username or select user<br>3. Apply filter<br>4. Verify results                                                    | • User filter is available<br>• Admin can search by username or user ID<br>• Only reports from specified user are shown<br>• Filter works correctly<br>• Useful for user-specific analysis                         |
| **UAT-FR23-07** | Multiple filters simultaneously              | 1. Apply status filter ("Verified")<br>2. Apply incident type filter ("Fire")<br>3. Apply date range filter (Last 30 days)<br>4. Verify results                  | • Multiple filters can be applied together<br>• Filters work in combination (AND logic)<br>• Results match all filter criteria<br>• Combined filtering is accurate<br>• Complex queries are supported              |
| **UAT-FR23-08** | Clear all filters                            | 1. Apply multiple filters<br>2. Click "Clear Filters" or "Reset" button<br>3. Verify results                                                                     | • Clear filters option is available<br>• All filters are removed<br>• Full report list is shown again<br>• Page returns to default state                                                                           |
| **UAT-FR23-09** | Search reports by keyword                    | 1. Navigate to admin reports page<br>2. Enter keyword in search bar (e.g., "flood damage")<br>3. Press Enter or click Search<br>4. Verify results                | • Search bar is prominent and accessible<br>• Keyword search works across relevant fields (description, location)<br>• Matching reports are displayed<br>• Search is case-insensitive<br>• Results are relevant    |
| **UAT-FR23-10** | Search reports by report ID                  | 1. Navigate to admin reports page<br>2. Enter report ID in search field<br>3. Search<br>4. Verify result                                                         | • Search accepts report ID<br>• Specific report is found and displayed<br>• Search is exact match for ID<br>• Quick report lookup is possible                                                                      |
| **UAT-FR23-11** | Search with no results                       | 1. Navigate to admin reports page<br>2. Search for non-existent keyword or ID<br>3. Observe results                                                              | • "No results found" message is displayed<br>• Message is clear and helpful<br>• Suggestions to modify search may be shown<br>• No errors occur                                                                    |
| **UAT-FR23-12** | Sort filtered results                        | 1. Apply filters to narrow down reports<br>2. Apply sort (e.g., newest first, oldest first)<br>3. Verify ordering                                                | • Sort options are available on filtered results<br>• Reports can be sorted by date, status, type<br>• Sorting works correctly<br>• Filters and sort work together                                                 |
| **UAT-FR23-13** | Export filtered reports                      | 1. Apply filters to create specific report subset<br>2. Click "Export" option (if available)<br>3. Download file<br>4. Verify export contains only filtered data | • Export option is available<br>• Export includes only filtered reports<br>• All relevant data is in export<br>• Export format is useful (CSV, Excel, PDF)                                                         |
| **UAT-FR23-14** | Filter/search performance with large dataset | 1. Access system with 1000+ reports<br>2. Apply various filters<br>3. Perform searches<br>4. Measure response time                                               | • Filters apply quickly (< 3 seconds)<br>• Search returns results promptly<br>• No performance degradation<br>• Pagination helps with large results<br>• System remains responsive                                 |
| **UAT-FR23-15** | Save filter presets (if supported)           | 1. Apply combination of filters<br>2. Save as preset (e.g., "Pending Floods")<br>3. Clear filters<br>4. Load saved preset<br>5. Verify filters are applied       | • Filter presets can be saved (if feature exists)<br>• Presets are named by admin<br>• Saved presets can be loaded quickly<br>• Filters are reapplied correctly<br>• Improves admin efficiency                     |
| **UAT-FR23-16** | Mobile filter/search functionality           | 1. Log in as admin on mobile device<br>2. Navigate to reports page<br>3. Use filters and search on mobile<br>4. Verify functionality                             | • Filter/search interface works on mobile<br>• Mobile-optimized controls<br>• All filter options are accessible<br>• Results display correctly on mobile<br>• Mobile UX is functional                              |

---

## Testing Prerequisites

### Test Environment Setup

- [ ] UAT environment with incident reporting module enabled
- [ ] Database with incident reports tables configured
- [ ] Map integration for location selection (if applicable)
- [ ] Test user accounts (public users and admin users)
- [ ] Sample incident data populated in database
- [ ] GPS/location services enabled for testing

### Required Access

- [ ] UAT application URL
- [ ] Public user credentials (multiple test accounts)
- [ ] Admin user credentials
- [ ] Database access (read-only) for verification testing
- [ ] Mobile devices for mobile testing
- [ ] Map/location testing capabilities

### Test Data Requirements

- [ ] Various incident types defined in system
- [ ] Sample locations (addresses and coordinates)
- [ ] Pre-populated incident reports with different statuses
- [ ] Test reports from multiple users
- [ ] Reports spanning different date ranges
- [ ] Reports with various incident types

### Technical Requirements

- [ ] Modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] Mobile devices (iOS and Android) for mobile testing
- [ ] GPS-enabled devices for location testing
- [ ] Stable internet connection
- [ ] Map services accessible (Google Maps, OpenStreetMap, etc.)
- [ ] Admin access tools for database verification

---

## Test Execution Guidelines

### General Testing Notes

1. **Location Testing**: Verify location capture works with both manual entry and GPS
2. **Status Workflow**: Test complete status lifecycle (Pending → Verified → Resolved)
3. **Access Control**: Rigorously test that users can only see their own reports
4. **Admin Functions**: Verify all admin capabilities work correctly
5. **Data Integrity**: Ensure report data is accurately stored and retrieved
6. **Mobile Testing**: Test submission and viewing on mobile devices
7. **Filter Accuracy**: Verify filters return accurate and complete results

### Defect Reporting

When a test case fails, document:

- Test Case ID
- Actual Result vs Expected Result
- Steps to Reproduce
- Screenshots/Screen recordings
- Browser and Device Information
- User role being tested (public user or admin)
- Report data used in test
- Filter/search criteria (if applicable)
- Severity: Critical, High, Medium, Low

### Pass/Fail Criteria

- **Pass**: All expected results are achieved, functionality works as specified
- **Fail**: Any expected result is not achieved, functionality is broken
- **Blocked**: Test cannot be executed due to dependencies or environment issues
- **N/A**: Test case not applicable for this release or configuration

### Special Considerations for Incident Reporting Testing

- **Location Accuracy**: GPS coordinates should be reasonably accurate (within 50-100 meters)
- **Status Updates**: Verify users receive appropriate notifications when status changes
- **Privacy**: Ensure user reports are private and not visible to other non-admin users
- **Data Validation**: All required fields must be validated before submission
- **Admin Capabilities**: Admins should have full CRUD operations on reports
- **Search Performance**: Filter and search should work efficiently even with large datasets

---

## Sign-Off

| Role               | Name | Signature | Date |
| ------------------ | ---- | --------- | ---- |
| QA Lead            |      |           |      |
| Test Manager       |      |           |      |
| Product Owner      |      |           |      |
| Development Lead   |      |           |      |
| GIS/Map Specialist |      |           |      |

---

## Test Summary

| Total Test Cases | Passed | Failed | Blocked | N/A |
| ---------------- | ------ | ------ | ------- | --- |
| 82               |        |        |         |     |

### Test Coverage by Functional Requirement

| FR   | Description                                       | Test Cases | Status |
| ---- | ------------------------------------------------- | ---------- | ------ |
| FR18 | Submit incident/disaster reports                  | 12         |        |
| FR19 | Report fields (type, location, description, time) | 14         |        |
| FR20 | Link reports to reporting user                    | 9          |        |
| FR21 | Admin view, verify, and update report status      | 14         |        |
| FR22 | Users view their own submitted reports            | 13         |        |
| FR23 | Admin filter and search reports                   | 16         |        |

### Notes

_Use this section to document any additional observations, risks, or recommendations from the testing phase._

**Key Risks Identified:**

- Location accuracy may vary based on GPS/device quality
- Map integration dependencies (third-party services)
- Large datasets may impact filter/search performance
- Status notification delivery reliability

**Recommendations:**

- Test location features with various devices and GPS accuracy levels
- Verify map integration works with primary and fallback providers
- Performance test with 1000+ reports to ensure scalability
- Test notification delivery across different email providers
- Validate data privacy controls rigorously

---

**Document Version Control**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 10, 2026 | QA Team | Initial UAT Plan for Incident Reporting Module |
