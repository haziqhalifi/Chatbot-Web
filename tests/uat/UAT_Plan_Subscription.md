# User Acceptance Testing (UAT) Plan

## Module 7: Subscription Management

### Document Information

- **Module**: Subscription Management
- **Version**: 1.0
- **Date**: January 10, 2026
- **Test Environment**: UAT Environment
- **Tester**: [To be filled by QA team]

---

## Test Cases

### FR40: Users Subscribe to Disaster Alerts by Type and Location

| Test Case ID    | Test Scenario                           | Step-by-Step Instructions                                                                                                                                      | Expected Result                                                                                                                                                                                                        |
| --------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR40-01** | Access subscription management          | 1. Log in as user<br>2. Navigate to user dashboard/settings<br>3. Look for subscriptions or preferences<br>4. Click to access subscription page                | • Subscription management page accessible<br>• Clear navigation to subscriptions<br>• Page loads successfully<br>• All controls visible                                                                                |
| **UAT-FR40-02** | Subscribe to disaster type              | 1. Access subscription page<br>2. Find disaster type options<br>3. Select disaster type (e.g., "Flood")<br>4. Subscribe to that type<br>5. Verify subscription | • Disaster types listed<br>• User can select type<br>• Subscription is saved<br>• Confirmation message shown<br>• Type appears in subscriptions                                                                        |
| **UAT-FR40-03** | Subscribe to specific location          | 1. Access subscription page<br>2. Find location selection<br>3. Select location (e.g., "Kuala Lumpur")<br>4. Subscribe to location<br>5. Verify subscription   | • Location options available<br>• User can select location<br>• Subscription is saved<br>• Confirmation provided<br>• Location appears in subscriptions                                                                |
| **UAT-FR40-04** | Subscribe to disaster type AND location | 1. Access subscription page<br>2. Select disaster type (Flood)<br>3. Select location (Kuala Lumpur)<br>4. Subscribe to combination<br>5. Verify subscription   | • Can subscribe to specific type+location<br>• Both parameters saved<br>• More targeted subscriptions<br>• Subscription appears correctly<br>• Confirmation is clear                                                   |
| **UAT-FR40-05** | Multiple subscriptions                  | 1. Subscribe to Flood in Kuala Lumpur<br>2. Subscribe to Fire in Selangor<br>3. Subscribe to Earthquake nationwide<br>4. Verify all subscriptions              | • User can have multiple subscriptions<br>• Each saved independently<br>• All appear in subscription list<br>• No conflicts<br>• Easy to manage                                                                        |
| **UAT-FR40-06** | Subscribe to multiple disaster types    | 1. Select multiple types (Flood, Fire, Earthquake)<br>2. Subscribe to all for same location<br>3. Verify multiple subscriptions created<br>4. Check list       | • Can select multiple disaster types<br>• All selected types subscribed<br>• More efficient than one-by-one<br>• All appear in list<br>• Bulk subscribe saves time                                                     |
| **UAT-FR40-07** | Subscribe to multiple locations         | 1. Select same disaster type<br>2. Choose multiple locations (KL, Selangor, Penang)<br>3. Subscribe to all<br>4. Verify subscriptions                          | • Can select multiple locations<br>• Same type, different locations subscribed<br>• All appear in list<br>• Bulk subscribe works<br>• Efficient subscription                                                           |
| **UAT-FR40-08** | Geographic hierarchy support            | 1. Check if location hierarchy supported<br>2. Example: Subscribe to Selangor (includes all districts)<br>3. Verify coverage<br>4. Check notification delivery | • Geographic hierarchy available (if feature exists)<br>• State-level subscription covers all districts<br>• District-level subscription more specific<br>• Hierarchy reduces redundancy<br>• More intuitive for users |
| **UAT-FR40-09** | All disasters/locations option          | 1. Look for "All Disasters" option<br>2. Look for "All Locations" option<br>3. Subscribe to all disasters<br>4. Verify comprehensive subscription              | • "All Disasters" option available<br>• "All Locations" option available<br>• User can subscribe to everything<br>• Comprehensive notification coverage<br>• Single subscription option                                |
| **UAT-FR40-10** | Subscription confirmation               | 1. Subscribe to disaster type/location<br>2. Check for confirmation message<br>3. Verify success feedback<br>4. Confirm in list                                | • Confirmation message displayed<br>• Message indicates what subscribed<br>• Clear and unambiguous<br>• Shows in subscription list<br>• Success is obvious                                                             |
| **UAT-FR40-11** | Subscribe on mobile device              | 1. Access subscription on mobile<br>2. Select disaster and location<br>3. Subscribe<br>4. Verify mobile UX                                                     | • Mobile interface is functional<br>• Selection controls work on mobile<br>• Subscription saves successfully<br>• Mobile UX is optimized<br>• Touch interactions responsive                                            |
| **UAT-FR40-12** | Recommended subscriptions               | 1. Check if recommendations available<br>2. View recommended subscriptions<br>3. Subscribe to recommendations<br>4. Verify usefulness                          | • Recommendations available (if feature exists)<br>• Based on user location or profile<br>• Help new users get started<br>• Easy one-click subscribe<br>• Improve user engagement                                      |

