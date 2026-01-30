# Database Module

Database layer for the Disaster Management Chatbot using Azure SQL Server with connection pooling.

## Overview

The database functionality is modularized for maintainability and separation of concerns. Each module handles specific database operations.

## Architecture

```
DatabaseConnectionPool (connection.py)
        ↓
DatabaseConnection (context manager)
        ↓
Module-specific functions (chat.py, users.py, reports.py, etc.)
```

## Module Structure

```
backend/database/
├── __init__.py           # Package exports
├── connection.py         # Connection pool and DatabaseConnection context manager
├── chat.py               # Chat sessions and messages
├── users.py              # User management
├── reports.py            # Disaster reports
├── admin.py              # Admin dashboard queries
├── faq.py                # FAQ management
├── nadma.py              # NADMA disaster data
├── schema.py             # Database schema management
└── system_reports.py     # System feedback reports
```

## Connection Pool (CRITICAL)

**ALWAYS use `DatabaseConnection` context manager. Never use `pyodbc.connect()` directly.**

```python
from database.connection import DatabaseConnection

# ✅ CORRECT: Use context manager
with DatabaseConnection() as conn:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    result = cursor.fetchone()
    cursor.close()
# Connection auto-returns to pool

# ❌ WRONG: Direct connection
import pyodbc
conn = pyodbc.connect(...)  # DON'T DO THIS
```

### Why Connection Pooling?

- **Azure SQL vCore limits** - Minimizes connection count
- **Thread safety** - Pool handles concurrent access
- **Performance** - Reuses connections instead of creating new ones
- **Auto-cleanup** - Context manager ensures connections are returned

## Module Reference

### connection.py

**Classes:** `DatabaseConnectionPool`, `DatabaseConnection`

```python
# Get a connection from the pool
with DatabaseConnection() as conn:
    cursor = conn.cursor()
    # ... operations
    cursor.close()
```

### chat.py

- `create_chat_session(user_id, title)` - Create new session
- `get_user_chat_sessions(user_id, limit, offset)` - List user sessions
- `get_chat_session(session_id, user_id)` - Get specific session
- `save_chat_message(session_id, sender_type, content, message_type)` - Save message
- `get_chat_messages(session_id, user_id, limit, offset)` - Get messages
- `update_chat_session_title(session_id, user_id, title)` - Update title
- `delete_chat_session(session_id, user_id)` - Soft delete

### users.py

- `update_users_table()` - Schema updates for users table

### reports.py

- `insert_report(report)` - Insert disaster report
- `get_all_reports()` - Get all reports with user info
- `get_report_by_id(report_id)` - Get specific report

### admin.py

- `get_admin_dashboard_stats()` - Dashboard statistics
- `get_system_status()` - System status info

### faq.py

- `create_faq_table()` - Create FAQ table
- `get_all_faqs()` - Get active FAQs
- `add_faq(question, answer, category, order_index)` - Add FAQ
- `update_faq(faq_id, ...)` - Update FAQ
- `delete_faq(faq_id)` - Soft delete FAQ

### nadma.py

- NADMA (National Disaster Management Agency) data operations

### schema.py

- `update_database_schema()` - Run all migrations
- `create_notifications_table()` - Notifications table
- `migrate_reports_tables()` - Reports migration

## Configuration

Environment variables (in `.env`):

```env
SQL_SERVER=your-server.database.windows.net
SQL_DATABASE=chatbot_db
SQL_USER=your_username
SQL_PASSWORD=your_password
SQL_USE_WINDOWS_AUTH=false
```

## Best Practices

1. **Use specific imports**:

   ```python
   # ✅ Good
   from database.chat import create_chat_session

   # ❌ Avoid wildcard imports
   from database import *
   ```

2. **Always close cursors**:

   ```python
   with DatabaseConnection() as conn:
       cursor = conn.cursor()
       try:
           cursor.execute(query)
           result = cursor.fetchall()
       finally:
           cursor.close()
   ```

3. **Use parameterized queries** (prevent SQL injection):

   ```python
   # ✅ Good
   cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))

   # ❌ Bad - SQL injection risk
   cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
   ```

## Error Handling

All functions include proper error handling:

- Connection errors are caught and logged
- Transactions are rolled back on errors
- Meaningful error messages are returned
