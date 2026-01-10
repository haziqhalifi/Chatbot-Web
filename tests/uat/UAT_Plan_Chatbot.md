# User Acceptance Testing (UAT) Plan

## Module 2: Chatbot

### Document Information

- **Module**: Chatbot
- **Version**: 1.0
- **Date**: January 10, 2026
- **Test Environment**: UAT Environment
- **Tester**: [To be filled by QA team]

---

## Test Cases

### FR10: Send Messages to Chatbot

| Test Case ID    | Test Scenario                            | Step-by-Step Instructions                                                                                                                                                                | Expected Result                                                                                                                                                                                                  |
| --------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR10-01** | Send text message to chatbot             | 1. Log in to the application<br>2. Navigate to chatbot interface<br>3. Type a message in the input field (e.g., "Hello")<br>4. Click "Send" button or press Enter<br>5. Observe response | • Message is sent successfully<br>• Message appears in chat window<br>• Chatbot processes the message<br>• Response is displayed in chat window<br>• Timestamp is shown for both user message and bot response   |
| **UAT-FR10-02** | Send empty message to chatbot            | 1. Navigate to chatbot interface<br>2. Leave input field empty<br>3. Click "Send" button or press Enter                                                                                  | • Send button is disabled OR<br>• Validation message appears<br>• Empty message is not sent<br>• No API call is made                                                                                             |
| **UAT-FR10-03** | Send long message to chatbot             | 1. Navigate to chatbot interface<br>2. Type a very long message (500+ characters)<br>3. Click "Send" button                                                                              | • Message is accepted and sent<br>• Full message is displayed in chat<br>• Chatbot processes entire message<br>• Response is generated based on full context<br>• No truncation occurs (or appropriate handling) |
| **UAT-FR10-04** | Send message with special characters     | 1. Navigate to chatbot interface<br>2. Type message with special characters (e.g., "@#$%^&\*()<>?/")<br>3. Click "Send" button                                                           | • Message is sent successfully<br>• Special characters are displayed correctly<br>• No encoding issues occur<br>• Chatbot processes message normally                                                             |
| **UAT-FR10-05** | Send message with emojis                 | 1. Navigate to chatbot interface<br>2. Type message containing emojis (e.g., "Hello 👋 How are you? 😊")<br>3. Click "Send" button                                                       | • Message is sent successfully<br>• Emojis are displayed correctly<br>• Chatbot processes message<br>• Response is generated appropriately                                                                       |
| **UAT-FR10-06** | Send multiple consecutive messages       | 1. Navigate to chatbot interface<br>2. Send first message and wait for response<br>3. Send second message immediately<br>4. Send third message<br>5. Observe chat flow                   | • All messages are sent successfully<br>• Messages appear in chronological order<br>• Each message receives a response<br>• Chat maintains conversation context<br>• No messages are lost                        |
| **UAT-FR10-07** | Send message while chatbot is responding | 1. Navigate to chatbot interface<br>2. Send a message that triggers a long response<br>3. While chatbot is typing, send another message<br>4. Observe behavior                           | • First message response completes OR<br>• Second message is queued<br>• Both messages are handled appropriately<br>• No message is lost<br>• System handles concurrent requests gracefully                      |
| **UAT-FR10-08** | Message sent indicator/confirmation      | 1. Navigate to chatbot interface<br>2. Send a message<br>3. Observe visual indicators                                                                                                    | • Sending indicator appears during transmission<br>• Message shows "sent" status<br>• Loading indicator appears while waiting for response<br>• User receives clear feedback on message status                   |
| **UAT-FR10-09** | Send message without authentication      | 1. Open chatbot in incognito mode (not logged in)<br>2. Attempt to send a message                                                                                                        | • User is redirected to login page OR<br>• Error message indicates authentication required<br>• Message is not sent<br>• Chat functionality is protected                                                         |
| **UAT-FR10-10** | Send message after session timeout       | 1. Log in and navigate to chatbot<br>2. Wait for session to expire (or manually expire)<br>3. Attempt to send a message                                                                  | • Error message indicates session expired<br>• User is prompted to log in again<br>• Message is not sent<br>• Session expiration is handled gracefully                                                           |

---

### FR11: Create New Chat Session

