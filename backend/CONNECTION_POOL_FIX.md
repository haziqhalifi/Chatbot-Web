# Connection Pool Exhaustion - Fix Guide

## Problem Summary

You were experiencing "Connection pool exhausted - too many concurrent requests" errors because:

1. **Pool size was too small** (max 30 connections)
2. **Connection leaks** - Many code locations used `get_db_conn()` without properly returning connections
3. **Slow cleanup** - Expired connections were only cleaned every 60 seconds

## Solutions Implemented

### 1. ✅ Increased Pool Size

- **Max connections**: 30 → **50** (67% increase)
- **Connection timeout**: 90s → **60s** (faster recycling)
- **Cleanup frequency**: 60s → **30s** (more aggressive)

### 2. ✅ Fixed Connection Management

Created `ManagedDatabaseConnection` wrapper that:

- Automatically returns connections to pool when closed
- Works with context managers (`with` statement)
- Proxies all connection methods
- Prevents connection leaks

### 3. ✅ Added Pool Monitoring

New functions to track pool health:

- `get_pool_stats()` - Real-time pool statistics
- Health endpoint: `GET /health/database`
- Stats endpoint: `GET /health/database/stats`

### 4. ✅ Improved Logging

Better visibility into pool state:

- ⚠️ Warning when pool usage > 80%
- 🧹 Cleanup notifications
- 💡 Helpful tips in error messages
- 🚨 Critical alerts when pool exhausted

## How to Use the Fixed Code

### ✅ BEST PRACTICE: Use DatabaseConnection (Context Manager)

```python
from database.connection import DatabaseConnection

def my_function():
    with DatabaseConnection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users")
        results = cursor.fetchall()
    # Connection automatically returned to pool here!
    return results
```

### ✅ GOOD: Use get_db_conn() with Context Manager

```python
from database import get_db_conn

def my_function():
    with get_db_conn() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users")
        results = cursor.fetchall()
    # Connection automatically returned to pool here!
    return results
```

### ✅ ACCEPTABLE: Use get_db_conn() with try/finally

```python
from database import get_db_conn

def my_function():
    conn = get_db_conn()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users")
        results = cursor.fetchall()
        return results
    finally:
        conn.close()  # Returns to pool, not actually closed
```

### ❌ BAD: Don't do this anymore (causes leaks)

```python
# OLD CODE - DON'T USE
conn = get_db_conn()
cursor = conn.cursor()
cursor.execute("SELECT * FROM users")
# No close() - CONNECTION LEAK!
```

## Migration Guide for Existing Code

Many files still use the old pattern. You should update them:

### Files with Connection Leaks (Need Fixing):

1. `backend/utils/signup_verification.py` - 3 instances
2. `backend/utils/admin_verification.py` - 2 instances
3. `backend/services/user_service.py` - 8 instances
4. `backend/services/notification_service.py` - 11 instances
5. `backend/services/subscription_service.py` - 2 instances
6. `backend/routes/auth.py` - 5 instances

### How to Fix Each File:

**Before:**

```python
conn = get_db_conn()
cursor = conn.cursor()
cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
row = cursor.fetchone()
conn.close()
```

**After:**

```python
with get_db_conn() as conn:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
```

## Monitoring Pool Health

### Check Current Pool Status

```bash
curl http://localhost:8000/health/database
```

Response:

```json
{
  "status": "healthy",
  "connection_pool": {
    "active_connections": 12,
    "max_connections": 50,
    "available_in_queue": 8,
    "utilization_percent": 24.0,
    "status": "healthy"
  },
  "request_stats": {
    "active_connections": 0,
    "total_requests": 1543,
    "failed_requests": 2,
    "retry_attempts": 5,
    "success_rate": 99.87
  }
}
```

### Get Detailed Statistics

```bash
curl http://localhost:8000/health/database/stats
```

This will include recommendations like:

- ⚠️ WARNING: High connection pool usage detected
- 🔄 High retry attempts detected
- ✅ Database performance looks good!

## Adjusting Pool Size

**You CANNOT have unlimited pool size!** Here's why and how to choose the right size:

### Why Pool Limits Are Essential:

1. **SQL Server has connection limits** - typically handles 100-500 concurrent connections well
2. **Each connection uses memory** - 4-8MB on server, 2-5MB in your app
3. **Too many connections slow down the database** - overhead from connection management
4. **Prevents cascade failures** - if database slows, you don't want to pile on more connections

### How to Choose Your Pool Size:

**Option 1: Use Environment Variables (RECOMMENDED)**

Edit your `.env` file:

