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
        print(f"Waiting for connection... Active: {self.active_connections}/{self.max_connections}, Queue: {self.pool.qsize()}")
        try:
            conn = self.pool.get(timeout=5)  # Wait max 5 seconds
            conn_id = self.connection_ids.get(id(conn))
            if conn_id:
                self.connection_times[conn_id] = time.time()
            return conn
        except Empty:
            # Log detailed error for debugging
            print(f"Connection pool exhausted! Active: {self.active_connections}/{self.max_connections}, Queue size: {self.pool.qsize()}")
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
                time.sleep(60)  # Check every minute
                current_time = time.time()
                expired_conn_ids = []
                
                # Find expired connections
                for conn_id, last_used in list(self.connection_times.items()):
                    if current_time - last_used > self.connection_timeout:
                        expired_conn_ids.append(conn_id)
                
                # Clean up expired connections (they'll be removed from pool naturally)
                for conn_id in expired_conn_ids:
                    self.connection_times.pop(conn_id, None)
                        
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
                    # - min: 5 connections always ready (increased for better responsiveness)
                    # - max: 30 concurrent connections (increased to handle more load)
                    # - timeout: 90 seconds (reduced to recycle faster)
                    # 
                    # Increase max_connections if you still see exhaustion errors
                    # Decrease connection_timeout if connections are held too long
                    _connection_pool = DatabaseConnectionPool(
                        min_connections=5, 
                        max_connections=30,
                        connection_timeout=90
                    )
                    print("Database connection pool initialized: 5 min, 30 max, 90s timeout")
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

def get_db_conn():
    """Legacy function - maintained for backwards compatibility"""
    return get_connection_pool().get_connection()