| Test Case ID    | Test Scenario                               | Step-by-Step Instructions                                                                                                                       | Expected Result                                                                                                                                                                                                      |
| --------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR11-01** | Create new chat session                     | 1. Log in to the application<br>2. Navigate to chatbot interface<br>3. Click "New Chat" or "Start New Session" button<br>4. Observe interface   | • New chat session is created<br>• Chat window is cleared<br>• Previous conversation is saved<br>• New session has unique session ID<br>• User can start fresh conversation                                          |
| **UAT-FR11-02** | Automatic session creation on first message | 1. Log in to the application<br>2. Navigate to chatbot interface (no existing session)<br>3. Send first message<br>4. Check session creation    | • New session is created automatically<br>• Session ID is generated<br>• Message is associated with new session<br>• Session is stored in database                                                                   |
| **UAT-FR11-03** | Multiple chat sessions management           | 1. Create first chat session and send messages<br>2. Create second chat session<br>3. Create third chat session<br>4. Navigate between sessions | • Multiple sessions can be created<br>• Each session maintains independent conversation<br>• Sessions are listed in sidebar/history<br>• User can switch between sessions<br>• Each session retains its own messages |
| **UAT-FR11-04** | Session naming/titling                      | 1. Create new chat session<br>2. Send first message<br>3. Observe session title/name                                                            | • Session is given a default name OR<br>• Session title is generated from first message<br>• Title is displayed in session list<br>• Title helps identify conversation topic                                         |
| **UAT-FR11-05** | Rename chat session                         | 1. Create a chat session<br>2. Right-click or access session options<br>3. Select "Rename" option<br>4. Enter new name<br>5. Save changes       | • Rename option is available<br>• User can enter custom name<br>• New name is saved<br>• Updated name appears in session list<br>• Name change is persisted to database                                              |
| **UAT-FR11-06** | Delete chat session                         | 1. Create chat session with messages<br>2. Access session options<br>3. Click "Delete" option<br>4. Confirm deletion                            | • Confirmation dialog appears<br>• Session is deleted after confirmation<br>• Session is removed from list<br>• Session data is removed from database<br>• User cannot access deleted session                        |
| **UAT-FR11-07** | Session persistence after logout            | 1. Create multiple chat sessions<br>2. Send messages in each session<br>3. Log out<br>4. Log in again<br>5. Navigate to chatbot                 | • All previous sessions are available<br>• Session list shows all saved sessions<br>• User can access previous conversations<br>• Sessions are loaded from database                                                  |
| **UAT-FR11-08** | Maximum sessions limit (if applicable)      | 1. Create multiple chat sessions<br>2. Attempt to create sessions beyond limit (if limit exists)<br>3. Observe system behavior                  | • System enforces session limit (if applicable)<br>• Error message indicates limit reached<br>• User is prompted to delete old sessions<br>• Limit is clearly communicated                                           |
| **UAT-FR11-09** | Session isolation between users             | 1. Log in as User A and create sessions<br>2. Log out and log in as User B<br>3. Navigate to chatbot<br>4. Observe available sessions           | • User B cannot see User A's sessions<br>• Only User B's own sessions are displayed<br>• Sessions are properly isolated by user<br>• No data leakage between users                                                   |

---

### FR12: Store Chat History in Database

| Test Case ID    | Test Scenario                               | Step-by-Step Instructions                                                                                                                     | Expected Result                                                                                                                                                                                                                 |
| --------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR12-01** | Chat messages stored in database            | 1. Send multiple messages in a chat session<br>2. Receive chatbot responses<br>3. Access database (admin)<br>4. Query chat messages table     | • All user messages are stored in database<br>• All bot responses are stored<br>• Messages have correct timestamps<br>• Messages are associated with correct session and user                                                   |
| **UAT-FR12-02** | Chat history retrieval                      | 1. Send messages in a chat session<br>2. Close the chat or navigate away<br>3. Return to the same chat session<br>4. Observe messages         | • All previous messages are displayed<br>• Messages are loaded from database<br>• Messages appear in correct chronological order<br>• Conversation context is preserved                                                         |
| **UAT-FR12-03** | Chat history across sessions (login/logout) | 1. Send messages in a chat session<br>2. Log out<br>3. Log in again<br>4. Open the same chat session                                          | • Chat history is retained<br>• All messages are loaded correctly<br>• Timestamps are preserved<br>• No data loss occurs                                                                                                        |
| **UAT-FR12-04** | Database storage integrity                  | 1. Send message with special characters, emojis, and long text<br>2. Query database for the message<br>3. Compare stored vs displayed content | • All characters are stored correctly<br>• No encoding issues in database<br>• Special characters and emojis preserved<br>• Data integrity is maintained                                                                        |
| **UAT-FR12-05** | Message metadata storage                    | 1. Send multiple messages<br>2. Access database and inspect message records<br>3. Verify metadata fields                                      | • Message ID is stored<br>• Session ID is stored<br>• User ID is stored<br>• Timestamp is stored<br>• Message role (user/assistant) is stored<br>• Additional metadata is captured (if applicable)                              |
| **UAT-FR12-06** | Concurrent message storage                  | 1. Open chatbot on two different browsers with same account<br>2. Send messages from both browsers<br>3. Check database for all messages      | • All messages from both browsers are stored<br>• No message conflicts occur<br>• Database handles concurrent writes correctly<br>• All messages are retrievable                                                                |
| **UAT-FR12-07** | Chat history pagination/loading             | 1. Create a session with 100+ messages<br>2. Close and reopen the session<br>3. Observe loading behavior                                      | • Messages load efficiently<br>• Pagination or lazy loading implemented (if applicable)<br>• Most recent messages appear first OR<br>• Full history loads without performance issues<br>• User can scroll to see older messages |
| **UAT-FR12-08** | Failed message storage handling             | 1. Send a message while database is unavailable (simulate)<br>2. Observe system behavior<br>3. Restore database connection                    | • Error is handled gracefully<br>• User is notified of failure<br>• Message can be retried<br>• System attempts to save when connection restored                                                                                |
| **UAT-FR12-09** | Chat history data retention                 | 1. Create old chat sessions (if test data available)<br>2. Verify if old sessions are retained<br>3. Check data retention policy              | • Chat history is retained per policy<br>• Old sessions remain accessible OR<br>• Sessions are archived after specified period<br>• Data retention policy is enforced                                                           |