---

### FR41: Subscription Preferences Saved in Database

| Test Case ID    | Test Scenario                        | Step-by-Step Instructions                                                                                                                     | Expected Result                                                                                                                                                                  |
| --------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR41-01** | Subscription data stored in database | 1. User subscribes to disaster/location<br>2. Access database (admin)<br>3. Query subscriptions table<br>4. Verify subscription record        | • Subscription stored in database<br>• User ID is linked<br>• Disaster type recorded<br>• Location recorded<br>• Timestamp captured                                              |
| **UAT-FR41-02** | Subscription metadata captured       | 1. Create subscription<br>2. Query database<br>3. Check all metadata fields<br>4. Verify completeness                                         | • Subscription ID generated<br>• User ID recorded<br>• Disaster type stored<br>• Location coordinates stored<br>• Created/updated timestamps<br>• Status field (active/inactive) |
| **UAT-FR41-03** | Multiple subscriptions per user      | 1. Create 3 subscriptions for User A<br>2. Query database<br>3. Verify all 3 stored<br>4. Check user association                              | • All 3 subscriptions stored<br>• All linked to User A<br>• No data loss<br>• Proper relationships<br>• Database integrity maintained                                            |
| **UAT-FR41-04** | Subscription persistence             | 1. Create subscription<br>2. Log out<br>3. Log in again<br>4. Check subscriptions                                                             | • Subscriptions retained after logout<br>• Data persisted correctly<br>• Same subscriptions visible<br>• No data loss<br>• Database consistency                                  |
| **UAT-FR41-05** | Subscription uniqueness              | 1. Subscribe to Flood in KL<br>2. Attempt to subscribe again to Flood in KL<br>3. Check for duplicate prevention<br>4. Verify only one exists | • Duplicate subscriptions prevented<br>• OR allow re-subscription with update<br>• No duplicate records in database<br>• System is intelligent<br>• Data remains clean           |
| **UAT-FR41-06** | Subscription query performance       | 1. Create 100+ subscriptions<br>2. Query user's subscriptions<br>3. Measure response time<br>4. Verify performance                            | • Subscriptions retrieved quickly (< 500ms)<br>• No performance degradation<br>• Queries are optimized<br>• Indexes working<br>• Scalable design                                 |
| **UAT-FR41-07** | Subscription data integrity          | 1. Update subscription record directly in DB<br>2. Verify application reflects changes<br>3. Check consistency<br>4. Ensure data accuracy     | • Database updates reflected in app<br>• Data integrity maintained<br>• No inconsistencies<br>• Application reflects true state<br>• Trust in data                               |
| **UAT-FR41-08** | Subscription backup/recovery         | 1. Verify backup process for subscriptions<br>2. Check if data can be recovered<br>3. Verify no data loss<br>4. Test restoration              | • Subscription data backed up<br>• Backup includes all subscriptions<br>• Can be restored if needed<br>• Recovery process tested<br>• Business continuity ensured                |
| **UAT-FR41-09** | Subscription export (admin)          | 1. Access admin tools<br>2. Export user subscriptions<br>3. Verify data completeness<br>4. Check file format                                  | • Export functionality available<br>• All subscription data exported<br>• Format is readable (CSV, JSON)<br>• Can be analyzed<br>• Admin reporting possible                      |

---

### FR42: Users Update or Remove Subscriptions

