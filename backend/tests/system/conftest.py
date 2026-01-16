"""
System/E2E Test Configuration and Fixtures
Provides browser automation, API clients, and test data setup
"""
import pytest
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, Page, Browser, BrowserContext
import requests
from typing import Generator, Dict, Any
import json

# Add backend to path
backend_path = str(Path(__file__).parent.parent.parent)
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from config.settings import JWT_SECRET, JWT_ALGORITHM


# ============================================================================
# CONFIGURATION
# ============================================================================

# Backend API configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://127.0.0.1:8000")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:4028")

# Browser configuration
HEADLESS = os.getenv("HEADLESS", "true").lower() == "true"
BROWSER_TYPE = os.getenv("BROWSER", "chromium")  # chromium, firefox, webkit


# ============================================================================
# BROWSER FIXTURES
# ============================================================================

@pytest.fixture(scope="session")
def browser() -> Generator[Browser, None, None]:
    """Provide a browser instance for the entire test session"""
    with sync_playwright() as playwright:
        if BROWSER_TYPE == "firefox":
            browser = playwright.firefox.launch(headless=HEADLESS)
        elif BROWSER_TYPE == "webkit":
            browser = playwright.webkit.launch(headless=HEADLESS)
        else:
            browser = playwright.chromium.launch(headless=HEADLESS)
        
        yield browser
        browser.close()


@pytest.fixture
def context(browser: Browser) -> Generator[BrowserContext, None, None]:
    """Provide a new browser context for each test (isolated cookies/storage)"""
    context = browser.new_context(
        viewport={"width": 1920, "height": 1080},
        accept_downloads=True,
        ignore_https_errors=True
    )
    yield context
    context.close()


@pytest.fixture
def page(context: BrowserContext) -> Generator[Page, None, None]:
    """Provide a new page for each test"""
    page = context.new_page()
    yield page
    page.close()


# ============================================================================
# API CLIENT FIXTURES
# ============================================================================

@pytest.fixture
def api_client():
    """Provide an API client for backend requests"""
    class APIClient:
        def __init__(self):
            self.base_url = API_BASE_URL
            self.session = requests.Session()
            self.session.headers.update({
                "Content-Type": "application/json",
                "x-api-key": "secretkey"  # From api.js
            })
            self.token = None
        
        def set_auth_token(self, token: str):
            """Set authentication token"""
            self.token = token
            self.session.headers.update({
                "Authorization": f"Bearer {token}"
            })
        
        def post(self, endpoint: str, json_data: Dict[Any, Any] = None) -> requests.Response:
            """POST request to API"""
            url = f"{self.base_url}{endpoint}"
            return self.session.post(url, json=json_data)
        
        def get(self, endpoint: str, params: Dict[Any, Any] = None) -> requests.Response:
            """GET request to API"""
            url = f"{self.base_url}{endpoint}"
            return self.session.get(url, params=params)
        
        def put(self, endpoint: str, json_data: Dict[Any, Any] = None) -> requests.Response:
            """PUT request to API"""
            url = f"{self.base_url}{endpoint}"
            return self.session.put(url, json=json_data)
        
        def delete(self, endpoint: str) -> requests.Response:
            """DELETE request to API"""
            url = f"{self.base_url}{endpoint}"
            return self.session.delete(url)
    
    return APIClient()


# ============================================================================
# TEST DATA FIXTURES
# ============================================================================

@pytest.fixture
def test_user_credentials():
    """Provide test user credentials"""
    return {
        "email": f"test_e2e_{os.getpid()}@example.com",
        "password": "TestPassword123!",
        "name": "E2E Test User",
        "phone_number": "+60123456789"
    }


@pytest.fixture
def admin_credentials():
    """Provide admin credentials (requires ADMIN_CODE from env)"""
    return {
        "email": f"admin_e2e_{os.getpid()}@example.com",
        "password": "AdminPassword123!",
        "name": "E2E Admin User",
        "phone_number": "+60123456789",
        "admin_code": os.getenv("ADMIN_CODE", "admin123")
    }


# ============================================================================
# HELPER FIXTURES
# ============================================================================

@pytest.fixture
def registered_user(api_client, test_user_credentials):
    """Register a user via API and return credentials + token"""
    # Register user
    response = api_client.post("/signup", json_data=test_user_credentials)
    
    if response.status_code == 201 or response.status_code == 200:
        # For systems with email verification, you might need to bypass it
        # or handle verification in test setup
        
        # Sign in to get token
        signin_response = api_client.post("/signin", json_data={
            "email": test_user_credentials["email"],
            "password": test_user_credentials["password"]
        })
        
        if signin_response.status_code == 200:
            data = signin_response.json()
            token = data.get("token")
            api_client.set_auth_token(token)
            
            return {
                **test_user_credentials,
                "token": token,
                "user_id": data.get("user_id")
            }
    
    # If registration fails (user might already exist), try to sign in
    signin_response = api_client.post("/signin", json_data={
        "email": test_user_credentials["email"],
        "password": test_user_credentials["password"]
    })
    
    if signin_response.status_code == 200:
        data = signin_response.json()
        token = data.get("token")
        api_client.set_auth_token(token)
        
        return {
            **test_user_credentials,
            "token": token,
            "user_id": data.get("user_id")
        }
    
    raise Exception(f"Failed to register/login user: {response.text}")


@pytest.fixture
def authenticated_page(page: Page, registered_user):
    """Provide a page with authenticated user (token in localStorage)"""
    # Navigate to frontend
    page.goto(FRONTEND_BASE_URL)
    
    # Inject auth token into localStorage
    page.evaluate(f"""
        localStorage.setItem('token', '{registered_user['token']}');
        localStorage.setItem('user', JSON.stringify({{
            id: {registered_user.get('user_id', 1)},
            email: '{registered_user['email']}',
            name: '{registered_user['name']}'
        }}));
    """)
    
    # Reload to apply auth state
    page.reload()
    
    return page


# ============================================================================
# PYTEST HOOKS - ERROR HANDLING
# ============================================================================

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Capture screenshots on test failure"""
    outcome = yield
    report = outcome.get_result()
    
    if report.when == "call" and report.failed:
        # Check if test has access to page fixture
        if 'page' in item.fixturenames:
            try:
                page = item.funcargs.get('page')
                if page:
                    screenshot_dir = Path(__file__).parent / "screenshots"
                    screenshot_dir.mkdir(exist_ok=True)
                    
                    test_name = item.nodeid.replace("::", "_").replace("/", "_")
                    screenshot_path = screenshot_dir / f"error_{test_name}.png"
                    page.screenshot(path=str(screenshot_path))
                    print(f"\n📸 Screenshot saved: {screenshot_path}")
            except Exception as e:
                print(f"Failed to capture screenshot: {e}")
