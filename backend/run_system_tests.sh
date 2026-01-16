#!/bin/bash
# System/E2E Test Runner for Backend (Linux/Mac)
# Runs end-to-end tests with browser automation

echo "=============== System/E2E Test Suite ==============="
echo ""

# Check if in backend directory
if [ ! -d "tests/system" ]; then
    echo "Error: Please run this script from the backend directory"
    exit 1
fi

# Check if pytest-bdd is installed
python -c "import pytest_bdd" >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Error: pytest-bdd is not installed"
    echo "Installing system test dependencies..."
    pip install -r tests/system/requirements.txt
    if [ $? -ne 0 ]; then
        echo "Failed to install dependencies"
        exit 1
    fi
fi

# Check if Playwright browsers are installed
python -c "from playwright.sync_api import sync_playwright" >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Error: Playwright is not installed"
    echo "Installing Playwright..."
    pip install playwright
    playwright install chromium
    if [ $? -ne 0 ]; then
        echo "Failed to install Playwright"
        exit 1
    fi
fi

# Set environment variables
export API_BASE_URL=${API_BASE_URL:-http://127.0.0.1:8000}
export FRONTEND_BASE_URL=${FRONTEND_BASE_URL:-http://localhost:4028}
export HEADLESS=${HEADLESS:-true}

echo "Configuration:"
echo "  API URL: $API_BASE_URL"
echo "  Frontend URL: $FRONTEND_BASE_URL"
echo "  Headless: $HEADLESS"
echo ""

# Check if backend is running
curl -s "$API_BASE_URL/health" >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  WARNING: Backend API is not responding at $API_BASE_URL"
    echo "   Please ensure the backend server is running before tests."
    echo ""
    read -p "Continue anyway? (y/N): " continue
    if [ "$continue" != "y" ] && [ "$continue" != "Y" ]; then
        echo "Test execution cancelled."
        exit 1
    fi
fi

# Check if frontend is running
curl -s "$FRONTEND_BASE_URL" >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  WARNING: Frontend is not responding at $FRONTEND_BASE_URL"
    echo "   Please ensure the frontend dev server is running."
    echo ""
    read -p "Continue anyway? (y/N): " continue
    if [ "$continue" != "y" ] && [ "$continue" != "Y" ]; then
        echo "Test execution cancelled."
        exit 1
    fi
fi

echo ""
echo "Running system/E2E tests..."
echo ""

# Run pytest with system tests
python -m pytest tests/system/ \
    -v \
    --tb=short \
    --strict-markers \
    --capture=no \
    -W ignore::DeprecationWarning

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Some tests failed"
    echo ""
    echo "Screenshots saved to: tests/system/screenshots/"
    exit 1
else
    echo ""
    echo "✅ All system tests passed!"
    exit 0
fi