| Test Case ID    | Test Scenario                         | Step-by-Step Instructions                                                                                                              | Expected Result                                                                                                                                                                   |
| --------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR42-01** | Edit subscription location            | 1. Access user's subscription<br>2. Click Edit<br>3. Change location (KL to Selangor)<br>4. Save changes<br>5. Verify update           | • Edit option available<br>• Location can be changed<br>• Changes saved<br>• Confirmation shown<br>• Updated subscription displayed                                               |
| **UAT-FR42-02** | Edit subscription disaster type       | 1. Access subscription<br>2. Change disaster type (Flood to Fire)<br>3. Save changes<br>4. Verify update                               | • Disaster type can be edited<br>• Changes saved correctly<br>• Notifications change based on new type<br>• Old type no longer triggers alerts<br>• Update immediate              |
| **UAT-FR42-03** | Edit subscription without changing    | 1. Access subscription<br>2. Open edit (make no changes)<br>3. Save<br>4. Verify no issues                                             | • Can open edit without changing<br>• Save works without changes<br>• No errors<br>• Timestamp may update (or not)<br>• Smooth UX                                                 |
| **UAT-FR42-04** | Remove subscription                   | 1. Access user's subscriptions<br>2. Find subscription to remove<br>3. Click Delete/Remove<br>4. Confirm deletion<br>5. Verify removal | • Delete option available<br>• Confirmation dialog appears<br>• Subscription removed from list<br>• Deletion is permanent (or soft-delete)<br>• No longer receives alerts         |
| **UAT-FR42-05** | Remove multiple subscriptions         | 1. Select multiple subscriptions<br>2. Click Delete all<br>3. Confirm<br>4. Verify all removed                                         | • Bulk delete available<br>• Multiple selection works<br>• All selected removed<br>• Confirmation required<br>• Efficient management                                              |
| **UAT-FR42-06** | Remove all subscriptions              | 1. User has multiple subscriptions<br>2. Select "Remove All"<br>3. Confirm action<br>4. Verify all removed                             | • Remove all option available<br>• Confirmation prevents accidental removal<br>• All subscriptions deleted<br>• User unsubscribed from all<br>• Clear action                      |
| **UAT-FR42-07** | Temporary disable subscription        | 1. Pause or disable subscription<br>2. Check if notification still sent<br>3. Re-enable subscription<br>4. Verify notifications resume | • Pause/disable option available (if feature exists)<br>• Temporarily stops notifications<br>• Can be re-enabled<br>• More flexible than deletion<br>• Useful for temporary needs |
| **UAT-FR42-08** | Subscription update confirmation      | 1. Update subscription<br>2. Check confirmation message<br>3. Verify clear feedback<br>4. Check updated display                        | • Confirmation message shown<br>• Message clearly indicates what changed<br>• Change is reflected immediately<br>• User is not confused<br>• Professional UX                      |
| **UAT-FR42-09** | Update subscription on mobile         | 1. Edit subscription on mobile<br>2. Change details<br>3. Save<br>4. Verify mobile UX                                                  | • Mobile interface functional<br>• Editing works smoothly<br>• Touch controls responsive<br>• Save successful on mobile<br>• Mobile UX optimized                                  |
| **UAT-FR42-10** | Prevent accidental removal            | 1. Attempt to delete subscription<br>2. Check for confirmation dialog<br>3. Cancel to prevent deletion<br>4. Verify not deleted        | • Confirmation dialog mandatory<br>• Clear warning about deletion<br>• Cancel option prevents removal<br>• User can change mind<br>• Protection against accidents                 |
| **UAT-FR42-11** | Update subscription with invalid data | 1. Try to update subscription with invalid location<br>2. Check validation<br>3. Verify error message<br>4. Prevent save               | • Validation checks input<br>• Invalid data rejected<br>• Error message displayed<br>• Guidance provided<br>• Data integrity maintained                                           |
| **UAT-FR42-12** | Track subscription changes            | 1. Update subscription<br>2. Check activity log (if available)<br>3. Verify change is logged<br>4. See timestamp and change            | • Change logged in audit trail (if feature exists)<br>• Timestamp recorded<br>• Type of change shown<br>• Old and new values<br>• Admin visibility                                |

---

### FR43: System Uses Subscriptions to Filter and Send Relevant Notifications

