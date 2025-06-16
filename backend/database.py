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

def create_faq_table():
    """Create the FAQ table if it doesn't exist"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='faqs' AND xtype='U')
            CREATE TABLE faqs (
                id INT IDENTITY(1,1) PRIMARY KEY,
                question NVARCHAR(500) NOT NULL,
                answer NVARCHAR(MAX) NOT NULL,
                category NVARCHAR(100),
                order_index INT DEFAULT 0,
                is_active BIT DEFAULT 1,
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE()
            )
        """)
        conn.commit()
    except Exception as e:
        print(f"Error creating FAQ table: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

def insert_default_faqs():
    """Insert default FAQ data"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Check if FAQs already exist
        cursor.execute("SELECT COUNT(*) FROM faqs")
        count = cursor.fetchone()[0]
        
        if count == 0:
            default_faqs = [
                ("How do I reset my password?", "Go to the account page and click on 'Change Password'.", "Account", 1),
                ("How do I contact support?", "Use the 'Contact us' button at the bottom of the sign up page or email support@disasterwatch.com.", "Support", 2),
                ("Is my data secure?", "Yes, we use industry-standard security practices to protect your data.", "Security", 3),
                ("What can I ask the chatbot?", "You can ask about disaster-related information such as:\n• 'What areas are at risk of flooding?'\n• 'Is there any landslide reported near Rawang?'\n• 'What should I do during a flash flood?'\n• 'Show me the emergency SOP for earthquakes.'", "Chatbot", 4),
                ("Can I use voice to interact with the chatbot?", "Yes! Click the microphone icon to ask your question using your voice. Make sure to allow microphone access in your browser.", "Chatbot", 5),
                ("Which languages does the chatbot support?", "Currently, the chatbot supports English and Bahasa Melayu. You can switch your preferred language in the account settings.", "Language", 6),
                ("How accurate is the disaster information?", "The system uses data from verified sources like Pusat Geospatial Negara (PGN) and official disaster dashboards. However, always follow announcements from NADMA or local authorities during emergencies.", "Data", 7),
                ("Can I report a disaster incident?", "Yes. Go to the 'Report Incident' section, describe the event, and optionally upload a photo. Your report will be reviewed by relevant agencies.", "Reporting", 8),
                ("I can't see the map. What should I do?", "Try the following:\n• Refresh the page\n• Ensure your browser supports JavaScript\n• Allow location access if required\n• Use a modern browser like Chrome or Edge", "Troubleshooting", 9),
                ("Who can use this chatbot?", "Both public users and government officers can use the system. Government officers may have access to additional datasets or dashboard insights based on their roles.", "Access", 10),
                ("How do I change my language or voice settings?", "Go to My Account > Preferences, and select your default input and language preferences.", "Settings", 11),
                ("Where can I get emergency contact numbers?", "Click the 'Emergency Contacts' tab to view phone numbers by disaster type and region.", "Emergency", 12)
            ]
            
            for question, answer, category, order_index in default_faqs:
                cursor.execute("""
                    INSERT INTO faqs (question, answer, category, order_index, is_active)
                    VALUES (?, ?, ?, ?, 1)
                """, (question, answer, category, order_index))
            
            conn.commit()
            print("Default FAQs inserted successfully")
        
    except Exception as e:
        print(f"Error inserting default FAQs: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

def get_all_faqs():
    """Get all active FAQs ordered by order_index"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, question, answer, category, order_index, created_at, updated_at
            FROM faqs 
            WHERE is_active = 1
            ORDER BY order_index ASC, created_at ASC
        """)
        
        faqs = []
        for row in cursor.fetchall():
            faqs.append({
                'id': row[0],
                'question': row[1],
                'answer': row[2],
                'category': row[3],
                'order_index': row[4],
                'created_at': format_timestamp(row[5]),
                'updated_at': format_timestamp(row[6])
            })
        
        return faqs
    except Exception as e:
        print(f"Error getting FAQs: {e}")
        return []
    finally:
        if 'conn' in locals():
            conn.close()

def get_faq_by_id(faq_id):
    """Get a specific FAQ by ID"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, question, answer, category, order_index, created_at, updated_at
            FROM faqs 
            WHERE id = ? AND is_active = 1
        """, (faq_id,))
        
        row = cursor.fetchone()
        if row:
            return {
                'id': row[0],
                'question': row[1],
                'answer': row[2],
                'category': row[3],
                'order_index': row[4],
                'created_at': format_timestamp(row[5]),
                'updated_at': format_timestamp(row[6])
            }
        return None
    except Exception as e:
        print(f"Error getting FAQ by ID: {e}")
        return None
    finally:
        if 'conn' in locals():
            conn.close()

def add_faq(question, answer, category=None, order_index=0):
    """Add a new FAQ"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO faqs (question, answer, category, order_index, is_active)
            VALUES (?, ?, ?, ?, 1)
        """, (question, answer, category, order_index))
        conn.commit()
        return cursor.lastrowid
    except Exception as e:
        print(f"Error adding FAQ: {e}")
        return None
    finally:
        if 'conn' in locals():
            conn.close()

def update_faq(faq_id, question=None, answer=None, category=None, order_index=None):
    """Update an existing FAQ"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        updates = []
        params = []
        
        if question is not None:
            updates.append("question = ?")
            params.append(question)
        if answer is not None:
            updates.append("answer = ?")
            params.append(answer)
        if category is not None:
            updates.append("category = ?")
            params.append(category)
        if order_index is not None:
            updates.append("order_index = ?")
            params.append(order_index)
        
        if updates:
            updates.append("updated_at = GETDATE()")
            params.append(faq_id)
            
            query = f"UPDATE faqs SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
            return cursor.rowcount > 0
        
        return False
    except Exception as e:
        print(f"Error updating FAQ: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def delete_faq(faq_id):
    """Soft delete an FAQ by setting is_active to 0"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("UPDATE faqs SET is_active = 0, updated_at = GETDATE() WHERE id = ?", (faq_id,))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"Error deleting FAQ: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()
