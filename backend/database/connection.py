import os
import pyodbc
from dotenv import load_dotenv
import threading
import time
from queue import Queue, Empty

load_dotenv()

def format_timestamp(timestamp):
    """Helper function to format timestamp consistently"""
    if timestamp is None:
        return ""
    
    # If it's already a string, return it as is
    if isinstance(timestamp, str):
        return timestamp
    
    # If it's a datetime object, convert to ISO format
    if hasattr(timestamp, 'isoformat'):
        return timestamp.isoformat()
    
    # Fallback: convert to string
    return str(timestamp)

# Database configuration
SQL_SERVER = os.getenv("SQL_SERVER")
SQL_DATABASE = os.getenv("SQL_DATABASE")
SQL_USER = os.getenv("SQL_USER")
SQL_PASSWORD = os.getenv("SQL_PASSWORD")
SQL_USE_WINDOWS_AUTH = os.getenv("SQL_USE_WINDOWS_AUTH", "false").lower() == "true"

# Build connection string based on authentication method
if SQL_USE_WINDOWS_AUTH:
    # Windows Authentication
    conn_str = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={SQL_SERVER};"
        f"DATABASE={SQL_DATABASE};"
        f"Trusted_Connection=yes;"
        f"Connection Timeout=5;"
        f"Command Timeout=10;"
    )
else:
    # SQL Server Authentication
    conn_str = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={SQL_SERVER};"
        f"DATABASE={SQL_DATABASE};"
        f"UID={SQL_USER};"
        f"PWD={SQL_PASSWORD};"
        f"Connection Timeout=5;"  # Faster connection timeout
        f"Command Timeout=10;"   # Faster command timeout
    )

