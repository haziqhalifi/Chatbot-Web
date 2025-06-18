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
            INSERT INTO disaster_reports (user_id, title, location, disaster_type, description, timestamp)
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
    """Fetch all disaster reports from the database with user information"""
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
            FROM disaster_reports r
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.timestamp DESC        """)
        
        reports = []
        for row in cursor.fetchall():
            report = {
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
            FROM disaster_reports r
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

# === CHAT FUNCTIONS ===

def create_chat_session(user_id, title=None):
    """Create a new chat session for a user"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Auto-generate title if not provided
        if not title:
            title = f"Chat {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        
        cursor.execute("""
            INSERT INTO chat_sessions (user_id, title) 
            OUTPUT INSERTED.id, INSERTED.title, INSERTED.created_at, INSERTED.updated_at
            VALUES (?, ?)
        """, (user_id, title))
        
        row = cursor.fetchone()
        conn.commit()
        
        return {
            "id": row[0],
            "user_id": user_id,
            "title": row[1],
            "created_at": format_timestamp(row[2]),
            "updated_at": format_timestamp(row[3]),
            "is_active": True
        }
        
    except Exception as e:
        print(f"Error creating chat session: {e}")
        raise
    finally:
        try:
            conn.close()
        except:
            pass

def get_user_chat_sessions(user_id, limit=20, offset=0):
    """Get user's chat sessions with pagination"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, title, created_at, updated_at, is_active
            FROM chat_sessions 
            WHERE user_id = ? AND is_active = 1
            ORDER BY updated_at DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        """, (user_id, offset, limit))
        
        sessions = []
        for row in cursor.fetchall():
            sessions.append({
                "id": row[0],
                "title": row[1],
                "created_at": format_timestamp(row[2]),
                "updated_at": format_timestamp(row[3]),
                "is_active": bool(row[4])
            })
        
        return sessions
        
    except Exception as e:
        print(f"Error getting user chat sessions: {e}")
        raise
    finally:
        try:
            conn.close()
        except:
            pass

def get_chat_session(session_id, user_id):
    """Get specific chat session details"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, user_id, title, created_at, updated_at, is_active
            FROM chat_sessions 
            WHERE id = ? AND user_id = ? AND is_active = 1
        """, (session_id, user_id))
        
        row = cursor.fetchone()
        if not row:
            return None
            
        return {
            "id": row[0],
            "user_id": row[1],
            "title": row[2],
            "created_at": format_timestamp(row[3]),
            "updated_at": format_timestamp(row[4]),
            "is_active": bool(row[5])
        }
        
    except Exception as e:
        print(f"Error getting chat session: {e}")
        raise
    finally:
        try:
            conn.close()
        except:
            pass

def save_chat_message(session_id, sender_type, content, message_type="text"):
    """Save a chat message to a session"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # First verify the session exists
        cursor.execute("SELECT user_id FROM chat_sessions WHERE id = ? AND is_active = 1", (session_id,))
        if not cursor.fetchone():
            raise Exception("Session not found or inactive")
        
        # Insert the message
        cursor.execute("""
            INSERT INTO chat_messages (session_id, sender_type, content, message_type)
            OUTPUT INSERTED.id, INSERTED.timestamp
            VALUES (?, ?, ?, ?)
        """, (session_id, sender_type, content, message_type))
        
        row = cursor.fetchone()
        
        # Update session's updated_at timestamp
        cursor.execute("""
            UPDATE chat_sessions 
            SET updated_at = GETDATE() 
            WHERE id = ?
        """, (session_id,))
        
        conn.commit()
        
        return {
            "id": row[0],
            "session_id": session_id,
            "sender_type": sender_type,
            "content": content,
            "message_type": message_type,
            "timestamp": format_timestamp(row[1])
        }
        
    except Exception as e:
        print(f"Error saving chat message: {e}")
        raise
    finally:
        try:
            conn.close()
        except:
            pass

def get_chat_messages(session_id, user_id, limit=50, offset=0):
    """Get messages for a chat session"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # First verify the session belongs to the user
        cursor.execute("SELECT id FROM chat_sessions WHERE id = ? AND user_id = ? AND is_active = 1", (session_id, user_id))
        if not cursor.fetchone():
            return []
        
        # Get messages
        cursor.execute("""
            SELECT id, sender_type, content, message_type, timestamp
            FROM chat_messages 
            WHERE session_id = ?
            ORDER BY timestamp ASC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        """, (session_id, offset, limit))
        
        messages = []
        for row in cursor.fetchall():
            messages.append({
                "id": row[0],
                "sender_type": row[1],
                "content": row[2],
                "message_type": row[3],
                "timestamp": format_timestamp(row[4])
            })
        
        return messages
        
    except Exception as e:
        print(f"Error getting chat messages: {e}")
        raise
    finally:
        try:
            conn.close()
        except:
            pass

