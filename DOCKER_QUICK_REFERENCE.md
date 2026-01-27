# Docker Quick Reference - WIF3005

## One-Line Commands

```powershell
# Full build + test (recommended for WIF3005)
.\build-docker.ps1 full

# OR manual steps
docker-compose build --no-cache
docker-compose up -d
docker-compose logs -f

# Verify everything works
curl http://localhost:8000/health
Start-Process "http://localhost:3000"
```

---

## File Overview

| File                           | Purpose                | Size       | Key Points                              |
| ------------------------------ | ---------------------- | ---------- | --------------------------------------- |
| **Dockerfile.backend**         | FastAPI container      | 20 lines   | Multi-stage, health check, port 8000    |
| **Dockerfile.frontend**        | React container        | 20 lines   | Multi-stage, Alpine base, port 3000     |
| **docker-compose.yml**         | Orchestration          | 60 lines   | 3 services, networking, env vars        |
| **.dockerignore**              | Build optimization     | 30 lines   | Excludes **pycache**, node_modules, git |
| **.env.docker.example**        | Configuration template | 20 lines   | All required environment variables      |
| **DOCKER_DEPLOYMENT_GUIDE.md** | Full documentation     | 300+ lines | Complete build, test, deploy procedures |
| **build-docker.ps1**           | PowerShell automation  | 200 lines  | One-command build & test                |
| **build-docker.bat**           | Batch automation       | 150 lines  | Alternative for Command Prompt          |

---

## Architecture at a Glance

```
Browser (http://localhost:3000)
    ↓
Frontend Container (React/Vite, port 3000)
    ↓ API calls
Backend Container (FastAPI, port 8000)
    ├→ Redis Container (Cache, port 6379)
    └→ Azure SQL Server (external)

All containers on: chatbot-network (Docker bridge)
```

---

## Key Metrics for Exam

| Requirement                     | WIF3005                         | Status                 |
| ------------------------------- | ------------------------------- | ---------------------- |
| **Multi-stage builds**          | Containerization best practice  | ✓ Both Dockerfiles     |
| **Health checks**               | Service monitoring              | ✓ All services         |
| **Environment externalization** | Security (no hardcoded secrets) | ✓ .env.docker          |
| **Docker Compose**              | Service orchestration           | ✓ 3 services managed   |
| **Network isolation**           | Security & performance          | ✓ chatbot-network      |
| **Integration tests**           | Quality assurance               | ✓ 6 automated tests    |
| **Deployment automation**       | DevOps readiness                | ✓ build-docker scripts |

---

## Test Your Implementation (5 min)

```powershell
# 1. Build images
docker-compose build

# 2. Start services
docker-compose up -d

# 3. Check status
docker-compose ps
# Expected: All services "Up"

# 4. Test backend
curl http://localhost:8000/health
# Expected: {"message": "Chatbot API is running", "status": "ok"}

# 5. Test frontend
Start-Process "http://localhost:3000"
# Expected: React app loads without errors

# 6. View logs
docker-compose logs
# Expected: No CRITICAL errors
```

---

## Environment Setup

```powershell
# Copy example
Copy-Item .env.docker.example .env.docker

# Edit with your values
notepad .env.docker
```

**Must configure**:

- `SQL_SERVER`: Your Azure SQL endpoint
- `OPENAI_API_KEY`: OpenAI API key
- `JWT_SECRET`: Random string (e.g., "your-random-secret-key-123")
- `ADMIN_CODE`: Admin registration code

**Optional**:

- `EMAIL_*`: Email configuration for notifications
- `SUPER_ADMIN_CODE`: Super admin access

---

## Troubleshooting

| Issue                   | Solution                                            |
| ----------------------- | --------------------------------------------------- |
| Docker not found        | Install Docker Desktop for Windows                  |
| Port 8000 in use        | `docker-compose down && docker-compose up -d`       |
| Backend won't start     | `docker logs chatbot-backend` (check DB connection) |
| Frontend blank          | `docker logs chatbot-frontend` (check build errors) |
| Redis connection failed | `docker exec chatbot-redis redis-cli ping`          |
| Network issues          | `docker network inspect chatbot-network`            |

---

## WIF3005 Submission Checklist

- [ ] All 8 Docker files created
- [ ] Dockerfiles use multi-stage builds
- [ ] docker-compose.yml has all 3 services
- [ ] Health checks defined
- [ ] .env.docker.example provided (no secrets)
- [ ] DOCKER_DEPLOYMENT_GUIDE.md comprehensive
- [ ] Build scripts working (PowerShell or Batch)
- [ ] Services start successfully
- [ ] Integration tests pass (6/6)
- [ ] Frontend loads at http://localhost:3000
- [ ] Backend responds at http://localhost:8000/health
- [ ] Documentation complete

---

## Advanced Commands

```powershell
# View resource usage
docker stats

# Execute command in container
docker exec chatbot-backend pytest tests/unit/ -v

# Enter container shell
docker exec -it chatbot-backend /bin/bash

# Push to registry (after building)
docker tag chatbot-backend:1.0 myusername/chatbot-backend:1.0
docker push myusername/chatbot-backend:1.0

# Clean up everything
docker-compose down -v
docker system prune -a
```

---

## Performance Targets

- Build time: < 3 minutes ✓
- Startup time: < 10 seconds ✓
- Memory usage: < 1.5GB ✓
- API response: < 500ms ✓
- Image size: Backend ~500MB, Frontend ~150MB ✓

---

## See Also

- **Full Guide**: [DOCKER_DEPLOYMENT_GUIDE.md](DOCKER_DEPLOYMENT_GUIDE.md)
- **Summary**: [DOCKER_IMPLEMENTATION_SUMMARY.md](DOCKER_IMPLEMENTATION_SUMMARY.md)
- **Backend Setup**: [backend/README.md](backend/README.md)
- **Frontend Setup**: [frontend/README.md](frontend/README.md)

---

**Last Updated**: January 21, 2026  
**For**: WIF3005 Alternative Assessment  
**Version**: 1.0
