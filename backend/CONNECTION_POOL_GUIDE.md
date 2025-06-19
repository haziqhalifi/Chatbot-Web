# Database Connection Pool Implementation

## Overview

This implementation adds a connection pool to reduce Azure SQL Database vCore consumption by:

1. **Reusing connections** instead of creating new ones for each request
2. **Managing connection lifecycle** with automatic cleanup
3. **Optimizing connection settings** for better performance
4. **Providing thread-safe access** for concurrent requests

## How It Reduces vCore Usage

### Before (Without Pooling)

```python
def get_data():
    conn = pyodbc.connect(connection_string)  # New connection every time
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM table")
    result = cursor.fetchall()
    conn.close()  # Connection destroyed
    return result
```

**Problems:**

- Each request creates a new connection (expensive)
- Connection overhead: authentication, SSL handshake, etc.
- More vCore seconds consumed per operation

### After (With Pooling)

```python
def get_data():
    with DatabaseConnection() as conn:  # Reuses existing connection
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM table")
        result = cursor.fetchall()
        cursor.close()
        return result
    # Connection returned to pool, not destroyed
```

**Benefits:**

- Connections are reused across requests
- Reduced connection establishment overhead
- Fewer vCore seconds consumed
- Better performance

## Key Features

### 1. Connection Pool Class

- **Min/Max connections**: 2-8 connections by default
- **Thread-safe**: Safe for concurrent web requests
- **Auto-scaling**: Creates connections as needed
- **Connection timeout**: Closes idle connections after 5 minutes

### 2. Context Manager

```python
with DatabaseConnection() as conn:
    # Use connection
    cursor = conn.cursor()
    # ... database operations
    cursor.close()
# Connection automatically returned to pool
```

### 3. Optimized Connection String

```python
conn_str = (
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={SQL_SERVER};"
    f"DATABASE={SQL_DATABASE};"
    f"UID={SQL_USER};"
    f"PWD={SQL_PASSWORD};"
    f"Connection Timeout=5;"  # Faster connection timeout
    f"Command Timeout=10;"   # Faster command timeout
)
```

### 4. Automatic Cleanup

- Background thread monitors connection usage
- Closes connections idle for > 5 minutes
- Maintains minimum pool size
- Handles connection failures gracefully

## Usage Examples

### Basic Usage

```python
# Simple query
with DatabaseConnection() as conn:
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]
    cursor.close()
```

### Transaction Support

```python
# Multi-statement transaction
with DatabaseConnection() as conn:
    conn.autocommit = False  # Enable transactions
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO table1 VALUES (?)", (value1,))
        cursor.execute("INSERT INTO table2 VALUES (?)", (value2,))
        conn.commit()
    except:
        conn.rollback()
        raise
    finally:
        conn.autocommit = True  # Reset to default
        cursor.close()
```

### Error Handling

```python
try:
    with DatabaseConnection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM table")
        cursor.close()
except pyodbc.Error as e:
    if "42119" in str(e) or "monthly free amount allowance" in str(e):
        print("Database quota exceeded - waiting for reset")
    else:
        print(f"Database error: {e}")
```

## Configuration

### Pool Settings

```python
# Adjust these values based on your needs
pool = DatabaseConnectionPool(
    min_connections=2,      # Minimum connections to maintain
    max_connections=8,      # Maximum concurrent connections
    connection_timeout=300  # Close idle connections after 5 minutes
)
```

### Recommended Settings for Free Tier

- **min_connections**: 1-2 (conserve resources)
- **max_connections**: 4-6 (limit concurrent usage)
- **connection_timeout**: 300 seconds (5 minutes)

## Migration from Old Code

### Before

```python
def old_function():
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM table")
        result = cursor.fetchall()
        return result
    finally:
        try:
            conn.close()
        except:
            pass
```

### After

```python
def new_function():
    with DatabaseConnection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM table")
        result = cursor.fetchall()
        cursor.close()
        return result
```

## Testing

Run the test script to verify the connection pool is working:

```bash
cd backend
python test_connection_pool.py
```

Expected output:

```
=== Database Connection Pool Test ===

Testing basic connection...
✓ Basic connection test passed: 1

Testing concurrent connections...
Concurrent connection results:
  Worker 0: 0
  Worker 1: 1
  Worker 2: 2
  Worker 3: 3
  Worker 4: 4

Testing connection reuse...
Initial active connections: 2
  Iteration 0: 0
  Iteration 1: 1
  Iteration 2: 2
Final active connections: 2
✓ Connection reuse test passed

Testing error handling...
✓ Error handling test passed - caught expected error: ProgrammingError

=== Test Results ===
Passed: 4/4
✓ All tests passed!
```

## Performance Benefits

### vCore Reduction Estimates

- **Connection overhead reduction**: 50-70% less vCore usage for short queries
- **Concurrent request efficiency**: Better scaling under load
- **Idle connection management**: Automatic cleanup prevents waste

### Expected Improvements

- **Query performance**: 20-40% faster due to connection reuse
- **Resource usage**: 30-50% reduction in vCore seconds
- **Stability**: Better handling of connection failures

## Best Practices

1. **Always use the context manager**: `with DatabaseConnection() as conn:`
2. **Close cursors explicitly**: `cursor.close()` after use
3. **Handle errors gracefully**: Catch quota exceeded errors
4. **Optimize queries**: Use LIMIT, WHERE clauses, proper indexes
5. **Monitor usage**: Check Azure portal for vCore consumption

## Troubleshooting

### Common Issues

1. **Pool exhausted error**

   - Increase `max_connections` or reduce concurrent requests
   - Check for unclosed connections in your code

2. **Connection timeout**

   - Database may be paused due to quota
   - Check Azure portal for database status

3. **Performance not improved**
   - Verify you're using `DatabaseConnection()` context manager
   - Check that connections are being reused in logs

### Monitoring

```python
pool = get_connection_pool()
print(f"Active connections: {pool.active_connections}")
print(f"Available connections: {pool.pool.qsize()}")
```

## Migration Checklist

- [ ] Update all database functions to use `DatabaseConnection()`
- [ ] Remove manual `conn.close()` calls
- [ ] Test with `test_connection_pool.py`
- [ ] Monitor vCore usage in Azure portal
- [ ] Update error handling for quota limits
- [ ] Deploy and monitor performance

## Future Enhancements

1. **Caching layer**: Add Redis or in-memory cache for frequent queries
2. **Read replicas**: Use read-only replicas for query operations
3. **Query optimization**: Add query performance monitoring
4. **Failover support**: Automatic failover to backup database
