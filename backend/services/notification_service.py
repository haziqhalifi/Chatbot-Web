from fastapi import HTTPException
from database import get_db_conn
from datetime import datetime
from typing import List, Optional
import json

# --- Notification-related database logic ---

def create_notifications_table():
    """Create notifications table if it doesn't exist"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Check if table exists
        cursor.execute("""
            SELECT * FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'notifications'
        """)
        
        if cursor.fetchone():
            print("Notifications table already exists")
            # Check if we need to add new columns
            update_notifications_table_schema()
            return
            
        # Create notifications table with enhanced schema
        cursor.execute("""
            CREATE TABLE notifications (
                id INT IDENTITY(1,1) PRIMARY KEY,
                user_id INT NOT NULL,
                title NVARCHAR(255) NOT NULL,
                message NVARCHAR(1000) NOT NULL,
                type NVARCHAR(50) DEFAULT 'info', -- info, warning, danger, success
                disaster_type NVARCHAR(100) NULL, -- Type of disaster (flood, earthquake, etc.)
                location NVARCHAR(255) NULL, -- Location of the disaster/event
                read_status BIT DEFAULT 0,
                created_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        # Create index for better query performance
        cursor.execute("""
            CREATE INDEX IX_notifications_user_id ON notifications(user_id)
        """)
        cursor.execute("""
            CREATE INDEX IX_notifications_read_status ON notifications(read_status)
        """)
        cursor.execute("""
            CREATE INDEX IX_notifications_created_at ON notifications(created_at)
        """)
        cursor.execute("""
            CREATE INDEX IX_notifications_disaster_type ON notifications(disaster_type)
        """)
        cursor.execute("""
            CREATE INDEX IX_notifications_location ON notifications(location)
        """)
        
        conn.commit()
        print("Notifications table created successfully with enhanced schema")
        
    except Exception as e:
        print(f"Error creating notifications table: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

def update_notifications_table_schema():
    """Update existing notifications table to add disaster_type and location columns"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Check if updated_at column exists and drop it
        cursor.execute("""
            SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'notifications' AND COLUMN_NAME = 'updated_at'
        """)
        if cursor.fetchone()[0] > 0:
            print("Dropping updated_at column from notifications table...")
            
            # First drop the default constraint if it exists
            cursor.execute("""
                DECLARE @constraint_name nvarchar(200)
                SELECT @constraint_name = NAME FROM SYS.DEFAULT_CONSTRAINTS
                WHERE PARENT_OBJECT_ID = OBJECT_ID('notifications')
                AND PARENT_COLUMN_ID = (SELECT column_id FROM sys.columns WHERE NAME = N'updated_at' AND object_id = OBJECT_ID(N'notifications'))
                IF @constraint_name IS NOT NULL
                EXEC('ALTER TABLE notifications DROP CONSTRAINT ' + @constraint_name)
            """)

            cursor.execute("ALTER TABLE notifications DROP COLUMN updated_at")
            print("updated_at column dropped.")

        # Check if disaster_type column exists
        cursor.execute("""
            SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'notifications' AND COLUMN_NAME = 'disaster_type'
        """)
        
        if cursor.fetchone()[0] == 0:
            print("Adding disaster_type column to notifications table...")
            cursor.execute("""
                ALTER TABLE notifications 
                ADD disaster_type NVARCHAR(100) NULL
            """)
            
            # Create index for disaster_type
            cursor.execute("""
                CREATE INDEX IX_notifications_disaster_type ON notifications(disaster_type)
            """)
        
        # Check if location column exists
        cursor.execute("""
            SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'notifications' AND COLUMN_NAME = 'location'
        """)
        
        if cursor.fetchone()[0] == 0:
            print("Adding location column to notifications table...")
            cursor.execute("""
                ALTER TABLE notifications 
                ADD location NVARCHAR(255) NULL
            """)
            
            # Create index for location
            cursor.execute("""
                CREATE INDEX IX_notifications_location ON notifications(location)
            """)
        
        conn.commit()
        print("Notifications table schema updated successfully")
        
    except Exception as e:
        print(f"Error updating notifications table schema: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

def create_notification(user_id: int, title: str, message: str, notification_type: str = "info", 
                      disaster_type: str = None, location: str = None):
    """Create a new notification for a user"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO notifications (user_id, title, message, type, disaster_type, location, created_at)
            VALUES (?, ?, ?, ?, ?, ?, GETDATE())
        """, (user_id, title, message, notification_type, disaster_type, location))
        
        # Get the inserted notification ID
        cursor.execute("SELECT @@IDENTITY")
        notification_id = cursor.fetchone()[0]
        
        conn.commit()
        return {"message": "Notification created successfully", "id": notification_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

def get_user_notifications(user_id: int, limit: int = 50, offset: int = 0, unread_only: bool = False):
    """Get notifications for a specific user"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Build query based on filters
        where_clause = "WHERE user_id = ?"
        params = [user_id]
        
        if unread_only:
            where_clause += " AND read_status = 0"
        
        query = f"""
            SELECT id, user_id, title, message, type, disaster_type, location, read_status, created_at
            FROM notifications
            {where_clause}
            ORDER BY created_at DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        """
        
        params.extend([offset, limit])
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        notifications = []
        for row in rows:
            notifications.append({
                "id": row[0],
                "user_id": row[1],
                "title": row[2],
                "message": row[3],
                "type": row[4],
                "disaster_type": row[5],
                "location": row[6],
                "read": bool(row[7]),
                "timestamp": row[8].isoformat() if row[8] else None
            })
        
        # Get total count for pagination
        count_query = f"""
            SELECT COUNT(*) FROM notifications {where_clause}
        """
        cursor.execute(count_query, params[:-2])  # Remove offset and limit params
        total_count = cursor.fetchone()[0]
        
        return {
            "notifications": notifications,
            "total": total_count,
            "unread_count": get_unread_count(user_id)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

def get_unread_count(user_id: int):
    """Get count of unread notifications for a user"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT COUNT(*) FROM notifications 
            WHERE user_id = ? AND read_status = 0
        """, (user_id,))
        
        count = cursor.fetchone()[0]
        return count
        
    except Exception as e:
        return 0
    finally:
        try:
            conn.close()
        except:
            pass

def mark_notification_as_read(notification_id: int, user_id: int):
    """Mark a specific notification as read"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE notifications 
            SET read_status = 1
            WHERE id = ? AND user_id = ?
        """, (notification_id, user_id))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        conn.commit()
        return {"message": "Notification marked as read"}
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

def mark_all_notifications_as_read(user_id: int):
    """Mark all notifications as read for a user"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE notifications 
            SET read_status = 1
            WHERE user_id = ? AND read_status = 0
        """, (user_id,))
        
        updated_count = cursor.rowcount
        conn.commit()
        
        return {"message": f"{updated_count} notifications marked as read"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

def delete_notification(notification_id: int, user_id: int):
    """Delete a specific notification"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM notifications 
            WHERE id = ? AND user_id = ?
        """, (notification_id, user_id))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        conn.commit()
        return {"message": "Notification deleted"}
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

