Feature: Chat Functionality
  As a logged-in user
  I want to interact with the AI chatbot
  So that I can get disaster management information

  Scenario: Create a new chat session
    Given I am logged in as a regular user
    When I click the "New Chat" button
    Then a new chat session should be created
    And the chat input field should be available

  Scenario: Send a text message to chatbot
    Given I am logged in as a regular user
    And I have an active chat session
    When I type "Hello, what disasters are common in Malaysia?" in the chat input
    And I press Enter
    Then my message should appear in the chat window
    And I should see a typing indicator
    And I should receive a response from the chatbot within 10 seconds
    And the response should be relevant to my question

  Scenario: View chat history
    Given I am logged in as a regular user
    And I have sent messages in previous sessions
    When I click on a previous chat session
    Then I should see all previous messages in that session
    And the messages should be in chronological order

  Scenario: Send voice message to chatbot
    Given I am logged in as a regular user
    And I have an active chat session
    When I click the microphone button
    And I allow microphone access
    And I speak "What is a flood warning?"
    And I stop recording
    Then my voice should be transcribed to text
    And the transcribed message should appear in the chat
    And I should receive a response from the chatbot

  Scenario: Interact with map through chatbot
    Given I am logged in as a regular user
    And I have an active chat session
    When I type "Show me flood zones in Kuala Lumpur"
    And I press Enter
    Then the chatbot should respond with map-related information
    And the map should update to show flood zones
    And the map should zoom to Kuala Lumpur area

  Scenario: Delete a chat session
    Given I am logged in as a regular user
    And I have multiple chat sessions
    When I right-click on a chat session
    And I select "Delete"
    And I confirm the deletion
    Then the chat session should be removed from the list
    And I should see a confirmation message

  Scenario: Rename a chat session
    Given I am logged in as a regular user
    And I have a chat session
    When I right-click on the session
    And I select "Rename"
    And I enter a new name "Flood Information"
    And I press Enter
    Then the session should be renamed
    And the new name should be displayed in the session list

  Scenario: Empty message validation
    Given I am logged in as a regular user
    And I have an active chat session
    When I try to send an empty message
    Then the send button should be disabled
    And no message should be sent

  Scenario: Multi-language support
    Given I am logged in as a regular user
    And I have an active chat session
    When I type a message in Malay "Apa itu banjir kilat?"
    And I press Enter
    Then the chatbot should detect the language
    And the response should be in Malay
