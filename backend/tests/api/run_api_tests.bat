@echo off
REM API Test Runner - Windows Batch Script
REM Usage: run_api_tests.bat [command]

setlocal enabledelayedexpansion

cd /d "%~dp0..\.."

echo.
echo ===============================================
echo API Test Suite Runner
echo ===============================================
echo.

if "%1"=="" (
    echo Usage: run_api_tests.bat [command]
    echo.
    echo Commands:
    echo   all              Run all API tests
    echo   auth             Run authentication tests
    echo   chat             Run chat endpoint tests
    echo   notifications    Run notification tests
    echo   admin            Run admin endpoint tests
    echo   smoke            Run smoke tests
    echo   security         Run security tests
    echo   coverage         Run with coverage report
    echo   failed           Re-run failed tests
    echo   list             List all tests
    echo   validate         Validate test setup
    echo   help             Show this help message
    echo.
    goto :end
)

if "%1"=="help" (
    echo API Test Runner Commands:
    echo.
    echo   all              Run all API tests
    echo   auth             Run authentication tests only
    echo   chat             Run chat endpoint tests only
    echo   notifications    Run notification tests only
    echo   admin            Run admin endpoint tests only
    echo   smoke            Run smoke tests
    echo   security         Run security-focused tests
    echo   coverage         Run all tests with coverage report
    echo   failed           Re-run only failed tests
    echo   list             List all available tests
    echo   validate         Validate test environment setup
    echo   help             Show this help message
    echo.
    goto :end
)

if "%1"=="all" (
    python -m pytest tests/api/ -v
    goto :end
)

if "%1"=="auth" (
    python -m pytest tests/api/test_auth_endpoints.py -v
    goto :end
)

if "%1"=="chat" (
    python -m pytest tests/api/test_chat_endpoints.py -v
    goto :end
)

if "%1"=="notifications" (
    python -m pytest tests/api/test_notification_endpoints.py -v
    goto :end
)

if "%1"=="admin" (
    python -m pytest tests/api/test_admin_endpoints.py -v
    goto :end
)

if "%1"=="smoke" (
    python -m pytest tests/api/ -m smoke -v
    goto :end
)

if "%1"=="security" (
    python -m pytest tests/api/ -m security -v
    goto :end
)

if "%1"=="coverage" (
    python -m pytest tests/api/ --cov=. --cov-report=html --cov-report=term-missing -v
    echo.
    echo Coverage report generated in htmlcov/index.html
    goto :end
)

if "%1"=="failed" (
    python -m pytest tests/api/ --lf -v
    goto :end
)

if "%1"=="list" (
    python -m pytest tests/api/ --collect-only -q
    goto :end
)

if "%1"=="validate" (
    python tests/api/run_api_tests.py --validate
    goto :end
)

echo Unknown command: %1
echo Use 'run_api_tests.bat help' for available commands

:end
endlocal