---

### FR13: Text and Voice Support

| Test Case ID    | Test Scenario                            | Step-by-Step Instructions                                                                                                                                                                                           | Expected Result                                                                                                                                                                                           |
| --------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR13-01** | Send text message                        | 1. Navigate to chatbot interface<br>2. Type text message in input field<br>3. Click "Send" button<br>4. Receive response                                                                                            | • Text input works correctly<br>• Message is sent and processed<br>• Response is received as text<br>• Text interface is fully functional                                                                 |
| **UAT-FR13-02** | Access voice input feature               | 1. Navigate to chatbot interface<br>2. Locate microphone/voice input button<br>3. Verify button is visible and clickable                                                                                            | • Voice input button is present<br>• Button displays appropriate icon (microphone)<br>• Button is easily accessible<br>• Tooltip or label indicates voice function                                        |
| **UAT-FR13-03** | Send voice message - basic functionality | 1. Click microphone/voice input button<br>2. Allow microphone permissions (if prompted)<br>3. Speak a clear message (e.g., "What is the weather today?")<br>4. Stop recording<br>5. Observe processing and response | • Browser requests microphone permission<br>• Recording indicator appears<br>• Audio is captured<br>• Voice is transcribed to text<br>• Transcribed text is displayed<br>• Chatbot processes and responds |
| **UAT-FR13-04** | Microphone permission denied             | 1. Click voice input button<br>2. Deny microphone permission when prompted<br>3. Observe system behavior                                                                                                            | • Error message indicates permission denied<br>• User is instructed to enable microphone<br>• Fallback to text input available<br>• System handles permission denial gracefully                           |
| **UAT-FR13-05** | Voice input transcription accuracy       | 1. Click voice input button<br>2. Speak a clear, structured sentence<br>3. Stop recording<br>4. Compare spoken words with transcribed text                                                                          | • Transcription is accurate (reasonable threshold)<br>• Common words are recognized correctly<br>• Transcribed text is displayed to user<br>• User can edit transcription if needed                       |
| **UAT-FR13-06** | Voice input with background noise        | 1. Enable voice input in noisy environment<br>2. Speak a message<br>3. Observe transcription quality                                                                                                                | • System attempts to filter noise<br>• Primary speech is captured<br>• Transcription quality may vary but is functional<br>• Error handling for unclear audio                                             |
| **UAT-FR13-07** | Voice input language detection           | 1. Click voice input button<br>2. Speak in English<br>3. Send another voice message in Malay<br>4. Observe transcription                                                                                            | • English speech is transcribed correctly<br>• Malay speech is transcribed correctly<br>• System handles multiple languages OR<br>• Language can be selected before recording                             |
| **UAT-FR13-08** | Cancel voice recording                   | 1. Click voice input button<br>2. Start speaking<br>3. Click "Cancel" or close recording<br>4. Observe behavior                                                                                                     | • Recording is cancelled<br>• No message is sent<br>• User can start new recording<br>• Interface returns to normal state                                                                                 |
| **UAT-FR13-09** | Voice input timeout                      | 1. Click voice input button<br>2. Speak for extended period (if timeout exists)<br>3. Observe system behavior                                                                                                       | • System enforces maximum recording duration<br>• User is notified of timeout<br>• Recorded audio up to timeout is processed OR<br>• User is prompted to try again                                        |
| **UAT-FR13-10** | Switch between text and voice input      | 1. Send a text message<br>2. Send a voice message<br>3. Send another text message<br>4. Observe functionality                                                                                                       | • User can seamlessly switch between input methods<br>• Both methods work correctly<br>• Chat history shows all messages<br>• No conflicts between input modes                                            |
| **UAT-FR13-11** | Voice input on mobile devices            | 1. Access chatbot on mobile device (iOS/Android)<br>2. Click voice input button<br>3. Record and send voice message                                                                                                 | • Voice input works on mobile browsers/apps<br>• Mobile microphone is accessed<br>• Transcription functions correctly<br>• Mobile UI adapts to voice input                                                |
| **UAT-FR13-12** | Voice input error handling               | 1. Click voice input button<br>2. Speak very quietly or unclearly<br>3. Observe system response                                                                                                                     | • System attempts to transcribe<br>• Error message if transcription fails<br>• User can retry recording<br>• Fallback to text input suggested                                                             |

