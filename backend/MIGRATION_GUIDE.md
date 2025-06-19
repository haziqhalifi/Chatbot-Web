# Database Modularization Migration Guide

This guide helps you migrate existing code to use the new modular database structure.

## Summary of Changes

The original `database.py` file has been split into multiple modules:

- `database/connection.py` - Connection management
- `database/reports.py` - Disaster reports
- `database/chat.py` - Chat functionality
- `database/users.py` - User management
- `database/admin.py` - Admin dashboard
- `database/faq.py` - FAQ management
- `database/system_reports.py` - System reports
- `database/schema.py` - Schema management

## Backwards Compatibility

**Good news!** All existing imports will continue to work without any changes. The old `database.py` file now serves as a compatibility layer.

```python
# These imports still work exactly as before:
from database import get_all_reports, create_chat_session, insert_report
```

## Recommended Migration Steps

### Step 1: Update Imports (Recommended but Optional)

Instead of importing everything from the main `database` module, use specific imports:

**Before:**
```python
from database import get_all_reports, insert_report, create_chat_session, save_chat_message
```

**After:**
```python
from database.reports import get_all_reports, insert_report
from database.chat import create_chat_session, save_chat_message
```

### Step 2: Update Route Files

Here are the recommended imports for each route file:

**routes/reports.py:**
```python
# Replace this line:
from database import insert_report, get_all_reports, get_report_by_id, insert_system_report, get_all_system_reports

# With these specific imports:
from database.reports import insert_report, get_all_reports, get_report_by_id
from database.system_reports import insert_system_report, get_all_system_reports
from database.schema import migrate_reports_tables
```

**routes/chat.py:**
```python
# Replace this line:
from database import create_chat_session, get_user_chat_sessions, get_chat_session, save_chat_message, get_chat_messages

# With this specific import:
from database.chat import (
    create_chat_session, 
    get_user_chat_sessions, 
    get_chat_session, 
    save_chat_message, 
    get_chat_messages,
    update_chat_session_title,
    delete_chat_session
)
```

**routes/admin.py:**
```python
# Replace this line:
from database import get_admin_dashboard_stats, get_system_status

# With this specific import:
from database.admin import get_admin_dashboard_stats, get_system_status
```

**routes/dev.py:**
```python
# Replace this line:
from database import get_all_faqs, add_faq, update_faq, delete_faq

# With this specific import:
from database.faq import get_all_faqs, add_faq, update_faq, delete_faq
```

### Step 3: Update Service Files

**services/notification_service.py:**
```python
# If using database functions, import from specific modules:
from database.connection import DatabaseConnection
```

**services/user_service.py:**
```python
# If using user-related functions:
from database.users import update_users_table
```

### Step 4: Update Main Application

**main.py:**
```python
# Replace this line:
from database import update_database_schema

# With this specific import:
from database.schema import update_database_schema
```

## Benefits of Migration

### 1. **Better Code Organization**
```python
# Old way - unclear what module functions come from
from database import get_all_reports, create_chat_session, get_all_faqs

# New way - clear module organization
from database.reports import get_all_reports
from database.chat import create_chat_session  
from database.faq import get_all_faqs
```

### 2. **Improved IDE Support**
- Better autocomplete and IntelliSense
- Clearer function documentation
- Easier navigation to source code

### 3. **Reduced Import Overhead**
```python
# Old way - imports everything
from database import *

# New way - only imports what you need
from database.reports import get_all_reports
```

### 4. **Better Testing**
```python
# You can now mock individual modules
from unittest.mock import patch

with patch('database.reports.get_all_reports') as mock_get_reports:
    mock_get_reports.return_value = []
    # Test your code
```

## Database Connection Usage

### Recommended Pattern

Always use the `DatabaseConnection` context manager:

```python
from database.connection import DatabaseConnection

def my_database_operation():
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM my_table")
            results = cursor.fetchall()
            cursor.close()
            return results
    except Exception as e:
        print(f"Database error: {e}")
        raise
```

### Connection Pool Benefits

The new modular structure includes an improved connection pool:
- **Thread-safe** operations
- **Automatic cleanup** of expired connections
- **Better performance** with connection reuse
- **Configurable pool size** and timeouts

## Error Handling

All database functions now include consistent error handling:

```python
try:
    reports = get_all_reports()
except Exception as e:
    # Handle database errors appropriately
    print(f"Failed to get reports: {e}")
```

## New Features Available

### 1. Enhanced Connection Management
```python
from database.connection import get_connection_pool

# Get connection pool statistics
pool = get_connection_pool()
print(f"Active connections: {pool.active_connections}")
```

### 2. Better Schema Management
```python
from database.schema import update_database_schema, migrate_reports_tables

# Update entire schema
update_database_schema()

# Run specific migrations
migrate_reports_tables()
```

### 3. Modular Table Creation
```python
from database.chat import create_chat_tables
from database.faq import create_faq_table

# Create specific tables
create_chat_tables()
create_faq_table()
```

## Timeline for Migration

- **Phase 1 (Optional)**: Continue using existing imports - everything works as before
- **Phase 2 (Recommended)**: Gradually update imports to use specific modules
- **Phase 3 (Future)**: Consider removing the compatibility layer once all code is updated

## Need Help?

If you encounter any issues during migration:

1. **Check the test script**: Run `python test_database_modules.py` to verify all imports work
2. **Review the README**: See `database/README.md` for detailed documentation
3. **Check error messages**: The modular structure provides better error messages
4. **Backward compatibility**: Remember, old imports still work if needed

## Quick Reference

| Function Category | Old Import | New Import |
|------------------|------------|------------|
| Reports | `from database import get_all_reports` | `from database.reports import get_all_reports` |
| Chat | `from database import create_chat_session` | `from database.chat import create_chat_session` |
| Admin | `from database import get_admin_dashboard_stats` | `from database.admin import get_admin_dashboard_stats` |
| FAQ | `from database import get_all_faqs` | `from database.faq import get_all_faqs` |
| Schema | `from database import update_database_schema` | `from database.schema import update_database_schema` |
| Connection | `from database import DatabaseConnection` | `from database.connection import DatabaseConnection` |
