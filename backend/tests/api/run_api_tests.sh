#!/bin/bash
# API Test Runner - Shell Script for Unix/Linux/macOS
# Usage: ./run_api_tests.sh [command]

set -e

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

cd "$BACKEND_ROOT"

echo ""
echo "==============================================="
echo "API Test Suite Runner"
echo "==============================================="
echo ""

# Show help
show_help() {
    cat << EOF
API Test Runner Commands:

  all              Run all API tests
  auth             Run authentication tests only
  chat             Run chat endpoint tests only
  notifications    Run notification tests only
  admin            Run admin endpoint tests only
  smoke            Run smoke tests
  security         Run security-focused tests
  coverage         Run all tests with coverage report
  failed           Re-run only failed tests
  output           Run tests with full output
  parallel         Run tests in parallel
  html             Generate HTML report
  list             List all available tests
  validate         Validate test environment setup
  help             Show this help message

Examples:
  ./run_api_tests.sh all              # Run all tests
  ./run_api_tests.sh auth             # Run auth tests only
  ./run_api_tests.sh coverage         # Run with coverage report
  ./run_api_tests.sh validate         # Validate setup

EOF
}

# Default: show help if no argument
if [ "$#" -eq 0 ]; then
    show_help
    exit 0
fi

case "$1" in
    all)
        echo "Running all API tests..."
        python -m pytest tests/api/ -v
        ;;
    auth)
        echo "Running authentication tests..."
        python -m pytest tests/api/test_auth_endpoints.py -v
        ;;
    chat)
        echo "Running chat endpoint tests..."
        python -m pytest tests/api/test_chat_endpoints.py -v
        ;;
    notifications)
        echo "Running notification tests..."
        python -m pytest tests/api/test_notification_endpoints.py -v
        ;;
    admin)
        echo "Running admin endpoint tests..."
        python -m pytest tests/api/test_admin_endpoints.py -v
        ;;
    smoke)
        echo "Running smoke tests..."
        python -m pytest tests/api/ -m smoke -v
        ;;
    security)
        echo "Running security tests..."
        python -m pytest tests/api/ -m security -v
        ;;
    coverage)
        echo "Running tests with coverage report..."
        python -m pytest tests/api/ \
            --cov=. \
            --cov-report=html \
            --cov-report=term-missing \
            -v
        echo ""
        echo "Coverage report generated in htmlcov/index.html"
        ;;
    failed)
        echo "Re-running failed tests..."
        python -m pytest tests/api/ --lf -v
        ;;
    output)
        echo "Running tests with full output..."
        python -m pytest tests/api/ -v -s
        ;;
    parallel)
        echo "Running tests in parallel..."
        python -m pytest tests/api/ -n auto -v
        ;;
    html)
        echo "Generating HTML report..."
        python -m pytest tests/api/ \
            --html=tests/api/report.html \
            --self-contained-html \
            -v
        echo "Report generated in tests/api/report.html"
        ;;
    list)
        echo "Available tests:"
        python -m pytest tests/api/ --collect-only -q
        ;;
    validate)
        echo "Validating test environment..."
        python tests/api/run_api_tests.py --validate
        ;;
    help)
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

exit 0