---

### FR14: Style and Format OpenAI Response

| Test Case ID    | Test Scenario                         | Step-by-Step Instructions                                                                                                  | Expected Result                                                                                                                                                                                    |
| --------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR14-01** | Basic text formatting                 | 1. Ask chatbot a question that generates formatted response<br>2. Observe response display<br>3. Check for text formatting | • Plain text is displayed clearly<br>• Paragraphs are separated properly<br>• Line breaks are respected<br>• Text is readable and well-formatted                                                   |
| **UAT-FR14-02** | Bold and italic text rendering        | 1. Ask chatbot question that triggers **bold** or _italic_ markdown<br>2. Observe response rendering                       | • Bold text is rendered in bold<br>• Italic text is rendered in italics<br>• Markdown formatting is converted to HTML<br>• Text emphasis is visually clear                                         |
| **UAT-FR14-03** | Code block formatting                 | 1. Ask chatbot to provide code snippet (e.g., "Show me Python hello world code")<br>2. Observe code display                | • Code is displayed in code block<br>• Monospace font is used<br>• Syntax highlighting is applied (if supported)<br>• Code block has distinct background color<br>• Copy button available for code |
| **UAT-FR14-04** | Inline code formatting                | 1. Ask chatbot a technical question with inline code<br>2. Observe inline code rendering                                   | • Inline code has distinct styling<br>• Monospace font for code segments<br>• Background or border differentiates from text<br>• Easy to identify code within text                                 |
| **UAT-FR14-05** | Bulleted list formatting              | 1. Ask chatbot for a list (e.g., "List 5 programming languages")<br>2. Observe list rendering                              | • Bulleted list is formatted correctly<br>• Each item has bullet point<br>• Items are properly indented<br>• List is visually organized                                                            |
| **UAT-FR14-06** | Numbered list formatting              | 1. Ask chatbot for step-by-step instructions<br>2. Observe numbered list rendering                                         | • Numbered list is formatted correctly<br>• Numbers are sequential<br>• Items are properly indented<br>• List structure is clear                                                                   |
| **UAT-FR14-07** | Heading formatting                    | 1. Ask chatbot for structured information with headings<br>2. Observe heading rendering                                    | • Headings are styled differently from body text<br>• Different heading levels are distinguished (H1, H2, H3)<br>• Hierarchy is visually clear<br>• Headings help organize content                 |
| **UAT-FR14-08** | Link formatting and functionality     | 1. Ask chatbot question that includes URLs in response<br>2. Click on links<br>3. Verify link behavior                     | • URLs are rendered as clickable links<br>• Links have distinct color/underline<br>• Clicking opens link in new tab<br>• Links are properly formatted                                              |
| **UAT-FR14-09** | Table formatting (if supported)       | 1. Ask chatbot to provide data in table format<br>2. Observe table rendering                                               | • Tables are rendered with proper structure<br>• Columns and rows are aligned<br>• Headers are distinguishable<br>• Table is readable and formatted<br>• Responsive on different screen sizes      |
| **UAT-FR14-10** | Blockquote formatting                 | 1. Ask chatbot for a response with quotes<br>2. Observe blockquote rendering                                               | • Blockquotes have distinct styling<br>• Indentation or border indicates quote<br>• Different background or color<br>• Clearly distinguishable from regular text                                   |
| **UAT-FR14-11** | Mixed content formatting              | 1. Ask complex question requiring formatted response with multiple elements<br>2. Observe comprehensive formatting         | • All formatting types render correctly together<br>• Text, code, lists, links coexist properly<br>• No formatting conflicts<br>• Response is well-organized and readable                          |
| **UAT-FR14-12** | Long response formatting              | 1. Ask question generating very long response<br>2. Observe formatting consistency<br>3. Scroll through entire response    | • Formatting is consistent throughout<br>• No rendering issues with long content<br>• Scrolling works smoothly<br>• All formatting elements display correctly                                      |
| **UAT-FR14-13** | Mathematical equations (if supported) | 1. Ask chatbot mathematical question<br>2. Observe equation rendering                                                      | • Mathematical notation is rendered correctly<br>• LaTeX or MathML is converted properly<br>• Equations are readable<br>• Symbols display correctly                                                |
| **UAT-FR14-14** | Responsive formatting on mobile       | 1. Access chatbot on mobile device<br>2. View formatted responses<br>3. Check various formatting elements                  | • Formatting adapts to mobile screen<br>• Code blocks are scrollable if needed<br>• Tables are responsive<br>• All content is readable on small screens                                            |