| Test Case ID    | Test Scenario                          | Step-by-Step Instructions                                                                                                                            | Expected Result                                                                                                                                                                                 |
| --------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR43-01** | Filter notifications by subscription   | 1. User subscribed to Flood in KL<br>2. Admin sends alerts<br>3. Flood alert in KL<br>4. Check if user gets notification                             | • User receives notification<br>• Alert matches subscription<br>• Non-matching alerts NOT sent<br>• Filtering works correctly<br>• Relevant only                                                |
| **UAT-FR43-02** | Exclude non-matching disaster type     | 1. User subscribed to Flood only<br>2. Fire alert issued<br>3. Check user notifications<br>4. Verify user doesn't get Fire alert                     | • User doesn't receive Fire alert<br>• Only subscribed types sent<br>• Filtering is working<br>• User is not spammed<br>• Correct content control                                               |
| **UAT-FR43-03** | Exclude non-matching location          | 1. User subscribed to Flood in Selangor<br>2. Flood alert in Penang<br>3. Check if user gets alert<br>4. Verify location filtering                   | • User doesn't receive Penang alert<br>• Only subscribed locations sent<br>• Geofencing works<br>• Location filtering accurate<br>• Relevant to user                                            |
| **UAT-FR43-04** | Notify for matching combination        | 1. User subscribed to "Flood in Selangor"<br>2. Flood alert in Selangor issued<br>3. Check notification<br>4. Verify matching                        | • Notification sent<br>• Both type and location match<br>• User receives appropriate alert<br>• Perfect match found<br>• Expected behavior                                                      |
| **UAT-FR43-05** | Notify for location hierarchy          | 1. User subscribed to "Floods in Selangor"<br>2. Flood in Subang (district of Selangor)<br>3. Check notification<br>4. Verify coverage               | • Notification sent<br>• Hierarchy respected<br>• District falls under state<br>• Coverage works correctly<br>• Intelligent filtering                                                           |
| **UAT-FR43-06** | Notify for all disasters subscription  | 1. User subscribed to "All Disasters" in location X<br>2. Any disaster in location X<br>3. Check notification<br>4. Verify comprehensive             | • Notification sent for any type<br>• Only location filters applied<br>• All disaster types trigger alert<br>• Broad coverage as intended<br>• All disasters covered                            |
| **UAT-FR43-07** | Notify for all locations subscription  | 1. User subscribed to "Disaster Y in all locations"<br>2. Disaster Y in any location<br>3. Check notification<br>4. Verify national coverage         | • Notification sent<br>• Type matches<br>• All locations covered<br>• National alert received<br>• Intended behavior                                                                            |
| **UAT-FR43-08** | Multiple subscriptions filtering       | 1. User has subscriptions: Flood in KL, Fire in Selangor<br>2. Flood in KL issued<br>3. Check notification<br>4. Verify correct subscription matched | • Flood alert triggers notification<br>• Fire alert doesn't (different subscription)<br>• Correct subscription identified<br>• Multiple subscriptions don't interfere<br>• Filtering is precise |
| **UAT-FR43-09** | No notification for unsubscribed       | 1. User NOT subscribed to Earthquake<br>2. Earthquake alert issued<br>3. Check user notifications<br>4. Verify no alert sent                         | • User doesn't receive notification<br>• No alert for unsubscribed type<br>• Filtering prevents irrelevant<br>• User preferences respected<br>• Focused notifications                           |
| **UAT-FR43-10** | Subscription filtering performance     | 1. System with 10,000+ users<br>2. Alert issued<br>3. Filter to matching subscriptions<br>4. Check notification sending                              | • Subscriptions filtered efficiently<br>• Notifications sent to all matching<br>• Performance acceptable<br>• No timeouts<br>• Scales properly                                                  |
| **UAT-FR43-11** | Pause subscription stops notifications | 1. Subscription paused (if feature exists)<br>2. Matching alert issued<br>3. Check if notification sent<br>4. Verify paused subs don't trigger       | • Paused subscriptions don't trigger<br>• Notifications not sent<br>• Feature works as designed<br>• User appreciated control<br>• Temporary pause effective                                    |
| **UAT-FR43-12** | Subscription status verification       | 1. Check subscription is active<br>2. Send matching alert<br>3. Verify notification sent<br>4. Confirm status drives behavior                        | • Active status verified<br>• Notifications sent for active only<br>• Inactive subscriptions ignored<br>• Status field working<br>• Proper filtering                                            |

---

### FR44: Users View Their Current Subscriptions

