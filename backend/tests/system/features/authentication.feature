Feature: User Authentication
  As a user
  I want to register and login to the system
  So that I can access the chatbot and my personal data

  Scenario: Successful user registration with valid credentials
    Given I am on the registration page
    When I enter valid registration details
      | name           | E2E Test User        |
      | email          | test@example.com     |
      | password       | SecurePass123!       |
      | phone_number   | +60123456789         |
    And I submit the registration form
    Then I should see a success message
    And I should be redirected to the verification page

  Scenario: User login with valid credentials
    Given I have a registered account
    And I am on the login page
    When I enter my email and password
    And I click the login button
    Then I should be successfully logged in
    And I should see the chat interface

  Scenario: User login with invalid credentials
    Given I am on the login page
    When I enter an invalid email "wrong@example.com"
    And I enter an invalid password "WrongPassword"
    And I click the login button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page

  Scenario: User logout
    Given I am logged in as a regular user
    When I click the logout button
    Then I should be logged out
    And I should be redirected to the login page

  Scenario: Access protected page without authentication
    Given I am not logged in
    When I try to access the chat page directly
    Then I should be redirected to the login page

  Scenario: Password reset request
    Given I have a registered account
    And I am on the login page
    When I click "Forgot Password"
    And I enter my registered email
    And I submit the password reset request
    Then I should see a confirmation message
    And I should receive a password reset email
