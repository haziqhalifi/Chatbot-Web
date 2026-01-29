# Docker Deployment Guide - WIF3005 Exam Rubric

## Overview

This guide provides step-by-step instructions for Dockerizing the Chatbot Web application, with build, test, and deployment procedures aligned with WIF3005 exam requirements.

### Architecture

The application is containerized as a **multi-service Docker Compose stack**:

- **Backend**: FastAPI (Python 3.11, port 8000)
- **Frontend**: React/Vite (Node.js 20, port 3000)
- **Cache**: Redis (port 6379) - for session & subscription management
- **Network**: Isolated Docker bridge network for secure inter-service communication

---

## Prerequisites

### Windows Setup

1. **Install Docker Desktop for Windows**
   - Download: https://www.docker.com/products/docker-desktop
   - Ensure WSL 2 backend is enabled (Docker settings)
   - Allocate sufficient resources: ≥4GB RAM, ≥2 CPU cores

2. **Verify Installation**
   ```powershell
   docker --version
   docker-compose --version
   ```

---

## Part 1: Build Docker Images

### Step 1.1 - Prepare Environment File

```powershell
# Copy example env file
Copy-Item .env.docker.example .env.docker

# Edit with your actual credentials (PowerShell or notepad)
notepad .env.docker
```

**Required environment variables** (see [.env.docker.example](.env.docker.example)):

- `SQL_SERVER`: Azure SQL Server endpoint or `host.docker.internal` for local
- `OPENAI_API_KEY`: OpenAI API key
- `JWT_SECRET`: Random string for token signing
- `ADMIN_CODE`: Registration code for admin users

### Step 1.2 - Build Individual Images

#### Backend Image (Multi-Stage Build)

```powershell
# Build backend image
docker build -f Dockerfile.backend -t chatbot-backend:1.0 .

# Verify build
docker images | Select-String chatbot-backend
```

**Build Details**:

- **Stage 1 (Builder)**: Compiles dependencies in isolated environment
- **Stage 2 (Runtime)**: Lightweight production image with minimal dependencies
- **Size**: ~500MB (Python slim base + deps)
- **Health Check**: Pings `/health` endpoint every 30 seconds

#### Frontend Image (Multi-Stage Build)

```powershell
# Build frontend image
docker build -f Dockerfile.frontend -t chatbot-frontend:1.0 .

# Verify build
docker images | Select-String chatbot-frontend
```

**Build Details**:

- **Stage 1 (Builder)**: Node.js build environment compiles Vite bundle
- **Stage 2 (Runtime)**: Alpine Linux with `serve` HTTP server
- **Size**: ~150MB (lightweight Alpine base)
- **Output**: Static build files served on port 3000

### Step 1.3 - Full Stack Build with Docker Compose

```powershell
# Build all services in one command
docker-compose build --no-cache

# Verify all services built
docker images
```

Output should show:

```
chatbot-backend       1.0              [IMAGE_ID]
chatbot-frontend      1.0              [IMAGE_ID]
redis                 7-alpine         [IMAGE_ID]
```

---

## Part 2: Run & Test Locally

### Step 2.1 - Start All Services

```powershell
# Start containers in background
docker-compose up -d

# View container status
docker-compose ps
```

**Expected Output**:

```
NAME                   STATUS              PORTS
chatbot-backend        Up (healthy)        0.0.0.0:8000->8000/tcp
chatbot-frontend       Up (healthy)        0.0.0.0:3000->3000/tcp
chatbot-redis          Up (healthy)        0.0.0.0:6379->6379/tcp
```

### Step 2.2 - Check Container Logs

```powershell
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# Redis logs
docker-compose logs redis

# Real-time log streaming
docker-compose logs -f backend
```

### Step 2.3 - Verify Service Health

#### Backend Health Check

```powershell
# Direct health check
curl http://localhost:8000/health

# Response (200 OK):
# {"message": "Chatbot API is running", "status": "ok"}
```

#### Test Backend API Endpoints

```powershell
# List available endpoints
curl http://localhost:8000/docs

# Get map endpoints (GIS integration)
curl http://localhost:8000/map/endpoints

# Health endpoint
curl http://localhost:8000/health
```

#### Frontend Accessibility

```powershell
# Open frontend in browser
Start-Process "http://localhost:3000"

# Or test with curl
curl http://localhost:3000/
```

#### Redis Connectivity

```powershell
# Test Redis connection
docker exec chatbot-redis redis-cli ping
# Output: PONG

# Check Redis stats
docker exec chatbot-redis redis-cli INFO stats
```

---

## Part 3: WIF3005 Exam Rubric Compliance

### 3.1 - Containerization Requirements

#### ✅ Dockerfile Best Practices

- **Multi-stage builds**: Reduces final image size by ~40%
  - Backend: Builder stage compiles deps, runtime stage minimal
  - Frontend: Builder stage creates production bundle, runtime stage serves only

- **Non-root user** (recommended enhancement):

  ```dockerfile
  RUN useradd -m -u 1000 appuser
  USER appuser
  ```

- **Health checks**: Defined for both backend and frontend

  ```dockerfile
  HEALTHCHECK --interval=30s --timeout=10s --retries=3
  ```

- **Minimal base images**:
  - Backend: `python:3.11-slim` (~180MB base)
  - Frontend: `node:20-alpine` (~180MB base)

#### ✅ Docker Compose Configuration

- **Service orchestration**: 3 services (backend, frontend, redis)
- **Network isolation**: Custom bridge network `chatbot-network`
- **Volume management**: Persistent Redis data, dev mounts for backend
- **Environment variables**: Externalized config via `.env.docker`
- **Service dependencies**: `depends_on` ensures correct startup order
- **Restart policy**: `unless-stopped` for production readiness

