# System Test Step Implementations

This directory contains step definitions for pytest-bdd scenarios.

## File Structure

- `auth_steps.py` - Authentication and authorization steps
- `chat_steps.py` - Chat functionality steps
- (Add more as needed: `notification_steps.py`, `admin_steps.py`, etc.)

## Step Definition Guidelines

### 1. Step Naming

Use clear, descriptive step text that matches Gherkin scenarios:

```python
# ✅ Good - Clear and descriptive
@when('I enter my email and password')

# ❌ Bad - Too generic
@when('I enter credentials')
```

### 2. Parameterized Steps

Use parsers for dynamic values:

```python
from pytest_bdd import parsers

@when(parsers.parse('I enter "{text}" in the search box'))
def enter_search_text(page, text):
    page.locator('input[type="search"]').fill(text)
```

### 3. Reusable Steps

Keep steps generic and reusable:

```python
# ✅ Reusable across features
@when(parsers.parse('I click the "{button_text}" button'))
def click_button(page, button_text):
    page.locator(f'button:has-text("{button_text}")').click()

# ❌ Too specific
@when('I click the login button on the login page')
```

### 4. Fixture Injection

Use pytest fixtures for setup:

```python
@given('I am logged in as a regular user')
def logged_in_user(authenticated_page):
    # authenticated_page fixture handles login
    pass
```

## Step Types

### Given Steps (Setup)

Establish preconditions before test actions:

```python
@given('I have a registered account')
def ensure_user_exists(registered_user):
    assert registered_user is not None
```

### When Steps (Actions)

Perform user actions:

```python
@when('I click the submit button')
def click_submit(page):
    page.locator('button[type="submit"]').click()
```

### Then Steps (Assertions)

Verify expected outcomes:

```python
@then('I should see a success message')
def verify_success(page):
    assert page.locator('.success').is_visible()
```

## Adding New Steps

1. Identify the feature being tested
2. Add step definitions to appropriate file (or create new file)
3. Import necessary fixtures and helpers
4. Implement step with clear assertions
5. Test the step in isolation

Example:

```python
# steps/notification_steps.py
from pytest_bdd import given, when, then, parsers

@given(parsers.parse('I have {count:d} unread notifications'))
def create_notifications(api_client, count):
    for i in range(count):
        api_client.post("/notifications", json_data={
            "title": f"Notification {i+1}",
            "message": "Test notification"
        })

@when('I click the notification icon')
def click_notification_icon(page):
    page.locator('[data-testid="notification-icon"]').click()

@then(parsers.parse('I should see {count:d} notifications'))
def verify_notification_count(page, count):
    notifications = page.locator('.notification-item')
    assert notifications.count() == count
```
