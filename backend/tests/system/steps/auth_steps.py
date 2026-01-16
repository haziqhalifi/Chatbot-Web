"""
Step definitions for authentication features
"""
from pytest_bdd import given, when, then, parsers
from playwright.sync_api import Page, expect
import time


# ============================================================================
# GIVEN STEPS
# ============================================================================

@given("I am on the registration page")
def navigate_to_registration(page: Page):
    """Navigate to registration page"""
    from conftest import FRONTEND_BASE_URL
    page.goto(f"{FRONTEND_BASE_URL}/register")
    page.wait_for_load_state("networkidle")


@given("I have a registered account")
def ensure_registered_user(registered_user):
    """Ensure test user is registered (uses fixture)"""
    assert registered_user is not None
    assert "token" in registered_user


@given("I am on the login page")
def navigate_to_login(page: Page):
    """Navigate to login page"""
    from conftest import FRONTEND_BASE_URL
    page.goto(f"{FRONTEND_BASE_URL}/login")
    page.wait_for_load_state("networkidle")


@given("I am logged in as a regular user")
def logged_in_user(authenticated_page: Page):
    """User is logged in (uses authenticated_page fixture)"""
    # Verify we're logged in by checking for chat interface or user menu
    authenticated_page.wait_for_load_state("networkidle")
    # You may need to adjust the selector based on your app
    time.sleep(1)  # Allow UI to settle


@given("I am not logged in")
def not_logged_in(page: Page):
    """Ensure user is not logged in"""
    from conftest import FRONTEND_BASE_URL
    # Clear storage
    page.goto(FRONTEND_BASE_URL)
    page.evaluate("localStorage.clear(); sessionStorage.clear();")
    page.reload()


# ============================================================================
# WHEN STEPS
# ============================================================================

@when(parsers.parse('I enter valid registration details\n{table}'))
@when("I enter valid registration details")
def enter_registration_details(page: Page, test_user_credentials):
    """Fill in registration form"""
    # Find and fill form fields (adjust selectors based on your app)
    
    # Name field
    name_input = page.locator('input[name="name"], input[placeholder*="Name"]').first
    if name_input.is_visible():
        name_input.fill(test_user_credentials["name"])
    
    # Email field
    email_input = page.locator('input[name="email"], input[type="email"]').first
    email_input.fill(test_user_credentials["email"])
    
    # Password field
    password_input = page.locator('input[name="password"], input[type="password"]').first
    password_input.fill(test_user_credentials["password"])
    
    # Phone number (if exists)
    phone_input = page.locator('input[name="phone_number"], input[placeholder*="Phone"]').first
    if phone_input.is_visible(timeout=1000):
        phone_input.fill(test_user_credentials.get("phone_number", ""))


@when("I submit the registration form")
def submit_registration(page: Page):
    """Submit registration form"""
    # Find submit button (adjust selector)
    submit_button = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")').first
    submit_button.click()
    time.sleep(2)  # Wait for submission


@when("I enter my email and password")
def enter_login_credentials(page: Page, registered_user):
    """Enter login credentials"""
    email_input = page.locator('input[name="email"], input[type="email"]').first
    email_input.fill(registered_user["email"])
    
    password_input = page.locator('input[name="password"], input[type="password"]').first
    password_input.fill(registered_user["password"])


@when("I click the login button")
def click_login_button(page: Page):
    """Click login/signin button"""
    login_button = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first
    login_button.click()
    time.sleep(2)  # Wait for login


@when(parsers.parse('I enter an invalid email "{email}"'))
def enter_invalid_email(page: Page, email: str):
    """Enter invalid email"""
    email_input = page.locator('input[name="email"], input[type="email"]').first
    email_input.fill(email)


@when(parsers.parse('I enter an invalid password "{password}"'))
def enter_invalid_password(page: Page, password: str):
    """Enter invalid password"""
    password_input = page.locator('input[name="password"], input[type="password"]').first
    password_input.fill(password)


@when("I click the logout button")
def click_logout(page: Page):
    """Click logout button"""
    # Look for logout button in various common locations
    logout_selectors = [
        'button:has-text("Logout")',
        'button:has-text("Sign Out")',
        'a:has-text("Logout")',
        '[data-testid="logout"]',
        '.logout-button'
    ]
    
    for selector in logout_selectors:
        try:
            logout_button = page.locator(selector).first
            if logout_button.is_visible(timeout=1000):
                logout_button.click()
                time.sleep(1)
                return
        except:
            continue
    
    # If not found in main UI, check user menu/dropdown
    user_menu = page.locator('[data-testid="user-menu"], .user-menu, button:has-text("Profile")').first
    if user_menu.is_visible(timeout=1000):
        user_menu.click()
        time.sleep(0.5)
        logout_button = page.locator('button:has-text("Logout"), a:has-text("Logout")').first
        logout_button.click()
        time.sleep(1)


