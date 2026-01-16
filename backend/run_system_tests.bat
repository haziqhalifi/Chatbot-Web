@echo off
REM System/E2E Test Runner for Backend (Windows)
REM Runs end-to-end tests with browser automation

setlocal enabledelayedexpansion

echo =============== System/E2E Test Suite ===============
echo.

REM Check if in backend directory
if not exist "tests\system" (
    echo Error: Please run this script from the backend directory
    exit /b 1
)

REM Check if pytest-bdd is installed
python -c "import pytest_bdd" >nul 2>&1
if errorlevel 1 (
    echo Error: pytest-bdd is not installed
    echo Installing system test dependencies...
    pip install -r tests\system\requirements.txt
    if errorlevel 1 (
        echo Failed to install dependencies
        exit /b 1
    )
)

REM Check if Playwright browsers are installed
python -c "from playwright.sync_api import sync_playwright" >nul 2>&1
if errorlevel 1 (
    echo Error: Playwright is not installed
    echo Installing Playwright...
    pip install playwright
    playwright install chromium
    if errorlevel 1 (
        echo Failed to install Playwright
        exit /b 1
    )
)

REM Set environment variables
if "%API_BASE_URL%"=="" set API_BASE_URL=http://127.0.0.1:8000
if "%FRONTEND_BASE_URL%"=="" set FRONTEND_BASE_URL=http://localhost:4028
if "%HEADLESS%"=="" set HEADLESS=true

echo Configuration:
echo   API URL: %API_BASE_URL%
echo   Frontend URL: %FRONTEND_BASE_URL%
echo   Headless: %HEADLESS%
echo.

REM Check if backend is running
curl -s %API_BASE_URL%/health >nul 2>&1
if errorlevel 1 (
    echo.
    echo ⚠️  WARNING: Backend API is not responding at %API_BASE_URL%
    echo    Please ensure the backend server is running before tests.
    echo.
    set /p continue="Continue anyway? (y/N): "
    if /i not "!continue!"=="y" (
        echo Test execution cancelled.
        exit /b 1
    )
)

REM Check if frontend is running
curl -s %FRONTEND_BASE_URL% >nul 2>&1
if errorlevel 1 (
    echo.
    echo ⚠️  WARNING: Frontend is not responding at %FRONTEND_BASE_URL%
    echo    Please ensure the frontend dev server is running.
    echo.
    set /p continue="Continue anyway? (y/N): "
    if /i not "!continue!"=="y" (
        echo Test execution cancelled.
        exit /b 1
    )
)

echo.
echo Running system/E2E tests...
echo.

REM Run pytest with system tests
python -m pytest tests/system/ ^
    -v ^
    --tb=short ^
    --strict-markers ^
    --capture=no ^
    -W ignore::DeprecationWarning

if errorlevel 1 (
    echo.
    echo ❌ Some tests failed
    echo.
    echo Screenshots saved to: tests\system\screenshots\
    exit /b 1
) else (
    echo.
    echo ✅ All system tests passed!
    exit /b 0
)
