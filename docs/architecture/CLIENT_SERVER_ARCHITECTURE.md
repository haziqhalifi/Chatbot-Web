# Client-Server Architecture Sketch

## 🏗️ High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER                                   │
│                         (React Frontend - Port 4028)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   User Pages    │  │  Admin Pages    │  │   Components    │             │
│  │                 │  │                 │  │                 │             │
│  │ • Dashboard     │  │ • AdminDashboard│  │ • ChatInterface │             │
│  │ • SignIn/SignUp │  │ • AdminReports  │  │ • MapView       │             │
│  │ • Account       │  │ • AdminSignIn   │  │ • Notifications │             │
│  │ • Settings      │  │ • Notifications │  │ • Headers       │             │
│  │ • ReportDisaster│  │                 │  │                 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ State Management│  │   API Client    │  │  Authentication │             │
│  │                 │  │                 │  │                 │             │
│  │ • AuthContext   │  │ • Axios Client  │  │ • JWT Tokens    │             │
│  │ • LayerContext  │  │ • Interceptors  │  │ • localStorage  │             │
│  │ • localStorage  │  │ • Error Handler │  │ • Google OAuth  │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                            HTTP/REST API Calls
                          (JSON over HTTPS/HTTP)
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION TIER                                  │
│                         (FastAPI Backend - Port 8000)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          API ENDPOINTS                              │   │
│  │                                                                     │   │
│  │  Authentication:     User Management:      Admin Functions:        │   │
│  │  • POST /signup      • GET /profile        • GET /admin/reports     │   │
│  │  • POST /signin      • PUT /profile        • GET /admin/dashboard   │   │
│  │  • POST /google-auth • GET /notifications  • POST /admin/notify     │   │
│  │  • POST /admin/signin                                               │   │
│  │                                                                     │   │
│  │  Core Features:      AI/Chat:              Subscriptions:          │   │
│  │  • POST /report      • POST /generate      • GET /subscriptions     │   │
│  │  • POST /transcribe  • POST /chat          • POST /subscriptions    │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ Business Logic  │  │   AI Services   │  │  Middleware     │             │
│  │                 │  │                 │  │                 │             │
│  │ • auth_utils.py │  │ • chat_utils.py │  │ • CORS Handler  │             │
│  │ • users.py      │  │ • rag_utils.py  │  │ • JWT Validator │             │
│  │ • notifications │  │ • Ollama Client │  │ • Error Handler │             │
│  │ • subscriptions │  │ • OpenAI Client │  │ • Request Logger│             │
│  │ • performance   │  │ • Whisper STT   │  │                 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                              SQL/ODBC Queries
                            (Database Operations)
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA TIER                                     │
│                         (SQL Server Database)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   User Data     │  │  Application    │  │  System Data    │             │
│  │                 │  │     Data        │  │                 │             │
│  │ • users table   │  │ • reports       │  │ • notifications │             │
│  │ • profiles      │  │ • disasters     │  │ • subscriptions │             │
│  │ • auth tokens   │  │ • locations     │  │ • system_logs   │             │
│  │ • permissions   │  │ • categories    │  │ • performance   │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagrams

### Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │  Database   │    │ External    │
│  (React)    │    │  (FastAPI)  │    │ (SQL Server)│    │ (Google)    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
   [1] │──Login Request───►│                   │                   │
       │   (email/password) │                   │                   │
       │                   │                   │                   │
   [2] │                   │──Query User──────►│                   │
       │                   │   (verify creds)  │                   │
       │                   │                   │                   │
   [3] │                   │◄─User Data────────│                   │
       │                   │                   │                   │
   [4] │◄──JWT Token───────│                   │                   │
       │                   │                   │                   │
   [5] │──Store Token      │                   │                   │
       │   (localStorage)  │                   │                   │
       │                   │                   │                   │
 [6-A] │──Google OAuth────►│                   │                   │
       │                   │                   │                   │
 [6-B] │                   │──Verify Token────────────────────────►│
       │                   │                   │                   │
 [6-C] │                   │◄─User Info────────────────────────────│
       │                   │                   │                   │
 [6-D] │                   │──Create/Update───►│                   │
       │                   │   User            │                   │
