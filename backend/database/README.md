# Database Module Structure

This document describes the modular structure of the database layer for the Chatbot Web application.

## Overview

The database functionality has been modularized into separate files for better maintainability, organization, and separation of concerns. Each module handles a specific aspect of database operations.

## Module Structure

```
backend/
├── database.py                    # Legacy compatibility layer
└── database/
    ├── __init__.py               # Package initialization and exports
    ├── connection.py             # Database connection management
    ├── reports.py                # Disaster reports operations
    ├── chat.py                   # Chat sessions and messages
    ├── users.py                  # User management operations
    ├── admin.py                  # Admin dashboard functions
    ├── faq.py                    # FAQ management
    ├── system_reports.py         # System reports handling
    └── schema.py                 # Database schema management
```

## Module Details

### 1. `connection.py`
**Purpose**: Manages database connections and connection pooling
- **Classes**: `DatabaseConnectionPool`, `DatabaseConnection`
- **Functions**: `get_connection_pool()`, `get_db_conn()`, `format_timestamp()`
- **Features**: Thread-safe connection pooling, automatic connection cleanup, connection health monitoring

### 2. `reports.py`
**Purpose**: Handles disaster report operations
- **Functions**:
  - `insert_report(report)` - Insert new disaster report
  - `get_all_reports()` - Fetch all disaster reports with user info
  - `get_report_by_id(report_id)` - Get specific report by ID

### 3. `chat.py`
**Purpose**: Manages chat sessions and messages
- **Functions**:
  - `create_chat_session(user_id, title)` - Create new chat session
  - `get_user_chat_sessions(user_id, limit, offset)` - Get user's chat sessions
  - `get_chat_session(session_id, user_id)` - Get specific chat session
  - `save_chat_message(session_id, sender_type, content, message_type)` - Save chat message
  - `get_chat_messages(session_id, user_id, limit, offset)` - Get chat messages
  - `update_chat_session_title(session_id, user_id, title)` - Update session title
  - `delete_chat_session(session_id, user_id)` - Soft delete session
  - `create_chat_tables()` - Create chat-related tables

### 4. `users.py`
**Purpose**: User-related database operations
- **Functions**:
  - `update_users_table()` - Add new columns to users table

### 5. `admin.py`
**Purpose**: Admin dashboard and system monitoring
- **Functions**:
  - `get_admin_dashboard_stats()` - Get dashboard statistics
  - `get_system_status()` - Get system status information

### 6. `faq.py`
**Purpose**: FAQ management operations
- **Functions**:
  - `create_faq_table()` - Create FAQ table
  - `insert_default_faqs()` - Insert default FAQ data
  - `get_all_faqs()` - Get all active FAQs
  - `get_faq_by_id(faq_id)` - Get specific FAQ
  - `add_faq(question, answer, category, order_index)` - Add new FAQ
  - `update_faq(faq_id, ...)` - Update existing FAQ
  - `delete_faq(faq_id)` - Soft delete FAQ

### 7. `system_reports.py`
**Purpose**: System reports and feedback management
- **Functions**:
  - `insert_system_report(user_id, subject, message)` - Insert system report
  - `get_all_system_reports()` - Fetch all system reports

### 8. `schema.py`
**Purpose**: Database schema management and migrations
- **Functions**:
  - `update_database_schema()` - Update entire database schema
  - `create_notifications_table()` - Create notifications table
  - `migrate_reports_tables()` - Migrate reports table structure

## Benefits of Modularization

### 1. **Maintainability**
- Each module has a single responsibility
- Easier to locate and fix bugs
- Cleaner code organization

### 2. **Scalability**
- Easy to add new database operations
- Modules can be extended independently
- Better code reusability

### 3. **Testing**
- Individual modules can be tested in isolation
- Easier to mock dependencies
- Better test coverage

### 4. **Team Collaboration**
- Different team members can work on different modules
- Reduced merge conflicts
- Clear module boundaries

### 5. **Performance**
- Connection pooling reduces database overhead
- Optimized queries per module
- Better resource management

## Usage Examples

### Using the Connection Pool
```python
from database.connection import DatabaseConnection

# Using context manager (recommended)
with DatabaseConnection() as conn:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    results = cursor.fetchall()
    cursor.close()
```

### Working with Reports
```python
from database.reports import get_all_reports, insert_report

# Get all reports
reports = get_all_reports()

# Insert new report
report_data = SomeReportObject()
result = insert_report(report_data)
```

### Chat Operations
```python
from database.chat import create_chat_session, save_chat_message

# Create new chat session
session = create_chat_session(user_id=1, title="Emergency Chat")

# Save a message
message = save_chat_message(
    session_id=session['id'],
    sender_type='user',
    content='Hello, I need help!',
    message_type='text'
)
```

## Migration Guide

### For Existing Code
The original `database.py` file now serves as a compatibility layer. Existing imports will continue to work:

```python
# This still works
from database import get_all_reports, create_chat_session

# But it's better to use specific imports
from database.reports import get_all_reports
from database.chat import create_chat_session
```

### Best Practices
1. **Use specific imports** instead of wildcard imports
2. **Use the DatabaseConnection context manager** for database operations
3. **Handle exceptions appropriately** in your application code
4. **Use transactions** for operations that require atomicity

## Configuration

Database configuration is handled in `connection.py` through environment variables:
- `SQL_SERVER` - Database server address
- `SQL_DATABASE` - Database name
- `SQL_USER` - Username (if using SQL Server auth)
- `SQL_PASSWORD` - Password (if using SQL Server auth)
- `SQL_USE_WINDOWS_AUTH` - Use Windows authentication (true/false)

## Error Handling

All database functions include proper error handling:
- Connection errors are caught and logged
- Database constraints are respected
- Transactions are rolled back on errors
- Meaningful error messages are returned

## Future Enhancements

1. **Add caching layer** for frequently accessed data
2. **Implement database migrations** with version control
3. **Add query optimization** and performance monitoring
4. **Create database backup/restore** functionality
5. **Add database health checks** and monitoring endpoints
