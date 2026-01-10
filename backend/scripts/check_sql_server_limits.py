"""
Check your SQL Server's connection limits and capacity.
This helps you determine the maximum safe pool size.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import DatabaseConnection

def check_sql_server_limits():
    """Check SQL Server connection and configuration limits"""
    
    print("=" * 80)
    print("SQL SERVER CONNECTION LIMITS CHECKER")
    print("=" * 80)
    print()
    
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Check max connections setting
            print("[1] Checking Server Max Connections...")
            cursor.execute("SELECT @@MAX_CONNECTIONS AS MaxConnections")
            row = cursor.fetchone()
            max_conn = row[0]
            
            if max_conn == 0:
                print(f"    Result: UNLIMITED (default)")
                print(f"    Note: Actual limit is 32,767 but practical limit is much lower")
                practical_max = "100-500 for typical server"
            else:
                print(f"    Result: {max_conn} connections")
                practical_max = max_conn
            
            print()
            
            # Check current active connections
            print("[2] Checking Current Active Connections...")
            cursor.execute("""
                SELECT COUNT(*) as ActiveConnections
                FROM sys.dm_exec_sessions
                WHERE is_user_process = 1
            """)
            row = cursor.fetchone()
            active_conn = row[0]
            print(f"    Result: {active_conn} active connections right now")
            print()
            
            # Check SQL Server version
            print("[3] Checking SQL Server Version...")
            cursor.execute("SELECT @@VERSION")
            version = cursor.fetchone()[0]
            print(f"    {version.split('\\n')[0]}")
            print()
            
            # Check server memory
            print("[4] Checking Server Memory Configuration...")
            cursor.execute("""
                SELECT 
                    (physical_memory_kb / 1024) AS PhysicalMemoryMB,
                    (virtual_memory_kb / 1024) AS VirtualMemoryMB
                FROM sys.dm_os_sys_info
            """)
            row = cursor.fetchone()
            print(f"    Physical Memory: {row[0]:,} MB")
            print(f"    Virtual Memory: {row[1]:,} MB")
            print()
            
            # Recommendations
            print("=" * 80)
            print("RECOMMENDATIONS")
            print("=" * 80)
            
            # Calculate safe pool size based on available memory and realistic limits
            memory_mb = row[0]  # Physical memory
            
            # Memory-based calculation: Each connection ~6MB, leave 50% free for SQL Server
            memory_based_max = int((memory_mb * 0.5) / 6)
            
            # Cap at reasonable limits even if SQL Server allows more
            if max_conn == 0 or max_conn > 10000:
                # Use memory-based calculation, capped at sensible limits
                practical_limit = min(memory_based_max, 500)  # Cap at 500
                safe_max = min(100, practical_limit)
                recommended_max = min(200, practical_limit)
                aggressive_max = min(300, practical_limit)
            else:
                # Use percentage of configured max
                practical_limit = max_conn
                safe_max = min(100, int(max_conn * 0.3))
                recommended_max = min(200, int(max_conn * 0.5))
                aggressive_max = min(300, int(max_conn * 0.7))
            
            print(f"""
Connection Pool Sizing Recommendations:

Based on your server capacity:
- Physical Memory: {memory_mb:,} MB
- SQL Server Max Connections: {max_conn if max_conn > 0 else 'Unlimited (32,767)'}
- Current Active: {active_conn} connections
- Practical Limit: ~{practical_limit} concurrent connections

1. CONSERVATIVE (Start Here - Recommended):
   DB_POOL_MAX_SIZE={safe_max}
   DB_POOL_MIN_SIZE={max(5, safe_max // 10)}
   
   👍 Best for: Testing, development, small apps
   👍 Low risk, good performance
   
2. MODERATE (If you outgrow conservative):
   DB_POOL_MAX_SIZE={recommended_max}
   DB_POOL_MIN_SIZE={max(10, recommended_max // 10)}
   
   👍 Best for: Production apps, 50-100 concurrent users
   👍 Balanced performance and safety
   
3. AGGRESSIVE (Only if monitoring shows need):
   DB_POOL_MAX_SIZE={aggressive_max}
   DB_POOL_MIN_SIZE={max(15, aggressive_max // 10)}
   
   ⚠️  Best for: High-traffic production, 100+ concurrent users
   ⚠️  Monitor database CPU and memory closely

Current Status:
- Active Connections: {active_conn}
- Your .env setting: DB_POOL_MAX_SIZE=100 (MODERATE)
- Recommendation: {'✅ Good choice!' if 100 <= recommended_max else '⚠️  Can increase to ' + str(recommended_max)}

IMPORTANT NOTES:
- Each connection uses ~4-8MB of server memory
- Your server can theoretically handle {practical_limit}+ connections
- But more connections = more overhead = slower queries
- Start with MODERATE (100) and increase only if needed
- Monitor /health/database/stats to see actual usage

To adjust, edit your .env file:
    DB_POOL_MAX_SIZE=100   # Change this number
    DB_POOL_MIN_SIZE=10
    DB_POOL_TIMEOUT=60
""")
            
    except Exception as e:
        print(f"ERROR: Failed to connect to SQL Server")
        print(f"Error: {e}")
        print()
        print("Make sure:")
        print("1. SQL Server is running")
        print("2. Your .env file has correct connection settings")
        print("3. You have permissions to query sys tables")
        return 1
    
    print("=" * 80)
    return 0

if __name__ == "__main__":
    exit(check_sql_server_limits())