def clear_all_notifications(user_id: int):
    """Delete all notifications for a user"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM notifications 
            WHERE user_id = ?
        """, (user_id,))
        
        deleted_count = cursor.rowcount
        conn.commit()
        
        return {"message": f"{deleted_count} notifications deleted"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

def create_system_notification(title: str, message: str, notification_type: str = "info", user_ids: Optional[List[int]] = None):
    """Create system notifications for specific users or all users"""
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # If no specific user IDs provided, send to all users
        if user_ids is None:
            cursor.execute("SELECT id FROM users")
            user_ids = [row[0] for row in cursor.fetchall()]
          # Create notifications for each user
        created_count = 0
        for user_id in user_ids:
            try:
                cursor.execute("""
                    INSERT INTO notifications (user_id, title, message, type, created_at)
                    VALUES (?, ?, ?, ?, GETDATE())
                """, (user_id, title, message, notification_type))
                created_count += 1
            except Exception as e:
                print(f"Failed to create notification for user {user_id}: {e}")
                continue
        
        conn.commit()
        return {
            "message": f"System notification sent to {created_count} users",
            "users_notified": created_count,
            "notifications_sent": created_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

# Utility functions for automatic notifications

def create_welcome_notification(user_id: int):
    """Create a welcome notification for new users"""
    return create_notification(
        user_id=user_id,
        title="Welcome to Disaster Response Chat!",
        message="Welcome to our disaster response platform. You can now report emergencies, get help, and stay informed about disaster updates in your area.",
        notification_type="success"
    )

def create_report_confirmation_notification(user_id: int, report_title: str):
    """Create a notification when user submits a disaster report"""
    return create_notification(
        user_id=user_id,
        title="Report Submitted Successfully",
        message=f"Your disaster report '{report_title}' has been submitted and is being reviewed by our response team.",
        notification_type="success"
    )

def create_emergency_alert_notification(user_ids: List[int], disaster_type: str, location: str):
    """Create emergency alert notifications for affected users"""
    title = f"Emergency Alert: {disaster_type}"
    message = f"Emergency alert for {location}. Please follow safety instructions and stay informed through official channels."
    
    return create_system_notification(
        title=title,
        message=message,
        notification_type="danger",
        user_ids=user_ids
    )