---

### FR15: AI Model (OpenAI) Integration

| Test Case ID    | Test Scenario                      | Step-by-Step Instructions                                                                                                                            | Expected Result                                                                                                                                                                 |
| --------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR15-01** | Basic OpenAI response generation   | 1. Send a simple question to chatbot (e.g., "What is AI?")<br>2. Observe response<br>3. Verify response quality                                      | • Response is generated by OpenAI<br>• Answer is relevant to question<br>• Response is coherent and well-written<br>• Response time is reasonable (< 10 seconds)                |
| **UAT-FR15-02** | OpenAI API connection verification | 1. Send a message to chatbot<br>2. Monitor network traffic (developer tools)<br>3. Verify API calls                                                  | • API request is sent to OpenAI endpoint<br>• Request includes proper authentication<br>• Response is received from OpenAI<br>• API integration is functional                   |
| **UAT-FR15-03** | Context retention in conversation  | 1. Send first message: "My name is John"<br>2. Send second message: "What is my name?"<br>3. Observe response<br>4. Continue multi-turn conversation | • Chatbot remembers previous context<br>• Response correctly identifies "John"<br>• Conversation history is maintained<br>• Context is sent with each request                   |
| **UAT-FR15-04** | Complex query handling             | 1. Ask complex, multi-part question<br>2. Observe response quality                                                                                   | • Chatbot provides comprehensive answer<br>• All parts of question are addressed<br>• Response is well-structured<br>• AI demonstrates understanding                            |
| **UAT-FR15-05** | OpenAI model response time         | 1. Send various types of questions<br>2. Measure response times<br>3. Test during different times of day                                             | • Response time is within acceptable limits<br>• Loading indicator shows during processing<br>• User is aware of processing status<br>• Timeout handling if response is delayed |
| **UAT-FR15-06** | OpenAI API error handling          | 1. Simulate OpenAI API unavailability (if testable)<br>2. Send a message<br>3. Observe error handling                                                | • Error message is displayed to user<br>• Error is logged for admin review<br>• User is informed to try again later<br>• Application doesn't crash                              |
| **UAT-FR15-07** | Token/rate limit handling          | 1. Send many messages in quick succession<br>2. Observe system behavior<br>3. Check for rate limiting                                                | • System handles rate limits gracefully<br>• User is notified if limit reached<br>• Appropriate wait time communicated<br>• No service disruption                               |
| **UAT-FR15-08** | OpenAI API key security            | 1. Inspect network requests (developer tools)<br>2. Check for API key exposure<br>3. Review client-side code                                         | • API key is not exposed in client-side code<br>• Requests are made through backend<br>• Authentication is handled securely<br>• No sensitive credentials visible               |
| **UAT-FR15-09** | Response quality consistency       | 1. Ask same question multiple times<br>2. Compare responses<br>3. Evaluate consistency                                                               | • Responses are relevant and accurate<br>• Quality is consistent across requests<br>• Answers address the question<br>• No degradation in response quality                      |
| **UAT-FR15-10** | Content moderation and safety      | 1. Ask inappropriate or harmful question<br>2. Observe chatbot response                                                                              | • OpenAI content filters are active<br>• Inappropriate content is blocked or handled<br>• Safe, appropriate response is provided<br>• System maintains safety standards         |
| **UAT-FR15-11** | Large input handling               | 1. Send very long message (near token limit)<br>2. Observe processing and response                                                                   | • Long message is processed correctly<br>• Response is generated appropriately<br>• Token limits are respected<br>• Error handling if input exceeds limits                      |
| **UAT-FR15-12** | System prompt effectiveness        | 1. Ask chatbot about its purpose/role<br>2. Test domain-specific questions<br>3. Verify response alignment with system prompt                        | • Chatbot responds according to configured role<br>• System prompt guides behavior<br>• Domain knowledge is appropriate<br>• Responses align with application purpose           |

