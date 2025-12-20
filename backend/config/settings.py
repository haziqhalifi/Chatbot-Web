import os
from dotenv import load_dotenv

load_dotenv()

# API Key Configuration
API_KEY_CREDITS = {os.getenv("API_KEY"): 100}

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./chatbot.db")

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Admin Configuration
ADMIN_CODE = os.getenv("ADMIN_CODE", None)
SUPER_ADMIN_CODE = os.getenv("SUPER_ADMIN_CODE", None)

# Rate Limiting Configuration
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))

# Security Configuration
BCRYPT_ROUNDS = int(os.getenv("BCRYPT_ROUNDS", "12"))

# OpenAI Assistant API Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_ASSISTANT_ID = os.getenv("OPENAI_ASSISTANT_ID")
OPENAI_ASSISTANT_ENABLED = bool(OPENAI_API_KEY and OPENAI_ASSISTANT_ID)

# AI Model Provider Options
AI_PROVIDERS = ["openai"] if OPENAI_ASSISTANT_ENABLED else []

_configured_default = os.getenv("DEFAULT_AI_PROVIDER")
if _configured_default and _configured_default in AI_PROVIDERS:
	DEFAULT_AI_PROVIDER = _configured_default
else:
	DEFAULT_AI_PROVIDER = AI_PROVIDERS[0] if AI_PROVIDERS else "openai"