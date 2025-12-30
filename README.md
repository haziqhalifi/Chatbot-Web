# Chatbot Web

A full-stack web application featuring a chatbot with a FastAPI backend and a modern JavaScript frontend.

## Project Structure

- `backend/` — FastAPI backend (Python)
- `frontend/` — Frontend (JavaScript, Vite, React)
- `env/` — Python virtual environment

## Backend Setup

1. **Install dependencies**

   In the `backend` directory, install required Python packages:

   ```bash
   pip install -r requirements.txt
   ```

2. **Start the backend server**

   On Windows (from the project root):

   ```bash
   .\env\Scripts\uvicorn.exe backend.main:app --reload
   ```

   Or, if you are in the `backend` directory:

   ```bash
   ..\env\Scripts\uvicorn.exe main:app --reload


   ```

   new command for virtual env

   ```bash
   cd "C:\Users\user\Desktop\Chatbot Web\backend" & "..\\.venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000


   cd "C:\Users\user\Desktop\Chatbot Web"
   .venv\Scripts\Activate.ps1
   cd backend
   uvicorn main:app --host 127.0.0.1 --port 8000
   ```

The backend will be available at `http://127.0.0.1:8000` by default.

## Frontend Setup

1. **Install dependencies**

In the `frontend` directory:

```bash
npm install
```

2. **Start the frontend development server**

   ```bash
   npm run dev
   ```

   The frontend will be available at the address shown in the terminal (usually `http://localhost:5173`).

## Usage

- Open the frontend in your browser.
- Interact with the chatbot UI. Messages are sent to the FastAPI backend for processing.

## Map Data API

The application includes a Map Data API that provides ArcGIS Feature Server endpoints for disaster management mapping.

### Available Endpoints

- **GET /map/endpoints** — Get all available map data endpoints
- **GET /map/endpoints/{type}** — Get a specific endpoint by type (landslide, flood, poi, population)
- **GET /map/types** — Get all available map data types

### Data Sources

The API provides access to these geospatial datasets:

1. **Land Slide Risk Area** — Areas prone to landslides and slope failures
2. **Flood Prone Area** — Areas at risk of flooding during monsoon seasons
3. **Place of Interest** — Points of interest including emergency services
4. **Population** — Population density data for evacuation planning

For detailed API documentation, see `backend/routes/MAP_API.md` or visit `http://localhost:8000/docs` when the backend is running.

### Frontend Integration Example

```javascript
// Fetch map endpoints
const response = await fetch("http://localhost:8000/map/endpoints");
const data = await response.json();

// Use with ArcGIS to create layers
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

data.endpoints.forEach((endpoint) => {
  const layer = new FeatureLayer({
    url: endpoint.url,
    title: endpoint.name,
  });
  map.add(layer);
});
```

See `frontend/src/examples/MapDataAPIExample.jsx` for complete usage examples.

## Notes

- Ensure the backend is running before using the frontend.
- Update API endpoints in the frontend if the backend address/port changes.

## Password Reset Email (SMTP)

The backend endpoint `POST /forgot-password` can send a real password reset email when SMTP is configured.

Set these environment variables before starting the backend:

- `FRONTEND_BASE_URL` (example: `http://localhost:4028` or your deployed site)
- `SMTP_HOST` (required to send email)
- `SMTP_PORT` (default: `587`)
- `SMTP_USER` (optional; if set, login is attempted)
- `SMTP_PASSWORD` (required if `SMTP_USER` is set)
- `SMTP_FROM` (optional; defaults to `SMTP_USER`)
- `SMTP_TLS` (default: `true`) – use STARTTLS on port 587
- `SMTP_SSL` (default: `false`) – set to `true` for implicit TLS (commonly port 465)
- `SMTP_TIMEOUT` (default: `20` seconds)

If `SMTP_HOST` is not set, the backend logs the reset link in the console (dev mode).

### Brevo (Sendinblue) example

1. In Brevo: create an SMTP key (SMTP credentials) and verify your sender email/domain.
2. Set env vars (PowerShell):

   `$env:FRONTEND_BASE_URL = "http://localhost:4028"
$env:SMTP_HOST = "smtp-relay.brevo.com"
$env:SMTP_PORT = "587"
$env:SMTP_TLS = "true"
$env:SMTP_SSL = "false"
$env:SMTP_USER = "YOUR_BREVO_SMTP_LOGIN"
$env:SMTP_PASSWORD = "YOUR_BREVO_SMTP_KEY"
$env:SMTP_FROM = "verified-sender@yourdomain.com"`

3. Restart the backend and use “Forgot password?” again.

## License

This project is for educational purposes.
