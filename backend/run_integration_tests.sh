#!/bin/bash
# Integration Test Runner for Backend
# Runs all integration tests with proper setup and reporting

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Backend Integration Test Suite ===${NC}"
echo ""

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo -e "${RED}Error: pytest is not installed${NC}"
    echo "Please install it with: pip install pytest pytest-asyncio pytest-cov"
    exit 1
fi

# Set Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Run tests
echo -e "${YELLOW}Running integration tests...${NC}"
python -m pytest tests/integration/ \
    -v \
    --tb=short \
    --cov=services \
    --cov=routes \
    --cov=database \
    --cov-report=term-missing \
    --cov-report=html:coverage_integration \
    -x

TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ All integration tests passed!${NC}"
    echo -e "${GREEN}Coverage report generated: coverage_integration/index.html${NC}"
else
    echo ""
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi

exit $TEST_EXIT_CODE
