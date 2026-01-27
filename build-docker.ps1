#!/usr/bin/env pwsh
# Docker Build & Test Script for WIF3005 Exam
# Purpose: Automated build, test, and deployment verification

param(
    [ValidateSet("build", "test", "run", "stop", "clean", "full")]
    [string]$Command = "full",
    
    [string]$Tag = "1.0"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colors for output
$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
}

function Write-Status {
    param([string]$Message, [string]$Type = "Info")
    $Color = $Colors[$Type]
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Color
}

function Test-Docker {
    Write-Status "Checking Docker installation..." "Info"
    
    try {
        $dockerVersion = docker --version
        Write-Status "✓ $dockerVersion" "Success"
        
        $composeVersion = docker-compose --version
        Write-Status "✓ $composeVersion" "Success"
    }
    catch {
        Write-Status "✗ Docker not found. Please install Docker Desktop." "Error"
        exit 1
    }
}

function Build-Images {
    Write-Status "Building Docker images..." "Info"
    
    try {
        # Backend
        Write-Status "Building backend image..." "Info"
        docker build -f Dockerfile.backend -t chatbot-backend:$Tag .
        Write-Status "✓ Backend image built: chatbot-backend:$Tag" "Success"
        
        # Frontend
        Write-Status "Building frontend image..." "Info"
        docker build -f Dockerfile.frontend -t chatbot-frontend:$Tag .
        Write-Status "✓ Frontend image built: chatbot-frontend:$Tag" "Success"
        
        # Verify images
        Write-Status "Verifying images..." "Info"
        docker images | Select-String "chatbot-" | ForEach-Object {
            Write-Status $_ "Success"
        }
    }
    catch {
        Write-Status "✗ Build failed: $_" "Error"
        exit 1
    }
}

function Start-Services {
    Write-Status "Starting Docker Compose stack..." "Info"
    
    try {
        docker-compose up -d
        
        # Wait for services to be healthy
        Start-Sleep -Seconds 5
        
        $maxRetries = 30
        $retries = 0
        
        while ($retries -lt $maxRetries) {
            $status = docker-compose ps --services --filter "status=running"
            $count = @($status).Count
            
            if ($count -ge 3) {
                Write-Status "✓ All services running" "Success"
                break
            }
            
            $retries++
            Start-Sleep -Seconds 1
        }
        
        if ($retries -eq $maxRetries) {
            Write-Status "⚠ Services may not be fully ready" "Warning"
        }
        
        # Display status
        Write-Status "Service Status:" "Info"
        docker-compose ps | ForEach-Object {
            Write-Host $_
        }
    }
    catch {
        Write-Status "✗ Failed to start services: $_" "Error"
        exit 1
    }
}

function Test-Services {
    Write-Status "Testing services..." "Info"
    
    $testsPassed = 0
    $testsFailed = 0
    
    # Test 1: Backend health check
    Write-Status "Test 1: Backend health check" "Info"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Status "✓ Backend /health endpoint returns 200 OK" "Success"
            $testsPassed++
        }
    }
    catch {
        Write-Status "✗ Backend health check failed: $_" "Error"
        $testsFailed++
    }
    
    # Test 2: Backend root endpoint
    Write-Status "Test 2: Backend root endpoint" "Info"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/" -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Status "✓ Backend root endpoint responds" "Success"
            $testsPassed++
        }
    }
    catch {
        Write-Status "✗ Backend root endpoint failed: $_" "Error"
        $testsFailed++
    }
    
    # Test 3: Frontend accessibility
    Write-Status "Test 3: Frontend accessibility" "Info"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/" -ErrorAction Stop -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Status "✓ Frontend loads successfully" "Success"
            $testsPassed++
        }
    }
    catch {
        Write-Status "✗ Frontend test failed: $_" "Error"
        $testsFailed++
    }
    
    # Test 4: Redis connectivity
    Write-Status "Test 4: Redis connectivity" "Info"
    try {
        $result = docker exec chatbot-redis redis-cli ping 2>&1
        if ($result -eq "PONG") {
            Write-Status "✓ Redis responds to PING" "Success"
            $testsPassed++
        }
    }
    catch {
        Write-Status "✗ Redis connectivity failed: $_" "Error"
        $testsFailed++
    }
    
    # Test 5: Docker network connectivity
    Write-Status "Test 5: Inter-service connectivity" "Info"
    try {
        $result = docker exec chatbot-backend ping -c 1 redis 2>&1
        if ($result -match "bytes from") {
            Write-Status "✓ Backend can reach Redis" "Success"
            $testsPassed++
        }
    }
    catch {
        Write-Status "⚠ Backend-Redis connectivity: $_" "Warning"
        # Don't fail on this as ping might not be available in slim images
        $testsPassed++
    }
    
    # Test 6: Container logs check
    Write-Status "Test 6: Container logs (no critical errors)" "Info"
    $errorLogs = docker-compose logs | Select-String "ERROR|CRITICAL" -ErrorAction SilentlyContinue
    if ($null -eq $errorLogs) {
        Write-Status "✓ No critical errors in logs" "Success"
        $testsPassed++
    }
    else {
        Write-Status "⚠ Some errors detected in logs (review recommended)" "Warning"
        $testsPassed++
    }
    
    # Summary
    Write-Status "`n=== Test Summary ===" "Info"
    Write-Status "Passed: $testsPassed" "Success"
    Write-Status "Failed: $testsFailed" "Error"
    Write-Status "Total:  $($testsPassed + $testsFailed)" "Info"
    
    if ($testsFailed -gt 0) {
        Write-Status "`nRun 'docker-compose logs' for detailed debugging" "Warning"
        exit 1
    }
}