def update_chat_session_title(session_id, user_id, title):
    """Update chat session title"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE chat_sessions 
            SET title = ?, updated_at = GETDATE()
            WHERE id = ? AND user_id = ? AND is_active = 1
        """, (title, session_id, user_id))
        
        conn.commit()
        return cursor.rowcount > 0
        
    except Exception as e:
        print(f"Error updating chat session title: {e}")
        raise
    finally:
        try:
            conn.close()
        except:
            pass

def delete_chat_session(session_id, user_id):
    """Soft delete a chat session (mark as inactive)"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE chat_sessions 
            SET is_active = 0, updated_at = GETDATE()
            WHERE id = ? AND user_id = ?
        """, (session_id, user_id))
        
        conn.commit()
        return cursor.rowcount > 0
        
    except Exception as e:
        print(f"Error deleting chat session: {e}")
        raise
    finally:
        try:
            conn.close()
        except:
            pass

def create_chat_tables():
    """Create chat sessions and messages tables"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        print("Creating chat tables...")
        
        # Create chat_sessions table
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'chat_sessions')
            CREATE TABLE chat_sessions (
                id INT IDENTITY(1,1) PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(500),
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE(),
                is_active BIT DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        print("chat_sessions table created/verified")
        
        # Create chat_messages table
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'chat_messages')
            CREATE TABLE chat_messages (
                id INT IDENTITY(1,1) PRIMARY KEY,
                session_id INT NOT NULL,
                sender_type VARCHAR(10) NOT NULL, -- 'user' or 'bot'
                content TEXT NOT NULL,
                timestamp DATETIME DEFAULT GETDATE(),
                message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'voice', 'image'
                FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
            )
        """)
        print("chat_messages table created/verified")
        
        # Create indexes for better performance
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_chat_sessions_user_id')
            CREATE INDEX IX_chat_sessions_user_id ON chat_sessions(user_id)
        """)
        
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_chat_messages_session_id')
            CREATE INDEX IX_chat_messages_session_id ON chat_messages(session_id)
        """)
        
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_chat_messages_timestamp')
            CREATE INDEX IX_chat_messages_timestamp ON chat_messages(timestamp)
        """)
        
        conn.commit()
        print("Chat tables and indexes created successfully")
        
    except Exception as e:
        print(f"Error creating chat tables: {e}")
        raise e
    finally:
        try:
            conn.close()
        except:
            pass

def update_database_schema():
    """Update database schema including notifications table"""
    update_users_table()
    
    # Create notifications table
    from services.notification_service import create_notifications_table
    create_notifications_table()
    
    # Create chat tables
    create_chat_tables()
    
    # Create system reports table
    create_system_reports_table()

def get_admin_dashboard_stats():
    """Get dashboard statistics for admin"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Get total reports count
        cursor.execute("SELECT COUNT(*) FROM disaster_reports")
        total_reports = cursor.fetchone()[0]
        
        # Get active reports (assuming reports are active by default)
        cursor.execute("SELECT COUNT(*) FROM disaster_reports WHERE timestamp >= DATEADD(day, -7, GETDATE())")
        active_alerts = cursor.fetchone()[0]
        
        # Get total users count
        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]
        
        # Get reports by type for the last 30 days
        cursor.execute("""
            SELECT disaster_type, COUNT(*) as count 
            FROM disaster_reports 
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
            FROM disaster_reports r
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
        cursor.execute("SELECT TOP 1 timestamp FROM disaster_reports ORDER BY timestamp DESC")
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

def create_system_reports_table():
    """Create system_reports table if it doesn't exist"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()

        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='system_reports' AND xtype='U')
            CREATE TABLE system_reports (
                id INT IDENTITY(1,1) PRIMARY KEY,
                user_id INT NOT NULL,
                issue_type NVARCHAR(100) NOT NULL,
                subject NVARCHAR(255) NOT NULL,
                description NVARCHAR(MAX) NOT NULL,
                status NVARCHAR(50) DEFAULT 'Open',
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        
        conn.commit()
        print("System reports table created successfully")
    except Exception as e:
        print(f"Error creating system reports table: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

def insert_system_report(report):

        # Check if the reports table exists and disaster_reports doesn't
        cursor.execute("""
            SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'reports'
        """)
        reports_exists = cursor.fetchone()[0] > 0
        
        cursor.execute("""
            SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'disaster_reports'
        """)
        disaster_reports_exists = cursor.fetchone()[0] > 0
        
        # Rename reports table to disaster_reports if it exists and disaster_reports doesn't exist
        if reports_exists and not disaster_reports_exists:
            print("Renaming 'reports' table to 'disaster_reports'...")
            cursor.execute("EXEC sp_rename 'reports', 'disaster_reports'")
            print("Successfully renamed table.")
        
        # Check if system_reports table exists
        cursor.execute("""
            SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'system_reports'
        """)
        system_reports_exists = cursor.fetchone()[0] > 0
        
        # Create system_reports table if it doesn't exist
        if not system_reports_exists:
            print("Creating 'system_reports' table...")
            cursor.execute("""
                CREATE TABLE system_reports (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    user_id INT NOT NULL,
                    subject NVARCHAR(255) NOT NULL,
                    message NVARCHAR(MAX) NOT NULL,
                    status NVARCHAR(50) DEFAULT 'PENDING',
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME DEFAULT GETDATE(),
                    resolved_at DATETIME NULL,
                    admin_notes NVARCHAR(MAX) NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)
            print("Successfully created 'system_reports' table.")
        
        conn.commit()
        cursor.close()
        conn.close()
        print("Database migration completed successfully.")
        return True
        
    except Exception as e:
        print(f"Migration failed: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def insert_system_report(user_id, subject, message):
    """Insert a new system report"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            INSERT INTO system_reports (user_id, issue_type, subject, description, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                report.user_id,
                report.issue_type,
                report.subject,
                report.description,
                report.timestamp
            )
        )
        conn.commit()
        
        # Get the inserted report ID
        cursor.execute("SELECT SCOPE_IDENTITY()")
        report_id = cursor.fetchone()[0]
        
        return {"message": "System report submitted successfully", "report_id": report_id}
    except Exception as e:
        raise Exception(f"Database error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

        cursor.execute(
            """
            INSERT INTO system_reports (user_id, subject, message, status, created_at)
            VALUES (?, ?, ?, 'PENDING', GETDATE())
            """,
            (user_id, subject, message)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "System report submitted successfully", "status": "success"}
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        raise Exception(f"Failed to insert system report: {str(e)}")

def get_all_system_reports():
    """Fetch all system reports with user information"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                sr.id,
                sr.issue_type,
                sr.subject,
                sr.description,
                sr.status,
                sr.created_at,
                sr.updated_at,
                sr.user_id,
                u.name as reporter_name,
                u.email as reporter_email
            FROM system_reports sr
            LEFT JOIN users u ON sr.user_id = u.id
            ORDER BY sr.created_at DESC
        """)
        
        reports = []
        for row in cursor.fetchall():
            report = {
                "id": row[0],
                "issue_type": row[1],
                "subject": row[2],
                "description": row[3],
                "status": row[4],
                "created_at": format_timestamp(row[5]),
                "updated_at": format_timestamp(row[6]),
                "user_id": row[7],
                "reporter_name": row[8] or "Unknown User",
                "reporter_email": row[9] or ""
            }
            reports.append(report)
        
        return {"system_reports": reports}
    except Exception as e:
        raise Exception(f"Database error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

def get_system_report_by_id(report_id):
    """Fetch a specific system report by ID"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                sr.id,
                sr.issue_type,
                sr.subject,
                sr.description,
                sr.status,
                sr.created_at,
                sr.updated_at,
                sr.user_id,
                u.name as reporter_name,
                u.email as reporter_email
            FROM system_reports sr
            LEFT JOIN users u ON sr.user_id = u.id
            WHERE sr.id = ?
        """, (report_id,))
        
        row = cursor.fetchone()
        if not row:
            return None
        
        report = {
            "id": row[0],
            "issue_type": row[1],
            "subject": row[2],
            "description": row[3],
            "status": row[4],
            "created_at": format_timestamp(row[5]),
            "updated_at": format_timestamp(row[6]),
            "user_id": row[7],
            "reporter_name": row[8] or "Unknown User",
            "reporter_email": row[9] or ""
        }
        
        return report
    except Exception as e:
        raise Exception(f"Database error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

def update_system_report_status(report_id, status):
    """Update the status of a system report"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE system_reports 
            SET status = ?, updated_at = GETDATE()
            WHERE id = ?
            """,
            (status, report_id)
        )
        conn.commit()
        
        if cursor.rowcount == 0:
            raise Exception("Report not found")
        
        return {"message": f"System report status updated to {status}"}
    except Exception as e:
        raise Exception(f"Database error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

        cursor.execute(
            """
            SELECT 
                sr.id,
                sr.user_id,
                u.name as user_name,
                u.email as user_email,
                sr.subject,
                sr.message,
                sr.status,
                sr.created_at,
                sr.updated_at,
                sr.resolved_at,
                sr.admin_notes
            FROM system_reports sr
            LEFT JOIN users u ON sr.user_id = u.id
            ORDER BY sr.created_at DESC
            """
        )
        
        system_reports = []
        for row in cursor.fetchall():
            report = {
                "id": row[0],
                "user_id": row[1],
                "user_name": row[2],
                "user_email": row[3],
                "subject": row[4],
                "message": row[5],
                "status": row[6],
                "created_at": row[7].isoformat() if row[7] else None,
                "updated_at": row[8].isoformat() if row[8] else None,
                "resolved_at": row[9].isoformat() if row[9] else None,
                "admin_notes": row[10]
            }
            system_reports.append(report)
        
        cursor.close()
        conn.close()
        return {"system_reports": system_reports}
    except Exception as e:
        if 'conn' in locals():
            conn.close()
        raise Exception(f"Failed to fetch system reports: {str(e)}")
 