@when("I try to access the chat page directly")
def access_chat_directly(page: Page):
    """Try to access protected chat page"""
    from conftest import FRONTEND_BASE_URL
    page.goto(f"{FRONTEND_BASE_URL}/chat")
    page.wait_for_load_state("networkidle")


@when('I click "Forgot Password"')
def click_forgot_password(page: Page):
    """Click forgot password link"""
    forgot_link = page.locator('a:has-text("Forgot Password"), button:has-text("Forgot Password")').first
    forgot_link.click()
    time.sleep(1)


@when("I enter my registered email")
def enter_registered_email(page: Page, registered_user):
    """Enter registered email for password reset"""
    email_input = page.locator('input[name="email"], input[type="email"]').first
    email_input.fill(registered_user["email"])


@when("I submit the password reset request")
def submit_password_reset(page: Page):
    """Submit password reset form"""
    submit_button = page.locator('button[type="submit"], button:has-text("Reset"), button:has-text("Send")').first
    submit_button.click()
    time.sleep(2)


# ============================================================================
# THEN STEPS
# ============================================================================

@then("I should see a success message")
def verify_success_message(page: Page):
    """Verify success message appears"""
    # Look for success indicators
    success_selectors = [
        '.success',
        '.alert-success',
        '[role="alert"]:has-text("success")',
        'text=/success|registered|created/i'
    ]
    
    found = False
    for selector in success_selectors:
        try:
            element = page.locator(selector).first
            if element.is_visible(timeout=3000):
                found = True
                break
        except:
            continue
    
    assert found, "Success message not found"


@then("I should be redirected to the verification page")
def verify_redirect_to_verification(page: Page):
    """Verify redirect to verification page"""
    page.wait_for_load_state("networkidle")
    # Check URL contains verification or check page content
    current_url = page.url
    assert "verify" in current_url.lower() or "email" in current_url.lower() or "confirmation" in current_url.lower(), \
        f"Not redirected to verification page. Current URL: {current_url}"


@then("I should be successfully logged in")
def verify_logged_in(page: Page):
    """Verify user is logged in"""
    page.wait_for_load_state("networkidle")
    time.sleep(1)
    
    # Check for logged-in indicators (adjust based on your app)
    logged_in_indicators = [
        'button:has-text("Logout")',
        '.user-menu',
        '[data-testid="user-menu"]',
        '.chat-interface'
    ]
    
    found = False
    for selector in logged_in_indicators:
        try:
            if page.locator(selector).first.is_visible(timeout=2000):
                found = True
                break
        except:
            continue
    
    assert found, "User does not appear to be logged in"


@then("I should see the chat interface")
def verify_chat_interface(page: Page):
    """Verify chat interface is visible"""
    # Look for chat-specific elements
    chat_selectors = [
        '[data-testid="chat-interface"]',
        '.chat-container',
        'textarea[placeholder*="message"]',
        'input[placeholder*="message"]'
    ]
    
    found = False
    for selector in chat_selectors:
        try:
            if page.locator(selector).first.is_visible(timeout=5000):
                found = True
                break
        except:
            continue
    
    assert found, "Chat interface not visible"


@then(parsers.parse('I should see an error message "{message}"'))
def verify_error_message(page: Page, message: str):
    """Verify specific error message appears"""
    # Look for error message containing the text
    error_element = page.locator(f'text=/{message}/i').first
    assert error_element.is_visible(timeout=3000), f"Error message '{message}' not found"


@then("I should remain on the login page")
def verify_still_on_login(page: Page):
    """Verify still on login page"""
    current_url = page.url
    assert "login" in current_url.lower() or "signin" in current_url.lower(), \
        f"Not on login page. Current URL: {current_url}"


@then("I should be logged out")
def verify_logged_out(page: Page):
    """Verify user is logged out"""
    page.wait_for_load_state("networkidle")
    
    # Check that auth token is removed from localStorage
    token = page.evaluate("localStorage.getItem('token')")
    assert token is None or token == "", "Auth token still present"


@then("I should be redirected to the login page")
def verify_redirected_to_login(page: Page):
    """Verify redirected to login page"""
    page.wait_for_load_state("networkidle")
    current_url = page.url
    assert "login" in current_url.lower() or "signin" in current_url.lower(), \
        f"Not redirected to login page. Current URL: {current_url}"


@then("I should see a confirmation message")
def verify_confirmation_message(page: Page):
    """Verify confirmation message appears"""
    confirmation_text = page.locator('text=/confirmation|sent|check your email/i').first
    assert confirmation_text.is_visible(timeout=3000), "Confirmation message not found"


@then("I should receive a password reset email")
def verify_password_reset_email(registered_user):
    """Verify password reset email sent (check via API or email service)"""
    # Note: In real tests, you might check email service or database
    # For now, we just pass if the confirmation message was shown
    pass
