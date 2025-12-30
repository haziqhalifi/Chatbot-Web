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

## Voice Chat Feature (Malay & English Support) 🎤

The chatbot now supports voice input with **Malay (Bahasa Melayu)** and **English** languages!

### Quick Setup:

1. **For best Malay support (Recommended):**

   - Add OpenAI API key to `.env`:
     ```env
     OPENAI_API_KEY=sk-your-api-key-here
     ```
   - Restart backend server

2. **Free alternative (Local):**
   - Already configured! Uses local Whisper model
   - No API key needed, but slower and less accurate for Malay

### User Guide:

- Click microphone icon 🎤 to record voice
- Go to Settings → Interaction to select language:
  - **Auto-detect** (recommended)
  - **Bahasa Melayu** (Malay only)
  - **English** (English only)

📖 **Full documentation:** See [VOICE_CHAT_GUIDE.md](VOICE_CHAT_GUIDE.md)

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

## License

This project is for educational purposes.
