from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from config.settings import API_KEY_CREDITS

# Import database and services
from database import update_database_schema, create_faq_table, insert_default_faqs, create_system_reports_table
from services.subscription_service import create_subscriptions_table
from utils.rag import initialize_rag

# Import route modules
from routes import auth, ai, reports, profile, notifications, subscriptions, chat, admin, dev, system_reports

# --- RECOMMENDED MODELS FOR MALAY LANGUAGE ---
# For better Malay language support, consider using these models with Ollama:
# 1. qwen2.5:7b (Currently configured - Excellent for Malay and English)
# 2. ollama pull aya:8b or aya:35b (Multilingual, excellent for Malay)
# 3. ollama pull gemma2:9b (Better multilingual capabilities)
# 
# Current model: "qwen2.5:7b" (Excellent Malay and English support)
# To change the model, update the model name in chat_utils.py generate_response function

# Initialize database updates
print("Updating database schema...")
update_database_schema()
print("Database schema updated successfully!")

# Initialize subscription tables
create_subscriptions_table()

# Initialize system reports table
create_system_reports_table()

# Initialize FAQ table and data
create_faq_table()
insert_default_faqs()

# Initialize RAG system
print("Initializing RAG system...")
try:
    initialize_rag()
    print("RAG system initialized successfully!")
except Exception as e:
    print(f"Warning: RAG system initialization failed: {str(e)}")
    print("The application will continue without RAG functionality.")

# Create FastAPI app
app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:4028",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route modules
app.include_router(auth.router, tags=["Authentication"])
app.include_router(ai.router, tags=["AI"])
app.include_router(reports.router, tags=["Reports"])
app.include_router(profile.router, tags=["Profile"])
app.include_router(notifications.router, tags=["Notifications"])
app.include_router(subscriptions.router, tags=["Subscriptions"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(admin.router, tags=["Admin"])
app.include_router(dev.router, tags=["Development"])
app.include_router(system_reports.router, tags=["System Reports"])
