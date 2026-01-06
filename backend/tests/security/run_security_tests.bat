@echo off
REM Security test runner script for Windows

cd /d "%~dp0..\.."

echo.
echo ===================================================
echo   Chatbot Web - Security Test Suite
echo ===================================================
echo.

REM Check if pytest is installed
python -m pytest --version >nul 2>&1
if errorlevel 1 (
    echo Error: pytest is not installed
    echo Install with: pip install pytest
    exit /b 1
)

REM Parse command line arguments
set TEST_TYPE=%1
if "%TEST_TYPE%"=="" set TEST_TYPE=all

set VERBOSE=%2
if "%VERBOSE%"=="" set VERBOSE=-v

echo Test Type: %TEST_TYPE%
echo.

if "%TEST_TYPE%"=="all" (
    echo Running all security tests...
    python -m pytest tests/security/ %VERBOSE%
) else if "%TEST_TYPE%"=="auth" (
    echo Running authentication ^& authorization tests...
    python -m pytest tests/security/test_auth_security.py %VERBOSE%
) else if "%TEST_TYPE%"=="injection" (
    echo Running injection attack tests...
    python -m pytest tests/security/test_injection_attacks.py %VERBOSE%
) else if "%TEST_TYPE%"=="cors" (
    echo Running CORS/CSRF/Headers tests...
    python -m pytest tests/security/test_cors_csrf_headers.py %VERBOSE%
) else if "%TEST_TYPE%"=="validation" (
    echo Running data validation tests...
    python -m pytest tests/security/test_data_validation.py %VERBOSE%
) else if "%TEST_TYPE%"=="coverage" (
    echo Running tests with coverage report...
    python -m pytest tests/security/ --cov=. --cov-report=term-missing --cov-report=html
    echo Coverage report generated: htmlcov\index.html
) else if "%TEST_TYPE%"=="quick" (
    echo Running quick security tests...
    python -m pytest tests/security/ -x -q
) else (
    echo Unknown test type: %TEST_TYPE%
    echo.
    echo Usage: run_security_tests.bat [test_type] [verbose_flag]
    echo.
    echo Test Types:
    echo   all         - Run all security tests
    echo   auth        - Run authentication ^& authorization tests
    echo   injection   - Run injection attack tests
    echo   cors        - Run CORS/CSRF/Headers tests
    echo   validation  - Run data validation tests
    echo   coverage    - Run with coverage report
    echo   quick       - Run quick tests with minimal output
    echo.
    echo Verbose Flags:
    echo   -v          - Verbose output (default)
    echo   -vv         - Very verbose output
    echo   -q          - Quiet output
    exit /b 1
)

echo.
echo Security tests completed!