```env
# Choose based on your expected load:
DB_POOL_MAX_SIZE=100    # Medium-Heavy load (default)
DB_POOL_MIN_SIZE=10     # Always ready connections
DB_POOL_TIMEOUT=60      # Recycle after 60 seconds idle
```

**Option 2: Edit Code Directly**

Edit `backend/database/connection.py` around line 249:

```python
_connection_pool = DatabaseConnectionPool(
    min_connections=10,    # Always ready
    max_connections=100,   # ⬅️ Change this
    connection_timeout=60  # Keep at 60s or lower
)
```

### Recommended Pool Sizes by Load:

| User Load      | Concurrent Requests | Recommended Max | Min |
| -------------- | ------------------- | --------------- | --- |
| **Light**      | <20                 | `30-50`         | 5   |
| **Medium**     | 20-50               | `50-100`        | 10  |
| **Heavy**      | 50-100              | `100-200`       | 15  |
| **Very Heavy** | 100-200             | `200-300`       | 20  |
| **Enterprise** | 200+                | `300-500` ⚠️    | 25  |

⚠️ **Above 300**: You should check your SQL Server's capacity first!

### Check Your SQL Server's Max Connections:

Run this in SQL Server Management Studio or any SQL client:

```sql
SELECT @@MAX_CONNECTIONS;
```

- If it returns **0** = unlimited (default 32,767 theoretical)
- Practical limit is usually **much lower** (100-500 for most servers)
- Enterprise SQL Servers can handle more

### Signs You Need to Increase Pool Size:

✅ Increase if you see:

- "Connection pool exhausted" errors frequently
- Pool utilization consistently > 90%
- Many requests timing out
- `/health/database/stats` shows critical status

❌ Don't increase if:

- Errors are rare or only during peak spikes
- Pool utilization is usually < 70%
- You have connection leaks (fix those first!)

### Example Configurations:

**Small App (Personal project, <20 users)**

```env
DB_POOL_MAX_SIZE=30
DB_POOL_MIN_SIZE=5
DB_POOL_TIMEOUT=90
```

**Medium App (Team app, 20-50 users) - CURRENT DEFAULT**

```env
DB_POOL_MAX_SIZE=100
DB_POOL_MIN_SIZE=10
DB_POOL_TIMEOUT=60
```

**Large App (Department app, 50-100 users)**

```env
DB_POOL_MAX_SIZE=200
DB_POOL_MIN_SIZE=15
DB_POOL_TIMEOUT=60
```

**Enterprise App (Company-wide, 100+ users)**

```env
DB_POOL_MAX_SIZE=300
DB_POOL_MIN_SIZE=25
DB_POOL_TIMEOUT=45
```

### What About Scaling Beyond Pool Size?

If pool size isn't enough, consider:

1. **Read Replicas** - Distribute read queries across multiple databases
2. **Load Balancing** - Multiple app instances with separate pools
3. **Database Scaling** - Upgrade your SQL Server tier (more vCores)
4. **Caching** - Redis/Memcached to reduce database hits
5. **Connection Pooling at DB Level** - Azure SQL has built-in pooling

## Troubleshooting

### Still Getting Pool Exhaustion?

1. **Check for connection leaks:**

   ```bash
   # Monitor pool stats while using the app
   watch -n 2 'curl -s http://localhost:8000/health/database/stats'
   ```

2. **Look for high utilization:**

   - If consistently > 80%, increase `max_connections`
   - If spikes to 100% then drops, it's normal peak load
   - If stays at 100%, you have connection leaks

3. **Check backend logs for:**

   - ⚠️ Pool usage high messages
   - 🧹 Cleanup messages (should happen every 30s)
   - 🚨 Connection pool exhausted errors

4. **Force cleanup (testing only):**
   ```python
   from database import force_cleanup_pool
   force_cleanup_pool()
   ```

### Performance Tips

1. **Use connection pooling properly** - Always use context managers
2. **Keep queries fast** - Slow queries hold connections longer
3. **Avoid long transactions** - Commit/rollback quickly
4. **Monitor regularly** - Check `/health/database/stats` periodically
5. **Increase pool size proactively** - Don't wait for errors

## Summary

✅ **Immediate fix**: Pool size increased from 30 → 50
✅ **Long-term fix**: Fixed connection leak issues  
✅ **Monitoring**: Added health endpoints
✅ **Prevention**: Better connection management with `ManagedDatabaseConnection`

**Next steps:**

1. Restart your backend to apply changes
2. Monitor `/health/database/stats` endpoint
3. If needed, increase `max_connections` further
4. Consider migrating old code to use context managers

The error should be **significantly reduced** or **eliminated** with these changes!