class DatabaseConnectionPool:
    """Thread-safe database connection pool to reduce vCore usage"""
    
    def __init__(self, min_connections=5, max_connections=25, connection_timeout=300):
        self.min_connections = min_connections
        self.max_connections = max_connections
        self.connection_timeout = connection_timeout
        self.pool = Queue(maxsize=max_connections)
        self.active_connections = 0
        self.lock = threading.Lock()
        self.connection_times = {}  # Use regular dict instead of WeakKeyDictionary
        self.connection_ids = {}    # Track connection IDs
        self._connection_counter = 0
        
        # Initialize minimum connections (with error handling)
        self._initialize_pool()        
        # Start cleanup thread
        self.cleanup_thread = threading.Thread(target=self._cleanup_expired_connections, daemon=True)
        self.cleanup_thread.start()
    
    def _initialize_pool(self):
        """Initialize the pool with minimum connections - with error handling"""
        if self.min_connections == 0:
            print("Connection pool initialized with 0 minimum connections (lazy mode)")
            return
            
        for i in range(self.min_connections):
            try:
                conn = self._create_connection()
                self.pool.put(conn)
                self.active_connections += 1
                print(f"Initialized connection {i+1}/{self.min_connections}")
            except Exception as e:
                print(f"Warning: Failed to initialize connection {i+1}: {e}")
                # Don't fail completely if we can't initialize all connections
                # We'll create them on-demand instead
                break
    
    def _create_connection(self):
        """Create a new database connection"""
        conn = pyodbc.connect(conn_str)
        # Set connection to autocommit mode for better performance
        conn.autocommit = True
        
        # Assign unique ID to track this connection
        self._connection_counter += 1
        conn_id = self._connection_counter
        self.connection_ids[id(conn)] = conn_id
        self.connection_times[conn_id] = time.time()
        
        return conn
    
    def get_connection(self):
        """Get a connection from the pool"""
        try:
            # Try to get from pool first (non-blocking)
            conn = self.pool.get_nowait()
            
            # Test if connection is still valid
            try:
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                cursor.close()
                # Update usage time
                conn_id = self.connection_ids.get(id(conn))
                if conn_id:
                    self.connection_times[conn_id] = time.time()
                return conn
            except:
                # Connection is dead, clean it up
                self._cleanup_connection(conn)
        except Empty:
            pass
        
        # Create new connection if pool is empty or connection was invalid
        with self.lock:
            if self.active_connections < self.max_connections:
                try:
                    conn = self._create_connection()
                    self.active_connections += 1
                    print(f"Created new connection. Active: {self.active_connections}/{self.max_connections}")
                    return conn
                except Exception as e:
                    print(f"Failed to create new connection: {e}")
                    raise
        
        # Wait for connection to become available with timeout
        print(f"⚠️ Waiting for connection... Active: {self.active_connections}/{self.max_connections}, Queue: {self.pool.qsize()}")
        try:
            conn = self.pool.get(timeout=10)  # Wait max 10 seconds
            conn_id = self.connection_ids.get(id(conn))
            if conn_id:
                self.connection_times[conn_id] = time.time()
            return conn
        except Empty:
            # Log detailed error for debugging
            error_msg = f"⛔ Connection pool exhausted! Active: {self.active_connections}/{self.max_connections}, Queue: {self.pool.qsize()}"
            print(error_msg)
            print(f"💡 TIP: Increase max_connections in connection.py or check for connection leaks")
            raise Exception(f"Connection pool exhausted - too many concurrent requests. Active: {self.active_connections}/{self.max_connections}")
    
    def return_connection(self, conn):
        """Return a connection to the pool"""
        if conn is None:
            return
            
        try:
            # Test if connection is still alive before returning
            try:
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                cursor.close()
            except:
                # Connection is dead, close it instead of returning
                self._cleanup_connection(conn)
                return
            
            # Reset connection state
            if not conn.autocommit:
                try:
                    conn.rollback()
                except:
                    self._cleanup_connection(conn)
                    return
                conn.autocommit = True
            
            # Return to pool if there's space
            try:
                self.pool.put_nowait(conn)
            except:
                # Pool is full, close the connection
                self._cleanup_connection(conn)
        except Exception as e:
            # Any error, clean up the connection
            print(f"Error returning connection: {e}")
            self._cleanup_connection(conn)
    
    def _cleanup_connection(self, conn):
        """Clean up a connection and its tracking data"""
        try:
            conn_id = self.connection_ids.get(id(conn))
            if conn_id:
                self.connection_times.pop(conn_id, None)
                self.connection_ids.pop(id(conn), None)
            conn.close()
        except:
            pass
        with self.lock:
            self.active_connections -= 1
    
    def _cleanup_expired_connections(self):
        """Background thread to cleanup expired connections"""
        while True:
            try:
                time.sleep(30)  # Check every 30 seconds for more aggressive cleanup
                current_time = time.time()
                expired_conn_ids = []
                
                # Find expired connections
                for conn_id, last_used in list(self.connection_times.items()):
                    if current_time - last_used > self.connection_timeout:
                        expired_conn_ids.append(conn_id)
                
                # Clean up expired connections (they'll be removed from pool naturally)
                if expired_conn_ids:
                    print(f"🧹 Cleaning up {len(expired_conn_ids)} expired connections")
                for conn_id in expired_conn_ids:
                    self.connection_times.pop(conn_id, None)
                
                # Health check - log pool status
                if self.active_connections > self.max_connections * 0.8:
                    print(f"⚠️ Pool usage high: {self.active_connections}/{self.max_connections} ({int(self.active_connections/self.max_connections*100)}%)")
                        
            except Exception as e:
                print(f"Connection cleanup error: {e}")
    
    def close_all(self):
        """Close all connections in the pool"""
        while not self.pool.empty():
            try:
                conn = self.pool.get_nowait()
                self._cleanup_connection(conn)
            except:
                pass
        self.active_connections = 0

# Global connection pool instance
_connection_pool = None
_pool_lock = threading.Lock()