---

### FR16: Export Chat History

| Test Case ID    | Test Scenario                                  | Step-by-Step Instructions                                                                                                                                                                   | Expected Result                                                                                                                                                                                        |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **UAT-FR16-01** | Export single chat session                     | 1. Create chat session with multiple messages<br>2. Click "Export" or "Download" button<br>3. Select export format (if options available)<br>4. Click "Export"<br>5. Verify downloaded file | • Export option is available and visible<br>• File is downloaded to device<br>• File contains all messages from session<br>• File format is readable (PDF, JSON, TXT, etc.)                            |
| **UAT-FR16-02** | Export to PDF format                           | 1. Navigate to chat session<br>2. Select "Export as PDF"<br>3. Download file<br>4. Open PDF                                                                                                 | • PDF file is generated<br>• All messages are included<br>• Formatting is preserved<br>• Timestamps are included<br>• PDF is readable and well-formatted                                               |
| **UAT-FR16-03** | Export to JSON format                          | 1. Navigate to chat session<br>2. Select "Export as JSON"<br>3. Download file<br>4. Open JSON in text editor                                                                                | • JSON file is generated<br>• Data structure is valid JSON<br>• All messages are included<br>• Metadata (timestamps, IDs) is included<br>• JSON is properly formatted                                  |
| **UAT-FR16-04** | Export to plain text format                    | 1. Navigate to chat session<br>2. Select "Export as TXT"<br>3. Download file<br>4. Open text file                                                                                           | • TXT file is generated<br>• Messages are in readable format<br>• Conversation flow is preserved<br>• Timestamps and speaker labels included<br>• File is easily readable                              |
| **UAT-FR16-05** | Export empty chat session                      | 1. Create new chat session with no messages<br>2. Attempt to export<br>3. Observe behavior                                                                                                  | • Export button may be disabled OR<br>• Warning message indicates no content<br>• Empty export file is generated with metadata OR<br>• User is notified appropriately                                  |
| **UAT-FR16-06** | Export large chat session                      | 1. Create session with 100+ messages<br>2. Click export<br>3. Wait for file generation<br>4. Verify file                                                                                    | • Large export is processed successfully<br>• All messages are included<br>• File size is appropriate<br>• No data truncation occurs<br>• Export completes within reasonable time                      |
| **UAT-FR16-07** | Export with special characters and emojis      | 1. Create chat with special characters, emojis, code blocks<br>2. Export chat<br>3. Open exported file                                                                                      | • All special characters are preserved<br>• Emojis are included correctly<br>• Code formatting is maintained<br>• No encoding issues in export                                                         |
| **UAT-FR16-08** | Export multiple chat sessions                  | 1. Create multiple chat sessions<br>2. Select multiple sessions (if supported)<br>3. Export all selected sessions<br>4. Verify export                                                       | • Multiple sessions can be selected<br>• All selected sessions are exported<br>• Sessions are clearly separated in export<br>• File naming indicates multiple sessions                                 |
| **UAT-FR16-09** | Export filename customization                  | 1. Navigate to chat session<br>2. Click export<br>3. Observe default filename<br>4. Customize filename (if supported)<br>5. Download                                                        | • Default filename is meaningful (includes date/session name)<br>• User can customize filename<br>• File extension is correct<br>• Filename follows naming conventions                                 |
| **UAT-FR16-10** | Export from mobile device                      | 1. Access chatbot on mobile device<br>2. Navigate to chat session<br>3. Click export<br>4. Download file                                                                                    | • Export works on mobile browsers/apps<br>• File is saved to mobile device<br>• User can access downloaded file<br>• Mobile download UX is functional                                                  |
| **UAT-FR16-11** | Re-import or view exported chat (if supported) | 1. Export a chat session<br>2. Delete or clear the session<br>3. Import the exported file back (if feature exists)<br>4. Verify data                                                        | • Exported file can be re-imported (if supported)<br>• All data is restored correctly<br>• Message order is preserved<br>• Export serves as backup                                                     |
| **UAT-FR16-12** | Export includes metadata                       | 1. Export chat session<br>2. Open exported file<br>3. Check for metadata fields                                                                                                             | • Export includes session ID<br>• User information is included (if appropriate)<br>• Export timestamp is included<br>• Message timestamps are included<br>• Complete conversation context is preserved |

