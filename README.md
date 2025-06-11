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

## Notes

- Ensure the backend is running before using the frontend.
- Update API endpoints in the frontend if the backend address/port changes.

## License

This project is for educational purposes.
