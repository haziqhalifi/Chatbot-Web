#!/bin/bash
# Security test runner script for Unix/Linux/macOS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Change to backend directory
cd "$(dirname "$0")/../.."

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Chatbot Web - Security Test Suite${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo -e "${RED}Error: pytest is not installed${NC}"
    echo "Install with: pip install pytest"
    exit 1
fi

# Parse command line arguments
TEST_TYPE=${1:-all}
VERBOSE=${2:--v}

echo -e "${YELLOW}Test Type: $TEST_TYPE${NC}"
echo ""

case $TEST_TYPE in
    all)
        echo -e "${BLUE}Running all security tests...${NC}"
        pytest tests/security/ $VERBOSE
        ;;
    auth)
        echo -e "${BLUE}Running authentication & authorization tests...${NC}"
        pytest tests/security/test_auth_security.py $VERBOSE
        ;;
    injection)
        echo -e "${BLUE}Running injection attack tests...${NC}"
        pytest tests/security/test_injection_attacks.py $VERBOSE
        ;;
    cors)
        echo -e "${BLUE}Running CORS/CSRF/Headers tests...${NC}"
        pytest tests/security/test_cors_csrf_headers.py $VERBOSE
        ;;
    validation)
        echo -e "${BLUE}Running data validation tests...${NC}"
        pytest tests/security/test_data_validation.py $VERBOSE
        ;;
    coverage)
        echo -e "${BLUE}Running tests with coverage report...${NC}"
        pytest tests/security/ --cov=. --cov-report=term-missing --cov-report=html
        echo -e "${GREEN}Coverage report generated: htmlcov/index.html${NC}"
        ;;
    quick)
        echo -e "${BLUE}Running quick security tests...${NC}"
        pytest tests/security/ -x -q
        ;;
    *)
        echo -e "${RED}Unknown test type: $TEST_TYPE${NC}"
        echo ""
        echo "Usage: $0 [test_type] [verbose_flag]"
        echo ""
        echo "Test Types:"
        echo "  all         - Run all security tests"
        echo "  auth        - Run authentication & authorization tests"
        echo "  injection   - Run injection attack tests"
        echo "  cors        - Run CORS/CSRF/Headers tests"
        echo "  validation  - Run data validation tests"
        echo "  coverage    - Run with coverage report"
        echo "  quick       - Run quick tests with minimal output"
        echo ""
        echo "Verbose Flags:"
        echo "  -v          - Verbose output (default)"
        echo "  -vv         - Very verbose output"
        echo "  -q          - Quiet output"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Security tests completed!${NC}"