```

### Chat/AI Interaction Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │   AI Model  │    │  RAG System │
│(ChatInterface)    │  (FastAPI)  │    │  (Ollama)   │    │(Embeddings) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
   [1] │──Chat Message────►│                   │                   │
       │   (user prompt)   │                   │                   │
       │                   │                   │                   │
   [2] │                   │──Query RAG───────────────────────────►│
       │                   │   (context search)│                   │
       │                   │                   │                   │
   [3] │                   │◄─Relevant Docs───────────────────────│
       │                   │                   │                   │
   [4] │                   │──Generate Response──────────────────►│
       │                   │   (prompt + context)                 │
       │                   │                   │                   │
   [5] │                   │◄─AI Response──────────────────────────│
       │                   │                   │                   │
   [6] │◄──Chat Response───│                   │                   │
       │   (formatted)     │                   │                   │
```

### Report Submission Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │  Database   │    │Notification │
│(ReportDisaster)   │  (FastAPI)  │    │ (SQL Server)│    │  System     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
   [1] │──Submit Report───►│                   │                   │
       │   (disaster data) │                   │                   │
       │                   │                   │                   │
   [2] │                   │──Validate Data───►│                   │
       │                   │                   │                   │
   [3] │                   │──Insert Report───►│                   │
       │                   │                   │                   │
   [4] │                   │◄─Report ID───────│                   │
       │                   │                   │                   │
   [5] │                   │──Trigger Alerts─────────────────────►│
       │                   │   (notify subscribers)                │
       │                   │                   │                   │
   [6] │◄──Confirmation────│                   │                   │
       │                   │                   │                   │
   [7] │──Show Success     │                   │                   │
       │   Message         │                   │                   │
```

## 🔌 API Integration Points

### External Services Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Google    │  │   OpenAI    │  │   ArcGIS    │             │
│  │   OAuth     │  │    API      │  │   Mapping   │             │
│  │             │  │             │  │             │             │
│  │ • User Auth │  │ • GPT Models│  │ • Map Tiles │             │
│  │ • Profile   │  │ • Embeddings│  │ • Geocoding │             │
│  │   Data      │  │ • Chat API  │  │ • Layers    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
├─────────────────────────────────────────────────────────────────┤
│                    YOUR APPLICATION                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Ollama    │  │   Whisper   │  │ SQL Server  │             │
│  │  Local AI   │  │ Speech-to-  │  │  Database   │             │
│  │             │  │    Text     │  │             │             │
│  │ • qwen2.5   │  │ • Audio     │  │ • User Data │             │
│  │ • Custom    │  │   Transcribe│  │ • Reports   │             │
│  │   Models    │  │             │  │ • Logs      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

## 🛡️ Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                CLIENT-SIDE SECURITY                     │   │
│  │                                                         │   │
│  │  • JWT Token Storage (localStorage)                     │   │
│  │  • Token Expiration Checking                           │   │
│  │  • Route Guards (Protected Routes)                     │   │
│  │  • Input Validation                                    │   │
│  │  • HTTPS Enforcement (Production)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 NETWORK SECURITY                        │   │
│  │                                                         │   │
│  │  • CORS Policy (Specific Origins)                      │   │
│  │  • HTTPS/TLS Encryption                                │   │
│  │  • Request Size Limits                                 │   │
│  │  • Rate Limiting (Future)                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                SERVER-SIDE SECURITY                     │   │
│  │                                                         │   │
│  │  • JWT Signature Verification                          │   │
│  │  • API Key Authentication (Admin)                      │   │
│  │  • Role-Based Access Control                           │   │
│  │  • Input Sanitization                                  │   │
│  │  • SQL Injection Prevention                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                DATABASE SECURITY                        │   │
│  │                                                         │   │
│  │  • Connection String Protection                        │   │
│  │  • Parameterized Queries                               │   │
│  │  • Database User Permissions                           │   │
│  │  • Connection Pooling                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Deployment Architecture

### Development vs Production

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT SETUP                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend (Vite Dev Server)     Backend (Uvicorn)              │
│  ┌─────────────────────────┐    ┌─────────────────────────┐     │
│  │  http://localhost:4028  │    │  http://localhost:8000  │     │
│  │                         │    │                         │     │
│  │  • Hot Reload           │    │  • Auto Reload          │     │
│  │  • Source Maps          │    │  • Debug Mode           │     │
│  │  • Dev Tools            │    │  • Detailed Logs        │     │
│  └─────────────────────────┘    └─────────────────────────┘     │
│             │                              │                   │
│             └──────────────┬───────────────┘                   │
│                            │                                   │
│                            ▼                                   │
│                  ┌─────────────────────────┐                   │
│                  │    Local SQL Server     │                   │
│                  │                         │                   │
│                  │  • Development DB       │                   │
│                  │  • Test Data            │                   │
│                  └─────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Web Server (Nginx/Apache)      Application Server             │
│  ┌─────────────────────────┐    ┌─────────────────────────┐     │
│  │  https://yourdomain.com │    │  Gunicorn + FastAPI     │     │
│  │                         │    │                         │     │
│  │  • Static Files        │    │  • Multiple Workers     │     │
│  │  • SSL Termination     │    │  • Process Management   │     │
│  │  • Load Balancing      │    │  • Health Checks        │     │
│  │  • CDN Integration     │    │  • Logging              │     │
│  └─────────────────────────┘    └─────────────────────────┘     │
│             │                              │                   │
│             └──────────────┬───────────────┘                   │
│                            │                                   │
│                            ▼                                   │
│                  ┌─────────────────────────┐                   │
│                  │  Production Database    │                   │
│                  │                         │                   │
│                  │  • Backup Strategy      │                   │
│                  │  • High Availability    │                   │
│                  │  • Performance Tuning   │                   │
│                  └─────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Performance Considerations

### Optimization Points

```
CLIENT-SIDE OPTIMIZATIONS:
├── Code Splitting (Vite)
├── Lazy Loading (React.Suspense)
├── Caching Strategy (localStorage)
├── Bundle Optimization
└── Asset Compression