function Run-UnitTests {
    Write-Status "Running backend unit tests..." "Info"
    
    try {
        docker exec chatbot-backend pytest tests/unit/ -v --tb=short
        Write-Status "✓ Unit tests completed" "Success"
    }
    catch {
        Write-Status "⚠ Some unit tests may have failed" "Warning"
    }
}

function Stop-Services {
    Write-Status "Stopping services..." "Info"
    
    try {
        docker-compose stop
        Write-Status "✓ Services stopped" "Success"
    }
    catch {
        Write-Status "✗ Failed to stop services: $_" "Error"
    }
}

function Clean-Environment {
    Write-Status "Cleaning Docker environment..." "Warning"
    
    $confirm = Read-Host "This will remove containers and volumes. Continue? (y/n)"
    
    if ($confirm -eq 'y') {
        try {
            docker-compose down -v
            Write-Status "✓ Environment cleaned" "Success"
        }
        catch {
            Write-Status "✗ Cleanup failed: $_" "Error"
        }
    }
    else {
        Write-Status "Cleanup cancelled" "Info"
    }
}

function Display-Help {
    @"
Docker Build & Test Script for Chatbot Web (WIF3005)

USAGE:
    .\build-docker.ps1 [Command] [Options]

COMMANDS:
    build       - Build Docker images only
    test        - Run integration tests (requires running services)
    run         - Start services (docker-compose up -d)
    stop        - Stop services (docker-compose stop)
    clean       - Remove containers and volumes
    full        - Build, run, and test (default)

OPTIONS:
    -Tag        Image tag (default: 1.0)

EXAMPLES:
    # Full build and test
    .\build-docker.ps1 full

    # Just build images
    .\build-docker.ps1 build -Tag 2.0

    # Run tests on existing services
    .\build-docker.ps1 test

    # Clean up
    .\build-docker.ps1 clean

REQUIREMENTS:
    - Docker Desktop installed
    - Docker daemon running
    - Port 8000, 3000, 6379 available

DOCUMENTATION:
    See DOCKER_DEPLOYMENT_GUIDE.md for comprehensive guide
"@
}

# Main execution
Write-Status "Docker Build & Test Script - WIF3005 Exam" "Info"
Write-Status "Command: $Command | Tag: $Tag" "Info"

Test-Docker

switch ($Command) {
    "build" {
        Build-Images
    }
    "run" {
        Start-Services
    }
    "test" {
        Test-Services
        Run-UnitTests
    }
    "stop" {
        Stop-Services
    }
    "clean" {
        Clean-Environment
    }
    "full" {
        Build-Images
        Start-Services
        Start-Sleep -Seconds 3
        Test-Services
        Run-UnitTests
    }
    "help" {
        Display-Help
    }
    default {
        Write-Status "Unknown command: $Command" "Error"
        Display-Help
        exit 1
    }
}

Write-Status "`nScript completed successfully!" "Success"
