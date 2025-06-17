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