---

### FR17: Multi-Language Support (English and Malay)

| Test Case ID    | Test Scenario                                | Step-by-Step Instructions                                                                                                                                                                         | Expected Result                                                                                                                                                                                                   |
| --------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UAT-FR17-01** | Send message in English                      | 1. Navigate to chatbot<br>2. Send message in English (e.g., "Hello, how are you?")<br>3. Observe response                                                                                         | • Chatbot detects English language<br>• Response is generated in English<br>• Response is grammatically correct<br>• Language is appropriate and natural                                                          |
| **UAT-FR17-02** | Send message in Malay                        | 1. Navigate to chatbot<br>2. Send message in Malay (e.g., "Apa khabar?")<br>3. Observe response                                                                                                   | • Chatbot detects Malay language<br>• Response is generated in Malay<br>• Response is grammatically correct<br>• Language is natural and appropriate                                                              |
| **UAT-FR17-03** | Language detection accuracy                  | 1. Send message in English<br>2. Send next message in Malay<br>3. Alternate between languages<br>4. Observe responses                                                                             | • Chatbot correctly detects each language<br>• Responses match input language<br>• No language confusion occurs<br>• Switching languages works seamlessly                                                         |
| **UAT-FR17-04** | Manual language selection                    | 1. Navigate to chatbot interface<br>2. Look for language selector/toggle<br>3. Select English<br>4. Send message and verify response<br>5. Switch to Malay<br>6. Send message and verify response | • Language selector is visible and accessible<br>• User can manually select preferred language<br>• Chatbot responds in selected language<br>• Language preference is maintained<br>• Setting is clear to user    |
| **UAT-FR17-05** | Mixed language input                         | 1. Send message mixing English and Malay words<br>2. Observe response<br>3. Test different combinations                                                                                           | • Chatbot handles mixed language input<br>• Response language is appropriate (dominant language OR user preference)<br>• Response is coherent<br>• No errors occur                                                |
| **UAT-FR17-06** | Language persistence across session          | 1. Select language preference (e.g., Malay)<br>2. Send multiple messages<br>3. Close and reopen chat<br>4. Send new message                                                                       | • Language preference is remembered<br>• Subsequent responses maintain language<br>• Preference persists across session<br>• User doesn't need to reselect language                                               |
| **UAT-FR17-07** | Language-specific content accuracy (English) | 1. Ask domain-specific question in English<br>2. Verify response accuracy and relevance                                                                                                           | • Response is accurate in English<br>• Technical terms are correct<br>• Information is relevant to Malaysia/context<br>• Language quality is professional                                                         |
| **UAT-FR17-08** | Language-specific content accuracy (Malay)   | 1. Ask domain-specific question in Malay<br>2. Verify response accuracy and relevance                                                                                                             | • Response is accurate in Malay<br>• Technical terms are translated appropriately<br>• Information is relevant to Malaysia/context<br>• Language quality is professional                                          |
| **UAT-FR17-09** | UI language switching                        | 1. Check if UI language can be changed<br>2. Switch UI to Malay<br>3. Observe interface labels and buttons<br>4. Switch back to English                                                           | • UI elements support both languages (if applicable)<br>• Labels, buttons, placeholders are translated<br>• Language switch affects entire interface<br>• Both languages are fully supported                      |
| **UAT-FR17-10** | Voice input language support                 | 1. Use voice input in English<br>2. Speak clearly and observe transcription<br>3. Switch to Malay<br>4. Use voice input in Malay<br>5. Observe transcription                                      | • Voice recognition supports both English and Malay<br>• Transcription is accurate for both languages<br>• Language is detected correctly<br>• Responses match voice input language                               |
| **UAT-FR17-11** | Character encoding support                   | 1. Send Malay text with special characters (é, ñ, etc.)<br>2. Observe display and response<br>3. Check exported chat                                                                              | • Special characters display correctly<br>• No encoding issues occur<br>• Characters are preserved in database<br>• Export maintains character integrity                                                          |
| **UAT-FR17-12** | Language preference in user profile          | 1. Navigate to user profile settings<br>2. Look for language preference setting<br>3. Set preferred language<br>4. Save and verify<br>5. Test chatbot                                             | • Language preference is available in settings<br>• User can set default language<br>• Preference is saved to profile<br>• Chatbot uses preferred language by default<br>• Setting persists across login sessions |

---

## Testing Prerequisites

### Test Environment Setup

