# DisasterWatch

A comprehensive disaster monitoring and response system with real-time alerts, AI-powered chatbot assistance, and interactive mapping features. Built with FastAPI backend and React frontend.

## 🌟 Features

- **Real-time Disaster Monitoring**: Track disasters from NADMA API
- **AI Chatbot Assistant**: Get instant help and information
- **Interactive Maps**: Visualize disaster locations with GIS data
- **User Subscriptions**: Alert subscriptions for specific disaster types/regions
- **Admin Dashboard**: Manage FAQs, users, and system reports
- **Multi-language Support**: English, Bahasa Melayu, Mandarin, Tamil
- **Voice Input**: Voice chat in Malay and English
- **Email Notifications**: SMTP-based password reset and alerts

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL (or SQLite for development)

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv .venv
   # Windows
   .venv\Scripts\activate
   # Linux/Mac
   source .venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

5. **Start backend server**
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

Backend available at `http://127.0.0.1:8000`

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

Frontend available at `http://localhost:5173`

## 📁 Project Structure

```
DisasterWatch/
├── backend/          # FastAPI backend
├── frontend/         # React frontend
├── docs/            # Documentation
├── diagrams/        # Architecture diagrams
├── scripts/         # Utility scripts
└── tests/           # Integration tests
```

For detailed structure, see [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)

## 📚 Documentation

- [Project Structure](docs/PROJECT_STRUCTURE.md) - Detailed repository organization
- [API Documentation](docs/api/) - REST API endpoints
- [Architecture](docs/architecture/) - System design and architecture
- [Maintenance Guide](docs/maintenance/MAINTENANCE_GUIDE.md) - Operational guides
- [Setup Guide](docs/setup/) - Detailed setup instructions
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute

## 🛠️ Development

### Running Tests

**Backend:**

```bash
cd backend
pytest
pytest --cov  # With coverage
```

**Frontend:**

```bash
cd frontend
npm test
```

### Code Style

- **Backend**: Follow PEP 8, use black formatter
- **Frontend**: ESLint + Prettier configured

### Building for Production

**Backend:**

```bash
# Backend runs with uvicorn in production
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend:**

```bash
cd frontend
npm run build
# Outputs to frontend/dist/
```

## 🎤 Voice Chat Feature

The chatbot supports voice input with **Malay (Bahasa Melayu)** and **English** languages.

### Quick Setup

1. **For best Malay support (Recommended):**

   - Add OpenAI API key to `.env`:
     ```env
     OPENAI_API_KEY=sk-your-api-key-here
     ```
   - Restart backend server

2. **Free alternative (Local):**
   - Uses local Whisper model
   - No API key needed

### Usage

- Click microphone icon 🎤 to record voice
- Configure language in Settings → Interaction

## 🗺️ Map Data API

The application provides ArcGIS Feature Server endpoints for disaster management mapping.

### Available Endpoints

- `GET /map/endpoints` — Get all available map data endpoints
- `GET /map/endpoints/{type}` — Get specific endpoint by type
- `GET /map/types` — Get all available map data types

### Data Sources

1. **Land Slide Risk Area** — Areas prone to landslides
2. **Flood Prone Area** — Flood risk during monsoon seasons
3. **Place of Interest** — Emergency services locations
4. **Population** — Population density for evacuation planning

See [backend/routes/MAP_API.md](backend/routes/MAP_API.md) or visit `http://localhost:8000/docs`

## 🔐 Password Reset (SMTP)

Configure SMTP to send real password reset emails.

### Environment Variables

```env
FRONTEND_BASE_URL=http://localhost:4028
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-smtp-login
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=verified-sender@yourdomain.com
SMTP_TLS=true
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for educational purposes.

## 🙏 Acknowledgments

- NADMA for disaster data API
- OpenAI for AI capabilities
- Malaysian government agencies for GIS data

## 📞 Support

For issues and questions:

- Create an [Issue](https://github.com/haziqhalifi/Chatbot-Web/issues)
- Check [Documentation](docs/)
- Review [Contributing Guidelines](CONTRIBUTING.md)

---

**Current Version**: 1.0.0  
**Last Updated**: January 2026
