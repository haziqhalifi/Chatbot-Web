@echo off
REM Integration Test Runner for Backend (Windows)
REM Runs all integration tests with proper setup and reporting

setlocal enabledelayedexpansion

echo =============== Backend Integration Test Suite ===============
echo.

REM Check if pytest is installed
python -m pytest --version >nul 2>&1
if errorlevel 1 (
    echo Error: pytest is not installed
    echo Please install it with: pip install pytest pytest-asyncio pytest-cov
    exit /b 1
)

REM Set Python path
set PYTHONPATH=%PYTHONPATH%;%CD%

echo Running integration tests...
python -m pytest tests/integration/ ^
    -v ^
    --tb=short ^
    --cov=services ^
    --cov=routes ^
    --cov=database ^
    --cov-report=term-missing ^
    --cov-report=html:coverage_integration ^
    -x

if errorlevel 1 (
    echo.
    echo X Some tests failed
    exit /b 1
) else (
    echo.
    echo All integration tests passed!
    echo Coverage report generated: coverage_integration/index.html
    exit /b 0
)