- [ ] UAT environment with chatbot module enabled
- [ ] OpenAI API integration configured and functional
- [ ] Database with chat storage tables set up
- [ ] Voice input capability enabled (browser permissions)
- [ ] Test user accounts with various language preferences
- [ ] Sample chat data for testing export functionality

### Required Access

- [ ] UAT application URL
- [ ] Test user credentials (multiple accounts)
- [ ] Admin access for database verification
- [ ] Microphone access for voice input testing
- [ ] Multiple browsers for cross-browser testing
- [ ] Mobile devices for mobile testing

### Test Data Requirements

- [ ] Sample questions in English and Malay
- [ ] Technical queries for testing domain knowledge
- [ ] Long text samples for testing limits
- [ ] Special characters and emoji test cases
- [ ] Pre-populated chat sessions for export testing

### Technical Requirements

- [ ] Modern browsers (Chrome, Firefox, Safari, Edge) with latest versions
- [ ] Microphone-enabled devices for voice testing
- [ ] Stable internet connection for API calls
- [ ] PDF/JSON viewer applications for export verification
- [ ] Network monitoring tools (browser DevTools)

---

## Test Execution Guidelines

### General Testing Notes

1. **Response Time**: Monitor chatbot response times; acceptable threshold is < 10 seconds for standard queries
2. **API Monitoring**: Use browser developer tools to monitor API calls and responses
3. **Language Testing**: Test with native speakers or verified translations for accuracy
4. **Voice Testing**: Conduct in quiet environment for accurate transcription
5. **Documentation**: Screenshot all formatted responses for verification
6. **Cross-Browser**: Test on at least 3 different browsers
7. **Mobile Testing**: Test on both iOS and Android devices

### Defect Reporting

When a test case fails, document:

- Test Case ID
- Actual Result vs Expected Result
- Steps to Reproduce
- Screenshots/Screen recordings (especially for formatting issues)
- Browser and Device Information
- Error messages or console logs
- Network request/response details (if applicable)
- Severity: Critical, High, Medium, Low
- Language being tested (if relevant)

### Pass/Fail Criteria

- **Pass**: All expected results are achieved, chatbot functions as specified
- **Fail**: Any expected result is not achieved, functionality is broken
- **Partial Pass**: Core functionality works but with minor issues (document as defect)
- **Blocked**: Test cannot be executed due to dependencies or environment issues
- **N/A**: Test case not applicable for this release or configuration

### Special Considerations for Chatbot Testing

- **AI Response Variability**: OpenAI responses may vary; focus on relevance and coherence rather than exact wording
- **Voice Recognition**: Transcription accuracy depends on accent, clarity, and environment
- **Context Testing**: Test conversation flow with multiple turns to verify context retention
- **Performance**: Monitor response times during peak and off-peak hours
- **Language Quality**: Engage native Malay speakers for language quality verification

---

## Sign-Off

| Role             | Name | Signature | Date |
| ---------------- | ---- | --------- | ---- |
| QA Lead          |      |           |      |
| Test Manager     |      |           |      |
| Product Owner    |      |           |      |
| Development Lead |      |           |      |
| AI/ML Specialist |      |           |      |

---

## Test Summary

| Total Test Cases | Passed | Failed | Blocked | N/A | Partial Pass |
| ---------------- | ------ | ------ | ------- | --- | ------------ |
| 92               |        |        |         |     |              |

### Test Coverage by Functional Requirement

| FR   | Description                            | Test Cases | Status |
| ---- | -------------------------------------- | ---------- | ------ |
| FR10 | Send messages to chatbot               | 10         |        |
| FR11 | Create new chat session                | 9          |        |
| FR12 | Store chat history in database         | 9          |        |
| FR13 | Text and voice support                 | 12         |        |
| FR14 | Style and format OpenAI response       | 14         |        |
| FR15 | AI model (OpenAI) integration          | 12         |        |
| FR16 | Export chat history                    | 12         |        |
| FR17 | Multi-language support (English/Malay) | 12         |        |

### Notes

_Use this section to document any additional observations, risks, or recommendations from the testing phase._

**Key Risks Identified:**

- OpenAI API availability and response time variability
- Voice recognition accuracy across different accents and environments
- Language quality verification requires native speaker validation
- Export functionality on various devices and browsers

**Recommendations:**

- Test during different times to assess API performance variability
- Conduct language quality review with bilingual testers
- Verify voice input across different microphone hardware
- Monitor token usage and costs during testing

---

**Document Version Control**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 10, 2026 | QA Team | Initial UAT Plan for Chatbot Module |
