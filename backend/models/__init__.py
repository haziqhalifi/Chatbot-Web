"""
Centralized Pydantic models for the chatbot application
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# ========== Authentication Models ==========
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class AuthRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

class AuthResponse(BaseModel):
    token: str
    user_id: int
    email: str
    role: UserRole
    expires_in: int

class AdminAuthRequest(AuthRequest):
    admin_code: str

class GoogleAuthRequest(BaseModel):
    credential: str

# ========== User Models ==========
class UserProfile(BaseModel):
    id: int
    email: EmailStr
    role: UserRole
    created_at: datetime
    last_login: Optional[datetime] = None

class UpdateProfileRequest(BaseModel):
    display_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, pattern=r'^\+?[\d\s\-\(\)]+$')

# ========== Chat Models ==========
class MessageType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    FILE = "file"

class ChatMessage(BaseModel):
    id: int
    session_id: int
    sender: str  # 'user' or 'bot'
    content: str
    message_type: MessageType = MessageType.TEXT
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

class ChatSession(BaseModel):
    id: int
    user_id: int
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

class CreateChatRequest(BaseModel):
    title: Optional[str] = Field(None, max_length=200)

class SendMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)
    message_type: MessageType = MessageType.TEXT
    
    @validator('content')
    def validate_content(cls, v):
        if not v.strip():
            raise ValueError('Message content cannot be empty')
        return v.strip()

# ========== Report Models ==========
class DisasterType(str, Enum):
    FLOOD = "flood"
    FIRE = "fire"
    EARTHQUAKE = "earthquake"
    LANDSLIDE = "landslide"
    STORM = "storm"
    ACCIDENT = "accident"
    OTHER = "other"

class ReportStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"

class CreateReportRequest(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    location: str = Field(..., min_length=3, max_length=500)
    disaster_type: DisasterType
    description: str = Field(..., min_length=10, max_length=2000)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)

class DisasterReport(BaseModel):
    id: int
    user_id: int
    title: str
    location: str
    disaster_type: DisasterType
    description: str
    status: ReportStatus = ReportStatus.PENDING
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime

# ========== Notification Models ==========
class NotificationType(str, Enum):
    WELCOME = "welcome"
    REPORT_UPDATE = "report_update"
    SYSTEM = "system"
    ALERT = "alert"

class Notification(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: NotificationType
    is_read: bool = False
    created_at: datetime

# ========== API Response Models ==========
class APIResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Any] = None

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int = 1
    per_page: int = 20
    has_next: bool = False
    has_prev: bool = False

# ========== Error Models ==========
class ErrorDetail(BaseModel):
    code: str
    message: str
    field: Optional[str] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