SERVER-SIDE OPTIMIZATIONS:
├── Database Connection Pooling
├── Query Optimization
├── Response Caching
├── AI Model Caching
└── Async Processing

DATABASE OPTIMIZATIONS:
├── Indexing Strategy
├── Query Performance
├── Connection Management
└── Backup & Recovery
```

This architecture provides a solid foundation for your disaster management application with clear separation of concerns, security best practices, and scalability considerations.

## 💾 Database Schema Architecture

### Database Technology Stack

- **Database Engine**: Microsoft SQL Server
- **Connection**: ODBC Driver 17 for SQL Server
- **ORM/Query Builder**: Raw SQL with PyODBC
- **Schema Management**: Code-first migrations with automatic schema evolution

### Schema Evolution Strategy

Your application uses a **Code-First Database Migration** approach:

- Schema changes are managed through Python functions
- Automatic detection of missing columns
- Non-destructive migrations (only adds, never drops)
- Backward compatibility maintained

## 📊 Database Tables & Relationships

### 1. **Users Table** - Core User Management

```sql
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL, -- Hashed with bcrypt

    -- Basic Profile Information
    name NVARCHAR(255),
    language NVARCHAR(50) DEFAULT 'English',
    role NVARCHAR(50) DEFAULT 'Public', -- 'Public', 'Admin'

    -- Google OAuth Fields
    given_name NVARCHAR(255),
    family_name NVARCHAR(255),
    profile_picture NVARCHAR(1000),
    email_verified BIT DEFAULT 0,
    auth_provider NVARCHAR(50) DEFAULT 'local', -- 'local', 'google'

    -- Extended Profile Information
    phone NVARCHAR(20),
    address NVARCHAR(500),
    city NVARCHAR(100),
    country NVARCHAR(100),
    timezone NVARCHAR(50),

    -- Audit Fields
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    last_login DATETIME
);
```

**Key Features:**

- **Hybrid Authentication**: Supports both local accounts and Google OAuth
- **Profile Completeness**: Extended fields for complete user profiles
- **Role-Based Access**: Admin/Public role separation
- **Audit Trail**: Creation, update, and login timestamps

### 2. **Reports Table** - Disaster Reporting System

```sql
CREATE TABLE reports (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    location NVARCHAR(255) NOT NULL,
    disaster_type NVARCHAR(100) NOT NULL, -- 'flood', 'fire', 'earthquake', etc.
    description NVARCHAR(MAX) NOT NULL,
    timestamp DATETIME DEFAULT GETDATE(),

    -- Future Enhancement Fields (not yet implemented)
    -- severity NVARCHAR(50), -- 'Low', 'Medium', 'High', 'Critical'
    -- status NVARCHAR(50), -- 'Active', 'Responding', 'Monitoring', 'Resolved'
    -- coordinates NVARCHAR(100), -- GPS coordinates
    -- affected_people INT,
    -- estimated_damage NVARCHAR(255),
    -- response_team NVARCHAR(255),
    -- images NVARCHAR(MAX), -- JSON array of image URLs

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Key Features:**

- **Disaster Classification**: Categorized by type for better organization
- **User Attribution**: Links reports to users for accountability
- **Temporal Tracking**: Timestamp for chronological ordering
- **Extensible Design**: Commented fields show planned enhancements

### 3. **Notifications Table** - Real-time Alert System

```sql
CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(1000) NOT NULL,

    -- Notification Classification
    type NVARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'danger', 'success'
    disaster_type NVARCHAR(100) NULL, -- Links to disaster categories
    location NVARCHAR(255) NULL, -- Geographic context

    -- Status Tracking
    read_status BIT DEFAULT 0, -- 0 = unread, 1 = read

    -- Audit Fields
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Performance Indexes
CREATE INDEX IX_notifications_user_id ON notifications(user_id);
CREATE INDEX IX_notifications_read_status ON notifications(read_status);
CREATE INDEX IX_notifications_created_at ON notifications(created_at);
CREATE INDEX IX_notifications_disaster_type ON notifications(disaster_type);
CREATE INDEX IX_notifications_location ON notifications(location);
```

**Key Features:**

- **Contextual Notifications**: Disaster type and location context
- **Read Status Tracking**: User engagement metrics
- **Performance Optimized**: Strategic indexing for fast queries
- **Scalable Design**: Supports millions of notifications

### 4. **User Subscriptions Table** - Personalized Alert Preferences

```sql
CREATE TABLE user_subscriptions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,

    -- Subscription Preferences (JSON Stored as NVARCHAR)
    disaster_types NVARCHAR(500), -- JSON: ["flood", "fire", "earthquake"]
    locations NVARCHAR(500), -- JSON: ["Kuala Lumpur", "Selangor"]
    notification_methods NVARCHAR(200) DEFAULT 'web', -- 'web', 'email', 'sms'

    -- Geographic Preferences
    radius_km INT DEFAULT 10, -- Alert radius in kilometers

    -- Status Management
    is_active BIT DEFAULT 1,

    -- Audit Fields
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Performance Indexes
CREATE INDEX IX_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IX_user_subscriptions_active ON user_subscriptions(is_active);
```

**Key Features:**

- **Personalized Filtering**: Users choose disaster types and locations
- **Geographic Radius**: Location-based alert preferences
- **Multi-channel Delivery**: Web, email, SMS support (extensible)
- **Flexible Storage**: JSON for complex preference arrays

## 🔄 Database Relationships Diagram

```
┌─────────────────┐         ┌─────────────────┐
│     USERS       │         │    REPORTS      │
│                 │         │                 │
│ • id (PK)      │◄────────┤ • user_id (FK) │
│ • email        │         │ • title         │
│ • password     │         │ • location      │
│ • name         │         │ • disaster_type │
│ • role         │         │ • description   │
│ • auth_provider│         │ • timestamp     │
│ • profile_*    │         └─────────────────┘
│ • created_at   │                  │
└─────────────────┘                  │
         │                           │
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│ NOTIFICATIONS   │         │  SUBSCRIPTIONS  │
│                 │         │                 │
│ • user_id (FK) │         │ • user_id (FK) │
│ • title        │         │ • disaster_types│
│ • message      │         │ • locations     │
│ • type         │         │ • radius_km     │
│ • disaster_type│         │ • is_active     │
│ • location     │         │ • methods       │
│ • read_status  │         └─────────────────┘
└─────────────────┘
```

## 🚀 Database Performance Optimization

### Indexing Strategy

```sql
-- User Table Indexes
CREATE INDEX IX_users_email ON users(email); -- Authentication
CREATE INDEX IX_users_auth_provider ON users(auth_provider); -- OAuth queries
CREATE INDEX IX_users_role ON users(role); -- Admin queries

-- Reports Table Indexes
CREATE INDEX IX_reports_user_id ON reports(user_id); -- User's reports
CREATE INDEX IX_reports_disaster_type ON reports(disaster_type); -- Filter by type
CREATE INDEX IX_reports_timestamp ON reports(timestamp); -- Chronological queries
CREATE INDEX IX_reports_location ON reports(location); -- Geographic queries

-- Notifications Indexes (already shown above)
-- Subscriptions Indexes (already shown above)
```

### Query Patterns & Performance

#### 1. **Dashboard Statistics Query**

```sql
-- Optimized for Admin Dashboard
SELECT
    (SELECT COUNT(*) FROM reports) as total_reports,
    (SELECT COUNT(*) FROM reports WHERE timestamp >= DATEADD(day, -7, GETDATE())) as recent_reports,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT disaster_type, COUNT(*) FROM reports
     WHERE timestamp >= DATEADD(day, -30, GETDATE())
     GROUP BY disaster_type) as report_types
```

#### 2. **User Notifications Query**

```sql
-- Optimized for real-time notifications
SELECT id, title, message, type, disaster_type, location,
       read_status, created_at
FROM notifications
WHERE user_id = ? AND read_status = 0
ORDER BY created_at DESC
```

#### 3. **Reports with User Details Query**

```sql
-- Optimized JOIN for report listing
SELECT r.id, r.title, r.location, r.disaster_type, r.description,
       r.timestamp, u.name as reporter_name, u.email as reporter_email
FROM reports r
LEFT JOIN users u ON r.user_id = u.id
ORDER BY r.timestamp DESC
```

## 🔧 Schema Management & Migrations

### Automatic Schema Evolution

Your application implements **non-destructive migrations**:

```python
def update_users_table():
    """Automatic schema evolution for users table"""
    # Check existing columns
    cursor.execute("""
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'users'
    """)
    existing_columns = [row[0].lower() for row in cursor.fetchall()]

    # Add missing columns only
    if 'phone' not in existing_columns:
        cursor.execute("ALTER TABLE users ADD phone NVARCHAR(20)")

    # Similar pattern for all new fields...
```

**Benefits:**

- **Zero Downtime**: No data loss during updates
- **Backward Compatibility**: Old code works with new schema
- **Incremental Enhancement**: Features added progressively
- **Automatic Detection**: Runs on application startup

### Connection Management

```python
def get_db_conn():
    """Database connection factory with proper error handling"""
    conn_str = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={SQL_SERVER};"
        f"DATABASE={SQL_DATABASE};"
        f"UID={SQL_USER};"
        f"PWD={SQL_PASSWORD}"
    )
    return pyodbc.connect(conn_str)
```

**Features:**

- **Environment-based Configuration**: Secure credential management
- **Connection per Request**: Simple connection model
- **Proper Cleanup**: Always closes connections in finally blocks
- **Error Isolation**: Database errors don't crash the application

## 📈 Scalability Considerations

### Current Architecture Limitations & Solutions

| **Limitation**         | **Current State**         | **Scalability Solution**                 |
| ---------------------- | ------------------------- | ---------------------------------------- |
| **Connection Pooling** | Connection per request    | Implement connection pooling             |
| **Query Optimization** | Basic indexes             | Add composite indexes, query analysis    |
| **Data Archiving**     | All data in active tables | Implement data archiving for old reports |
| **Geographic Queries** | String-based location     | Add spatial data types and indexes       |
| **Real-time Features** | Polling-based             | Consider SignalR/WebSockets              |

### Future Schema Enhancements

#### Enhanced Reports Table

```sql
-- Planned enhancements for reports table
ALTER TABLE reports ADD severity NVARCHAR(50) DEFAULT 'Medium';
ALTER TABLE reports ADD status NVARCHAR(50) DEFAULT 'Active';
ALTER TABLE reports ADD coordinates GEOGRAPHY; -- Spatial data type
ALTER TABLE reports ADD affected_people INT DEFAULT 0;
ALTER TABLE reports ADD estimated_damage DECIMAL(15,2);
ALTER TABLE reports ADD response_team_id INT;
ALTER TABLE reports ADD images NVARCHAR(MAX); -- JSON array
ALTER TABLE reports ADD verification_status NVARCHAR(50) DEFAULT 'Pending';
```

#### Response Teams Table

```sql
-- New table for emergency response management
CREATE TABLE response_teams (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    specialization NVARCHAR(100), -- 'Fire', 'Flood', 'Medical', etc.
    contact_info NVARCHAR(500),
    coverage_area NVARCHAR(255),
    status NVARCHAR(50) DEFAULT 'Available',
    created_at DATETIME DEFAULT GETDATE()
);
```

This database schema provides a solid foundation for your disaster management application with room for growth and enhanced features as your system scales.
