@echo off
REM Docker Build & Test Script for WIF3005 Exam (Windows Batch Version)
REM Purpose: Quick build, test, and deployment verification

setlocal enabledelayedexpansion

set TAG=1.0
set COMMAND=%1

if "%COMMAND%"=="" set COMMAND=full

echo.
echo ========================================
echo Docker Build ^& Test Script - WIF3005
echo ========================================
echo Command: %COMMAND%
echo Tag: %TAG%
echo.

REM Check Docker installation
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker not found. Please install Docker Desktop.
    exit /b 1
)
echo [OK] Docker is installed

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose not found.
    exit /b 1
)
echo [OK] Docker Compose is installed
echo.

REM Execute command
if "%COMMAND%"=="build" goto BUILD
if "%COMMAND%"=="run" goto RUN
if "%COMMAND%"=="test" goto TEST
if "%COMMAND%"=="stop" goto STOP
if "%COMMAND%"=="clean" goto CLEAN
if "%COMMAND%"=="full" goto FULL
if "%COMMAND%"=="help" goto HELP
echo [ERROR] Unknown command: %COMMAND%
goto HELP

:BUILD
echo.
echo === Building Docker Images ===
echo.
echo Building backend image...
docker build -f Dockerfile.backend -t chatbot-backend:%TAG% .
if errorlevel 1 (
    echo [ERROR] Backend build failed
    exit /b 1
)
echo [OK] Backend image built

echo.
echo Building frontend image...
docker build -f Dockerfile.frontend -t chatbot-frontend:%TAG% .
if errorlevel 1 (
    echo [ERROR] Frontend build failed
    exit /b 1
)
echo [OK] Frontend image built

echo.
echo Verifying images...
docker images | findstr "chatbot-"
goto END

:RUN
echo.
echo === Starting Docker Compose Stack ===
echo.
docker-compose up -d
echo.
timeout /t 5 /nobreak
echo.
echo === Service Status ===
docker-compose ps
goto END

:TEST
echo.
echo === Running Integration Tests ===
echo.

echo Test 1: Backend Health Check...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:8000/health
echo.

echo Test 2: Backend Root Endpoint...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:8000/
echo.

echo Test 3: Frontend Accessibility...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:3000/
echo.

echo Test 4: Redis Connectivity...
docker exec chatbot-redis redis-cli ping
echo.

echo Test 5: Container Status...
docker-compose ps
echo.

echo Test 6: Checking Logs for Errors...
docker-compose logs | findstr "ERROR CRITICAL"
if errorlevel 1 (
    echo [OK] No critical errors found
)
echo.

goto END

:STOP
echo.
echo === Stopping Services ===
echo.
docker-compose stop
echo [OK] Services stopped
goto END

:CLEAN
echo.
echo === Cleaning Docker Environment ===
echo.
echo WARNING: This will remove containers and volumes!
set /p CONFIRM="Continue? (y/n): "
if /i "%CONFIRM%"=="y" (
    docker-compose down -v
    echo [OK] Environment cleaned
) else (
    echo Cleanup cancelled
)
goto END

:FULL
echo.
echo === FULL BUILD AND TEST ===
echo.

echo Step 1: Building Images...
call :BUILD_INTERNAL
if errorlevel 1 exit /b 1

echo.
echo Step 2: Starting Services...
docker-compose up -d
timeout /t 5 /nobreak

echo.
echo Step 3: Running Tests...
call :TEST_INTERNAL

echo.
echo === Build and Test Complete ===
goto END

:BUILD_INTERNAL
docker build -f Dockerfile.backend -t chatbot-backend:%TAG% .
if errorlevel 1 exit /b 1

docker build -f Dockerfile.frontend -t chatbot-frontend:%TAG% .
if errorlevel 1 exit /b 1

docker images | findstr "chatbot-"
exit /b 0

:TEST_INTERNAL
echo.
echo Running health check on backend...
curl -s http://localhost:8000/health
echo.

echo Checking service status...
docker-compose ps

exit /b 0

:HELP
echo.
echo Docker Build ^& Test Script - Chatbot Web (WIF3005)
echo.
echo USAGE:
echo   build-docker.bat [command]
echo.
echo COMMANDS:
echo   build   - Build Docker images only
echo   run     - Start services (docker-compose up)
echo   test    - Run integration tests
echo   stop    - Stop services
echo   clean   - Remove containers and volumes
echo   full    - Build, run, and test (default)
echo   help    - Show this help message
echo.
echo EXAMPLES:
echo   build-docker.bat full
echo   build-docker.bat build
echo   build-docker.bat test
echo   build-docker.bat stop
echo.
echo REQUIREMENTS:
echo   - Docker Desktop installed and running
echo   - Ports 8000, 3000, 6379 available
echo.
echo SEE ALSO:
echo   DOCKER_DEPLOYMENT_GUIDE.md - Comprehensive guide
echo.
goto END

:END
echo.
echo Done.
echo.
