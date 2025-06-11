# Backend — Chatbot Web

This is the backend service for the Chatbot Web project, built with FastAPI. It handles API requests, database operations, and chatbot logic.

## Features

- FastAPI-based REST API
- Handles chat messages and responses
- Database integration (see `database.py`)

## Requirements

- Python 3.12+
- All dependencies in `requirements.txt`

## Setup

1. **Create and activate a virtual environment** (if not already done):

   ```powershell
   python -m venv ..\env
   ..\env\Scripts\Activate.ps1
   ```

2. **Install dependencies**:

   ```powershell
   pip install -r requirements.txt
   ```

3. **Run the backend server**:

   ```powershell
   ..\env\Scripts\uvicorn.exe main:app --reload
   ```

   The API will be available at `http://127.0.0.1:8000`.

## File Overview

- `main.py` — FastAPI app and route definitions
- `models.py` — Pydantic models and/or ORM models
- `database.py` — Database connection and logic
- `requirements.txt` — Python dependencies

## Development Notes

- Make sure the virtual environment is activated before running or installing anything.
- The backend is designed to work with the frontend in the parent directory.
- Update CORS settings in `main.py` if you change the frontend URL or port.

## License

This backend is for educational purposes.