| Test Case ID    | Test Scenario                               | Step-by-Step Instructions                                                                                                          | Expected Result                                                                                                                                                                 |
| --------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR44-01** | Access subscription list                    | 1. Log in as user<br>2. Navigate to subscriptions<br>3. View subscription list<br>4. See all subscriptions                         | • Subscription list accessible<br>• Clear navigation<br>• Page loads quickly<br>• All subscriptions visible                                                                     |
| **UAT-FR44-02** | View subscription details                   | 1. View subscription list<br>2. Click on subscription<br>3. View full details<br>4. Check all information                          | • Full details displayed<br>• Disaster type shown<br>• Location shown<br>• Subscribe date (if available)<br>• Status shown                                                      |
| **UAT-FR44-03** | Subscription list organization              | 1. User with multiple subscriptions<br>2. View list<br>3. Check if organized<br>4. Verify easy to understand                       | • List organized clearly<br>• Grouped by type or location (if applicable)<br>• Easy to scan<br>• No confusion<br>• Professional layout                                          |
| **UAT-FR44-04** | Empty subscriptions view                    | 1. User with no subscriptions<br>2. Access subscriptions page<br>3. Check message<br>4. See guidance                               | • Helpful message shown<br>• Message guides to subscription creation<br>• Link to subscribe<br>• No errors<br>• User knows what to do                                           |
| **UAT-FR44-05** | Subscription count/summary                  | 1. View subscription page<br>2. Check count of subscriptions<br>3. See summary<br>4. Verify accuracy                               | • Count shown (e.g., "5 subscriptions")<br>• Summary of coverage<br>• Helps user understand reach<br>• Accurate count<br>• Clear summary                                        |
| **UAT-FR44-06** | Subscription status indicator               | 1. View subscriptions list<br>2. Check status for each<br>3. See active/inactive<br>4. Verify clarity                              | • Status shown for each subscription<br>• Active subscriptions highlighted<br>• Paused subscriptions indicated<br>• Clear visual difference<br>• Easy to understand             |
| **UAT-FR44-07** | Sort subscriptions                          | 1. View subscription list<br>2. Look for sort options<br>3. Sort by type, location, date<br>4. Verify sorting                      | • Sort options available<br>• Can sort by various fields<br>• Sorting works correctly<br>• User customization<br>• Improves usability                                           |
| **UAT-FR44-08** | Filter subscriptions view                   | 1. View subscriptions<br>2. Look for filter options<br>3. Filter by status, type<br>4. Verify filtering                            | • Filter options available<br>• Can show active only<br>• Can show by type<br>• Filtering works<br>• Helps manage many subscriptions                                            |
| **UAT-FR44-09** | Search subscriptions                        | 1. User with many subscriptions<br>2. Search for specific subscription<br>3. Find by disaster type or location<br>4. Verify search | • Search box available<br>• Can find subscriptions<br>• Quick lookup<br>• Search is case-insensitive<br>• Efficient navigation                                                  |
| **UAT-FR44-10** | Subscription pagination                     | 1. User with 50+ subscriptions<br>2. View list<br>3. Check pagination<br>4. Navigate pages                                         | • Paginated if many subscriptions<br>• Page controls visible<br>• Can navigate pages<br>• All subscriptions accessible<br>• Performance optimized                               |
| **UAT-FR44-11** | View subscription coverage area (map)       | 1. View subscription<br>2. Check if map available<br>3. See coverage area on map<br>4. Visualize subscription                      | • Map shows coverage (if feature exists)<br>• Subscribed areas highlighted<br>• Visual representation helpful<br>• Easy to understand coverage<br>• Improves user understanding |
| **UAT-FR44-12** | View upcoming alerts based on subscriptions | 1. View subscriptions<br>2. Check if upcoming alerts shown<br>3. See which alerts expected<br>4. Verify forecast                   | • Upcoming alerts displayed (if feature exists)<br>• Based on current subscriptions<br>• Forecasted alerts shown<br>• User knows what to expect<br>• Proactive information      |
| **UAT-FR44-13** | Export subscriptions                        | 1. Access subscription page<br>2. Look for export option<br>3. Export to file<br>4. Verify content                                 | • Export option available (if feature exists)<br>• Can download as PDF/CSV<br>• All subscriptions included<br>• Readable format<br>• Useful for personal records                |
| **UAT-FR44-14** | View subscription on mobile                 | 1. Log in on mobile<br>2. Access subscriptions<br>3. View list and details<br>4. Verify mobile UX                                  | • Mobile-responsive layout<br>• All features accessible<br>• Readable on small screen<br>• Touch controls work<br>• Mobile UX optimized                                         |

---

## Testing Prerequisites

### Test Environment Setup