def get_connection_pool():
    """Get or create the global connection pool (lazy initialization)"""
    global _connection_pool
    if _connection_pool is None:
        with _pool_lock:
            if _connection_pool is None:
                try:
                    # Connection pool configuration:
                    # 
                    # SIZING GUIDELINES:
                    # - Light load (<20 users):    max=30-50
                    # - Medium load (20-50 users): max=50-100
                    # - Heavy load (50-100 users): max=100-200
                    # - Very heavy (100+ users):   max=200-500
                    #
                    # DO NOT set unlimited - your SQL Server has limits!
                    # SQL Server typically handles 100-500 concurrent connections well.
                    # Beyond that, you need database server scaling.
                    #
                    # Current settings optimized for medium-heavy load:
                    # - min: 10 connections always ready (fast response)
                    # - max: 100 concurrent connections (handles spikes)
                    # - timeout: 60 seconds (prevents stale connections)
                    
                    max_pool = int(os.getenv("DB_POOL_MAX_SIZE", "100"))  # Override via env var
                    min_pool = int(os.getenv("DB_POOL_MIN_SIZE", "10"))
                    pool_timeout = int(os.getenv("DB_POOL_TIMEOUT", "60"))
                    
                    _connection_pool = DatabaseConnectionPool(
                        min_connections=min_pool, 
                        max_connections=max_pool,
                        connection_timeout=pool_timeout
                    )
                    print(f"Database connection pool initialized: {min_pool} min, {max_pool} max, {pool_timeout}s timeout")
                except Exception as e:
                    print(f"Warning: Failed to initialize connection pool: {e}")
                    # Return a minimal pool that will try to create connections on demand
                    _connection_pool = DatabaseConnectionPool(min_connections=0, max_connections=15)
    return _connection_pool

class DatabaseConnection:
    """Context manager for database connections"""
    
    def __init__(self):
        self.conn = None
        self.pool = get_connection_pool()
    
    def __enter__(self):
        self.conn = self.pool.get_connection()
        return self.conn
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            # Error occurred, rollback if not in autocommit
            try:
                if not self.conn.autocommit:
                    self.conn.rollback()
            except:
                pass
        self.pool.return_connection(self.conn)

class ManagedDatabaseConnection:
    """
    Wrapper for database connections that MUST be used with context manager.
    This prevents connection leaks by enforcing proper cleanup.
    
    Usage:
        with ManagedDatabaseConnection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT ...")
    """
    def __init__(self, conn, pool):
        self.conn = conn
        self.pool = pool
        self._returned = False
    
    def __enter__(self):
        return self.conn
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if not self._returned:
            if exc_type is not None:
                try:
                    if not self.conn.autocommit:
                        self.conn.rollback()
                except:
                    pass
            self.pool.return_connection(self.conn)
            self._returned = True
    
    def __getattr__(self, name):
        # Proxy all attributes to the underlying connection
        return getattr(self.conn, name)
    
    def close(self):
        """Override close to return to pool instead of actually closing"""
        if not self._returned:
            self.pool.return_connection(self.conn)
            self._returned = True

def get_db_conn():
    """
    Legacy function - Returns a ManagedDatabaseConnection that MUST be closed or used in context manager.
    
    ⚠️ WARNING: Always use one of these patterns to avoid connection leaks:
    
    Pattern 1 (RECOMMENDED - Context Manager):
        with get_db_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT ...")
    
    Pattern 2 (Manual close - less safe):
        conn = get_db_conn()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT ...")
        finally:
            conn.close()
    
    Pattern 3 (BEST - Use DatabaseConnection directly):
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT ...")
    """
    pool = get_connection_pool()
    raw_conn = pool.get_connection()
    return ManagedDatabaseConnection(raw_conn, pool)

def get_pool_stats():
    """
    Get current connection pool statistics for monitoring.
    
    Returns:
        dict: Pool statistics including active connections, queue size, and utilization percentage
    """
    pool = get_connection_pool()
    queue_size = pool.pool.qsize()
    active = pool.active_connections
    max_conn = pool.max_connections
    utilization = (active / max_conn * 100) if max_conn > 0 else 0
    
    return {
        "active_connections": active,
        "max_connections": max_conn,
        "available_in_queue": queue_size,
        "utilization_percent": round(utilization, 1),
        "status": "healthy" if utilization < 80 else "warning" if utilization < 95 else "critical"
    }

def force_cleanup_pool():
    """
    Force cleanup of the connection pool.
    This will close all idle connections and reset the pool.
    Use with caution - only for maintenance or testing.
    """
    global _connection_pool
    if _connection_pool:
        _connection_pool.close_all()
        print("Connection pool cleaned up")
