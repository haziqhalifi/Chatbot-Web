"""
Email notification service for sending notification emails to subscribed users
"""
from typing import List, Optional
from utils.email_sender import send_email
from database.connection import DatabaseConnection
import os


def get_users_with_email_subscription() -> List[dict]:
    """Get all users who have email in their notification methods"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Get users with email subscription
            cursor.execute("""
                SELECT DISTINCT u.id, u.email, u.name, s.notification_methods
                FROM users u
                INNER JOIN user_subscriptions s ON u.id = s.user_id
                WHERE s.is_active = 1 
                    AND s.notification_methods LIKE '%email%'
                    AND u.email IS NOT NULL
                    AND u.email != ''
            """)
            
            users = []
            for row in cursor.fetchall():
                users.append({
                    "user_id": row[0],
                    "email": row[1],
                    "name": row[2],
                    "notification_methods": row[3]
                })
            
            cursor.close()
            return users
        
    except Exception as e:
        print(f"Error getting users with email subscription: {e}")
        return []


def get_users_with_email_for_targeted_notification(disaster_type: str, location: str) -> List[dict]:
    """Get users who subscribed to email notifications for specific disaster type and location"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Get users with matching subscriptions and email enabled
            cursor.execute("""
                SELECT DISTINCT u.id, u.email, u.name
                FROM users u
                INNER JOIN user_subscriptions s ON u.id = s.user_id
                WHERE s.is_active = 1 
                    AND s.notification_methods LIKE '%email%'
                    AND u.email IS NOT NULL
                    AND u.email != ''
                    AND (
                        s.disaster_types LIKE ? 
                        OR s.disaster_types LIKE '%"all"%'
                    )
                    AND (
                        s.locations LIKE ?
                        OR s.locations LIKE '%"all"%'
                    )
            """, (f'%{disaster_type}%', f'%{location}%'))
            
            users = []
            for row in cursor.fetchall():
                users.append({
                    "user_id": row[0],
                    "email": row[1],
                    "name": row[2]
                })
            
            cursor.close()
            return users
        
    except Exception as e:
        print(f"Error getting targeted users with email subscription: {e}")
        return []


def send_notification_email(user_email: str, user_name: str, title: str, message: str, 
                           notification_type: str = "info", disaster_type: str = None, 
                           location: str = None) -> bool:
    """Send a notification email to a user"""
    try:
        # Check if SMTP is configured
        smtp_host = os.getenv("SMTP_HOST")
        if not smtp_host or smtp_host.strip() == "":
            print("SMTP not configured, skipping email notification")
            return False
        
        # Build email subject and body
        subject = f"[DisasterWatch] {title}"
        
        # Format notification type badge
        type_badges = {
            "info": "ℹ️ Information",
            "success": "✅ Success",
            "warning": "⚠️ Warning",
            "danger": "🚨 Alert"
        }
        type_badge = type_badges.get(notification_type, "📢 Notification")
        
        # Build email body
        body_parts = [
            f"Hello {user_name or 'User'},\n",
            f"\n{type_badge}\n",
            f"\n{title}\n",
            f"\n{message}\n"
        ]
        
        if disaster_type:
            body_parts.append(f"\nDisaster Type: {disaster_type}")
        
        if location:
            body_parts.append(f"\nLocation: {location}")
        
        body_parts.extend([
            "\n\n" + "-" * 50,
            "\nThis is an automated notification from DisasterWatch.",
            "\nTo manage your notification preferences, please log in to your account.",
            "\n\nStay safe!",
            "\nThe DisasterWatch Team"
        ])
        
        body_text = ''.join(body_parts)
        
        # Send email
        send_email(
            to_email=user_email,
            subject=subject,
            body_text=body_text
        )
        
        print(f"Email notification sent to {user_email}")
        return True
        
    except Exception as e:
        print(f"Error sending email notification to {user_email}: {e}")
        return False


def send_system_notification_emails(title: str, message: str, notification_type: str = "info",
                                    user_ids: Optional[List[int]] = None) -> dict:
    """Send system notification emails to users who have email enabled"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Get users with email subscription
            if user_ids:
                # Get specific users with email subscription
                placeholders = ','.join('?' * len(user_ids))
                query = f"""
                    SELECT DISTINCT u.id, u.email, u.name
                    FROM users u
                    INNER JOIN user_subscriptions s ON u.id = s.user_id
                    WHERE u.id IN ({placeholders})
                        AND s.is_active = 1 
                        AND s.notification_methods LIKE '%email%'
                        AND u.email IS NOT NULL
                        AND u.email != ''
                """
                cursor.execute(query, user_ids)
            else:
                # Get all users with email subscription
                cursor.execute("""
                    SELECT DISTINCT u.id, u.email, u.name
                    FROM users u
                    INNER JOIN user_subscriptions s ON u.id = s.user_id
                    WHERE s.is_active = 1 
                        AND s.notification_methods LIKE '%email%'
                        AND u.email IS NOT NULL
                        AND u.email != ''
                """)
            
            users = cursor.fetchall()
            cursor.close()
            
            emails_sent = 0
            emails_failed = 0
            
            for row in users:
                user_id, user_email, user_name = row
                if send_notification_email(user_email, user_name, title, message, notification_type):
                    emails_sent += 1
                else:
                    emails_failed += 1
            
            return {
                "emails_sent": emails_sent,
                "emails_failed": emails_failed,
                "total_users": len(users)
            }
        
    except Exception as e:
        print(f"Error sending system notification emails: {e}")
        return {
            "emails_sent": 0,
            "emails_failed": 0,
            "total_users": 0,
            "error": str(e)
        }


def send_targeted_notification_emails(disaster_type: str, location: str, title: str, 
                                      message: str, notification_type: str = "warning") -> dict:
    """Send targeted notification emails to users based on disaster type and location"""
    users = get_users_with_email_for_targeted_notification(disaster_type, location)
    
    emails_sent = 0
    emails_failed = 0
    
    for user in users:
        if send_notification_email(
            user_email=user["email"],
            user_name=user["name"],
            title=title,
            message=message,
            notification_type=notification_type,
            disaster_type=disaster_type,
            location=location
        ):
            emails_sent += 1
        else:
            emails_failed += 1
    
    return {
        "emails_sent": emails_sent,
        "emails_failed": emails_failed,
        "total_users": len(users)
    }
