import os
import pyodbc
from dotenv import load_dotenv
from datetime import datetime

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

SQL_SERVER = os.getenv("SQL_SERVER")
SQL_DATABASE = os.getenv("SQL_DATABASE")
SQL_USER = os.getenv("SQL_USER")
SQL_PASSWORD = os.getenv("SQL_PASSWORD")

conn_str = (
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={SQL_SERVER};"
    f"DATABASE={SQL_DATABASE};"
    f"UID={SQL_USER};"
    f"PWD={SQL_PASSWORD}"
)

def get_db_conn():
    return pyodbc.connect(conn_str)

def insert_report(report):
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO reports (user_id, title, location, disaster_type, description, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                report.user_id,
                report.title,
                report.location,
                report.disaster_type,
                report.description,
                report.timestamp
            )
        )
        conn.commit()
        return {"message": "Report saved successfully"}
    except Exception as e:
        raise Exception(f"Database error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

def update_users_table():
    """Add new columns to users table if they don't exist"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Check if columns exist first before trying to add them
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users'
        """)
        existing_columns = [row[0].lower() for row in cursor.fetchall()]
        
        # Add basic profile columns
        if 'name' not in existing_columns:
            cursor.execute("ALTER TABLE users ADD name NVARCHAR(255)")
            
        if 'language' not in existing_columns:
            cursor.execute("ALTER TABLE users ADD language NVARCHAR(50) DEFAULT 'English'")
            
        if 'role' not in existing_columns:
            cursor.execute("ALTER TABLE users ADD role NVARCHAR(50) DEFAULT 'Public'")
        
        # Add Google authentication specific columns
        if 'given_name' not in existing_columns:
            cursor.execute("ALTER TABLE users ADD given_name NVARCHAR(255)")
            
        if 'family_name' not in existing_columns:
            cursor.execute("ALTER TABLE users ADD family_name NVARCHAR(255)")
            
        if 'profile_picture' not in existing_columns:
            cursor.execute("ALTER TABLE users ADD profile_picture NVARCHAR(1000)")
            
        if 'email_verified' not in existing_columns:
            cursor.execute("ALTER TABLE users ADD email_verified BIT DEFAULT 0")
            
        if 'auth_provider' not in existing_columns:
            cursor.execute("ALTER TABLE users ADD auth_provider NVARCHAR(50) DEFAULT 'local'")
            
        # Add additional profile information columns
        if 'phone' not in existing_columns:
            cursor.execute("ALTER TABLE users ADD phone NVARCHAR(20)")
            
        if 'address' not in existing_columns:
            cursor.execute("ALTER TABLE users ADD address NVARCHAR(500)")
            
        if 'city' not in existing_columns:
            cursor.execute("ALTER TABLE users ADD city NVARCHAR(100)")
            
        if 'country' not in existing_columns:
            cursor.execute("ALTER TABLE users ADD country NVARCHAR(100)")
            
        if 'timezone' not in existing_columns:
            cursor.execute("ALTER TABLE users ADD timezone NVARCHAR(50)")
            
        if 'created_at' not in existing_columns:
            cursor.execute("ALTER TABLE users ADD created_at DATETIME DEFAULT GETDATE()")
            
        if 'updated_at' not in existing_columns:
            cursor.execute("ALTER TABLE users ADD updated_at DATETIME DEFAULT GETDATE()")
            
        if 'last_login' not in existing_columns:
            cursor.execute("ALTER TABLE users ADD last_login DATETIME")
            
        conn.commit()
        print("Database schema updated successfully with new user fields")
    except Exception as e:
        print(f"Database update error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

def get_all_reports():
    """Fetch all reports from the database with user information"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                r.id,
                r.title,
                r.location,
                r.disaster_type,
                r.description,
                r.timestamp,
                r.user_id,
                u.name as reporter_name,
                u.email as reporter_email,
                u.phone as reporter_phone
            FROM reports r
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.timestamp DESC
        """)
        
        reports = []
        for row in cursor.fetchall():            report = {
                "id": row[0],
                "title": row[1],
                "location": row[2],
                "type": row[3],  # disaster_type
                "description": row[4],
                "timestamp": format_timestamp(row[5]),
                "user_id": row[6],
                "reportedBy": row[7] or "Unknown User",
                "reporterEmail": row[8] or "",
                "reporterPhone": row[9] or "",
                # Default values for fields not in database yet
                "severity": "Medium",  # Default severity
                "status": "Active",   # Default status
                "coordinates": "",    # Not stored yet
                "affectedPeople": 0,  # Not stored yet
                "estimatedDamage": "Unknown", # Not stored yet
                "responseTeam": "Emergency Response Team", # Default
                "images": [],         # Not implemented yet
                "updates": []         # Not implemented yet
            }
        reports.append(report)
        
        return {"reports": reports}
    except Exception as e:
        raise Exception(f"Database error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

def get_report_by_id(report_id):
    """Fetch a specific report by ID"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                r.id,
                r.title,
                r.location,
                r.disaster_type,
                r.description,
                r.timestamp,
                r.user_id,
                u.name as reporter_name,
                u.email as reporter_email,
                u.phone as reporter_phone
            FROM reports r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.id = ?        """, (report_id,))
        
        row = cursor.fetchone()
        if not row:
            return None
            
        report = {
            "id": row[0],
            "title": row[1],
            "location": row[2],
            "type": row[3],
            "description": row[4],
            "timestamp": format_timestamp(row[5]),
            "user_id": row[6],
            "reportedBy": row[7] or "Unknown User",
            "reporterEmail": row[8] or "",
            "reporterPhone": row[9] or "",
            # Default values
            "severity": "Medium",
            "status": "Active",
            "coordinates": "",
            "affectedPeople": 0,
            "estimatedDamage": "Unknown",
            "responseTeam": "Emergency Response Team",
            "images": [],
            "updates": []
        }
        
        return report
    except Exception as e:
        raise Exception(f"Database error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

def update_database_schema():
    """Update database schema including notifications table"""
    update_users_table()
    
    # Create notifications table
    from notifications import create_notifications_table
    create_notifications_table()

def get_admin_dashboard_stats():
    """Get dashboard statistics for admin"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Get total reports count
        cursor.execute("SELECT COUNT(*) FROM reports")
        total_reports = cursor.fetchone()[0]
        
        # Get active reports (assuming reports are active by default)
        cursor.execute("SELECT COUNT(*) FROM reports WHERE timestamp >= DATEADD(day, -7, GETDATE())")
        active_alerts = cursor.fetchone()[0]
        
        # Get total users count
        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]
        
        # Get reports by type for the last 30 days
        cursor.execute("""
            SELECT disaster_type, COUNT(*) as count 
            FROM reports 
            WHERE timestamp >= DATEADD(day, -30, GETDATE())
            GROUP BY disaster_type
            ORDER BY count DESC
        """)
        report_types = []
        for row in cursor.fetchall():
            report_types.append({"type": row[0], "count": row[1]})
        
        # Get recent reports (last 10)
        cursor.execute("""
            SELECT TOP 10
                r.id,
                r.title,
                r.location,
                r.disaster_type,
                r.timestamp,
                u.name as reporter_name
            FROM reports r
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.timestamp DESC
        """)
        
        recent_reports = []
        for row in cursor.fetchall():
            recent_reports.append({
                "id": row[0],
                "title": row[1] if row[1] else f"{row[3]} Report",
                "location": row[2] or "Unknown Location",
                "type": row[3] or "Unknown",
                "timestamp": format_timestamp(row[4]),
                "reporter": row[5] or "Anonymous",
                "severity": "Medium",  # Default since we don't have severity in DB yet
                "status": "Active"     # Default since we don't have status in DB yet
            })
        
        return {
            "total_reports": total_reports,
            "active_alerts": active_alerts,
            "total_users": total_users,
            "response_teams": 8,  # Static for now
            "report_types": report_types,
            "recent_reports": recent_reports
        }
        
    except Exception as e:
        raise Exception(f"Database error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

def get_system_status():
    """Get system status information"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Test database connection
        cursor.execute("SELECT 1")
        db_status = "operational"
        
        # Get latest report timestamp to check if system is receiving data
        cursor.execute("SELECT TOP 1 timestamp FROM reports ORDER BY timestamp DESC")
        latest_report = cursor.fetchone()
        
        monitoring_status = "active" if latest_report else "inactive"
        
        return {
            "database": db_status,
            "monitoring": monitoring_status,
            "api": "operational",
            "uptime": "99.9%"
        }
        
    except Exception as e:
        return {
            "database": "error",
            "monitoring": "error", 
            "api": "error",
            "uptime": "0%"
        }
    finally:
        try:
            conn.close()
        except:
            pass