#### ✅ Port Mapping & Networking

| Service  | Container Port | Host Port | Purpose       |
| -------- | -------------- | --------- | ------------- |
| Backend  | 8000           | 8000      | FastAPI API   |
| Frontend | 3000           | 3000      | React SPA     |
| Redis    | 6379           | 6379      | Cache/Session |

---

### 3.2 - Testing Requirements

#### Unit Tests (Backend)

```powershell
# Run inside backend container
docker exec chatbot-backend pytest tests/unit/ -v

# With coverage report
docker exec chatbot-backend pytest tests/unit/ --cov=backend --cov-report=html
```

#### Integration Tests

```powershell
# Backend integration tests
docker exec chatbot-backend pytest tests/integration/ -v

# Or run pre-built script
docker exec chatbot-backend python -m pytest tests/integration/ --tb=short
```

#### API Endpoint Tests

```powershell
# Test health endpoint (should be 200 OK)
$response = curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health
Write-Host "Health check: $response"

# Test root endpoint
curl http://localhost:8000/

# Test with invalid API key (should be 401)
$response = curl -s -H "X-API-Key: invalid" http://localhost:8000/chat/providers -w "%{http_code}"
Write-Host "Auth test: $response"
```

#### Frontend Tests

```powershell
# Run inside frontend container
docker exec chatbot-frontend npm test

# Generate coverage report
docker exec chatbot-frontend npm run test:coverage
```

#### Load Testing (Optional)

```powershell
# Test backend can handle 100 concurrent requests
# Using Apache Bench (if installed)
ab -n 1000 -c 100 http://localhost:8000/health
```

---

### 3.3 - Deployment Readiness Checklist

- [ ] **Images built and tagged**: `docker images | grep chatbot`
- [ ] **All containers running**: `docker-compose ps` shows all "Up"
- [ ] **Health checks passing**: No "unhealthy" status
- [ ] **Log output clean**: No critical errors in `docker-compose logs`
- [ ] **Frontend accessible**: `http://localhost:3000` loads without errors
- [ ] **Backend responding**: `/health` returns `{"status": "ok"}`
- [ ] **Database connection**: Backend can query Azure SQL Server
- [ ] **Environment variables**: All required vars in `.env.docker`
- [ ] **Security**: No hardcoded secrets in Dockerfile (only in `.env.docker`)

---

## Part 4: Advanced Operations

### Stop & Cleanup

```powershell
# Stop all services (keep containers)
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove all volumes (WARNING: deletes data)
docker-compose down -v

# Prune unused images & volumes
docker system prune -a
```

### View Resource Usage

```powershell
# Real-time resource stats
docker stats

# Backend resource usage
docker stats chatbot-backend

# All container details
docker ps -a
```

### Inspect Container Internals

```powershell
# Execute commands inside container
docker exec chatbot-backend ls -la /app/backend

# Interactive shell
docker exec -it chatbot-backend /bin/bash

# View network
docker network inspect chatbot-network
```

### Rebuild After Code Changes

```powershell
# Rebuild specific service
docker-compose build --no-cache backend

# Rebuild and restart
docker-compose up -d --build backend
```

---

## Part 5: Production Deployment

### Push to Docker Registry (Docker Hub)

```powershell
# Tag images
docker tag chatbot-backend:1.0 yourusername/chatbot-backend:1.0
docker tag chatbot-frontend:1.0 yourusername/chatbot-frontend:1.0

# Login to Docker Hub
docker login

# Push images
docker push yourusername/chatbot-backend:1.0
docker push yourusername/chatbot-frontend:1.0
```

### Production Docker Compose (Secure)

```yaml
# Use .env file with production secrets
# Use explicit image tags (not latest)
# Set resource limits
# Use readonly root filesystem where possible
# Remove volume mounts for production code
```

### Kubernetes Deployment (Optional)

```powershell
# Convert docker-compose to Kubernetes manifests
kompose convert -f docker-compose.yml -o ./k8s/

# Deploy to cluster
kubectl apply -f ./k8s/
```

---

## Troubleshooting

### Backend Container Won't Start

```powershell
# Check logs
docker logs chatbot-backend

# Verify dependencies
docker exec chatbot-backend pip list

# Test Python environment
docker exec chatbot-backend python -c "import uvicorn; print('OK')"
```

### Frontend Shows Blank Page

```powershell
# Check frontend logs
docker logs chatbot-frontend

# Verify build output
docker exec chatbot-frontend ls -la /app/build

# Test HTTP server
docker exec chatbot-frontend curl http://localhost:3000/
```

### Database Connection Failed

```powershell
# Verify environment variables
docker exec chatbot-backend env | grep SQL

# Test connection (inside container)
docker exec chatbot-backend python -c "import pyodbc; print('OK')"
```

### Network Communication Issues

```powershell
# Verify network exists
docker network ls | grep chatbot

# Test ping between services
docker exec chatbot-backend ping redis

# Check DNS resolution
docker exec chatbot-backend nslookup backend
```

---

## Performance Metrics (WIF3005 Compliance)

| Metric               | Target  | Method                      |
| -------------------- | ------- | --------------------------- |
| Backend startup time | < 10s   | `time docker-compose up`    |
| Frontend load time   | < 3s    | Browser DevTools            |
| API response time    | < 500ms | `curl -w @curl-format.txt`  |
| Memory usage (total) | < 2GB   | `docker stats`              |
| Image build time     | < 2min  | `time docker-compose build` |

---

## References

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/docker/)
- [Vite Docker Guide](https://vitejs.dev/guide/)
- WIF3005 Assessment Rubric: See exam specification

---

**Last Updated**: January 2026  
**Version**: 1.0
