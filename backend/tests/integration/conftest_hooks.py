"""
Integration Tests pytest configuration hooks
"""
import pytest
import os
from pathlib import Path


def pytest_configure(config):
    """Configure pytest before running tests"""
    # Register custom markers
    config.addinivalue_line(
        "markers", "integration: mark test as an integration test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow"
    )
    config.addinivalue_line(
        "markers", "database: mark test as requiring database"
    )


def pytest_collection_modifyitems(config, items):
    """Modify test collection"""
    for item in items:
        # Mark all tests in integration directory as integration tests
        if "integration" in str(item.fspath):
            item.add_marker(pytest.mark.integration)


# Custom session-scoped fixtures
@pytest.fixture(scope="session")
def integration_test_environment():
    """Set up test environment variables for all integration tests"""
    os.environ['TESTING'] = 'true'
    os.environ['JWT_SECRET'] = 'test_secret_key_for_integration_tests'
    os.environ['API_KEY_CREDITS'] = '{"test_key": 100, "integration": 500}'
    
    yield
    
    # Cleanup after all tests
    for key in ['TESTING', 'JWT_SECRET', 'API_KEY_CREDITS']:
        if key in os.environ:
            del os.environ[key]