- [ ] UAT environment with subscription module enabled
- [ ] Database with subscription tables configured
- [ ] Disaster type definitions and locations
- [ ] Sample subscription data
- [ ] Notification system integrated
- [ ] Mobile devices for mobile testing

### Required Access

- [ ] UAT application URL
- [ ] User credentials (multiple test accounts)
- [ ] Admin credentials for notifications
- [ ] Database access for verification
- [ ] Mobile devices for testing
- [ ] Notification monitoring tools

### Test Data Requirements

- [ ] List of disaster types (Flood, Fire, Earthquake, etc.)
- [ ] List of locations (states and districts)
- [ ] Sample subscriptions for testing
- [ ] Test incidents matching subscriptions
- [ ] Non-matching incidents for filtering tests

### Technical Requirements

- [ ] Modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] Mobile devices (iOS and Android)
- [ ] Database query tools
- [ ] Notification tracking system
- [ ] Network monitoring tools

---

## Test Execution Guidelines

### General Testing Notes

1. **Subscription Accuracy**: Verify all subscriptions are correctly stored
2. **Notification Filtering**: Rigorously test that only relevant notifications sent
3. **CRUD Operations**: Test all create, read, update, delete operations
4. **Performance**: Test with 1000+ subscriptions
5. **Data Integrity**: Ensure database consistency
6. **Mobile Testing**: Verify all features work on mobile
7. **Integration**: Verify subscriptions work with notification system

### Defect Reporting

When a test case fails, document:

- Test Case ID
- Actual Result vs Expected Result
- Steps to Reproduce
- Screenshots/Screen recordings
- Browser and Device Information
- Subscription details used in test
- Disaster type and location (if relevant)
- Notifications sent vs expected
- Severity: Critical, High, Medium, Low

### Pass/Fail Criteria

- **Pass**: All expected results achieved, subscription system functions as specified
- **Fail**: Any expected result not achieved, functionality broken
- **Blocked**: Test cannot execute due to dependencies
- **N/A**: Test case not applicable for this release

### Special Considerations for Subscription Testing

- **Filtering Accuracy**: Subscriptions must accurately filter notifications
- **Database Consistency**: All subscriptions must be properly persisted
- **Performance**: Filtering should not impact notification delivery speed
- **User Control**: Users must have granular control over subscriptions
- **No Spam**: Only relevant notifications should be sent
- **Scalability**: System must handle 10,000+ users with subscriptions
- **Real-Time**: Subscription changes should immediately affect notifications

---

## Sign-Off

| Role                  | Name | Signature | Date |
| --------------------- | ---- | --------- | ---- |
| QA Lead               |      |           |      |
| Test Manager          |      |           |      |
| Product Owner         |      |           |      |
| Development Lead      |      |           |      |
| Data & Analytics Lead |      |           |      |

---

## Test Summary

| Total Test Cases | Passed | Failed | Blocked | N/A |
| ---------------- | ------ | ------ | ------- | --- |
| 60               |        |        |         |     |

### Test Coverage by Functional Requirement

| FR   | Description                                       | Test Cases | Status |
| ---- | ------------------------------------------------- | ---------- | ------ |
| FR40 | Subscribe to disaster alerts by type and location | 12         |        |
| FR41 | Subscription preferences saved in database        | 9          |        |
| FR42 | Users update or remove subscriptions              | 12         |        |
| FR43 | System filters and sends relevant notifications   | 12         |        |
| FR44 | Users view their current subscriptions            | 14         |        |

### Notes

_Use this section to document any additional observations, risks, or recommendations from the testing phase._

**Key Risks Identified:**

- Subscription filtering may have performance impact at scale
- Database query optimization needed for 10,000+ users
- Notification delivery delays due to filtering
- User confusion with multiple subscription options
- Difficulty managing many subscriptions
- Ensuring all relevant notifications are sent (false negatives)
- Preventing irrelevant notifications (false positives)

**Recommendations:**

- Implement database indexes on disaster_type and location fields
- Load test with 10,000+ concurrent subscriptions
- Monitor notification delivery latency during high-volume alerts
- Conduct user testing for subscription UI/UX
- Provide clear guidance on subscription management
- Implement subscription recommendations for new users
- Add bulk subscription management tools
- Monitor false positive and false negative rates
- Regular audit of subscription filtering accuracy

---

**Document Version Control**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 10, 2026 | QA Team | Initial UAT Plan for Subscription Management Module |
