from fastapi import HTTPException
from database.connection import DatabaseConnection
from middleware.database_middleware import with_database_connection
from datetime import datetime
from typing import List, Optional, Dict
import json

# --- Subscription-related database logic ---

@with_database_connection(max_retries=3, retry_delay=0.5)
def create_subscriptions_table():
    """Create subscription tables if they don't exist"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Check if table exists
            cursor.execute("""
                SELECT * FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = 'user_subscriptions'
            """)
            if cursor.fetchone():
                print("User subscriptions table already exists")
                return
                
            # Create user_subscriptions table
            cursor.execute("""
                CREATE TABLE user_subscriptions (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    user_id INT NOT NULL,
                    disaster_types NVARCHAR(500), -- JSON array of disaster types
                    locations NVARCHAR(500), -- JSON array of locations/areas
                    notification_methods NVARCHAR(200) DEFAULT 'web', -- web, email, sms (future)
                    radius_km INT DEFAULT 10, -- Alert radius in kilometers for location-based alerts
                    is_active BIT DEFAULT 1,
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            """)
            
            # Create index for better query performance
            cursor.execute("""
                CREATE INDEX IX_user_subscriptions_user_id ON user_subscriptions(user_id)
            """)
            cursor.execute("""
                CREATE INDEX IX_user_subscriptions_active ON user_subscriptions(is_active)
            """)
            
            conn.commit()
            print("User subscriptions table created successfully")
        
    except Exception as e:
        print(f"Error creating user subscriptions table: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

@with_database_connection(max_retries=3, retry_delay=0.5)
def get_user_subscription(user_id: int):
    """Get user's notification subscription preferences"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT id, disaster_types, locations, notification_methods, 
                       radius_km, is_active, created_at, updated_at
                FROM user_subscriptions 
                WHERE user_id = ? AND is_active = 1
            """, (user_id,))
            
            row = cursor.fetchone()
            if row:
                return {
                    "id": row[0],
                    "user_id": user_id,
                    "disaster_types": json.loads(row[1]) if row[1] else [],
                    "locations": json.loads(row[2]) if row[2] else [],
                    "notification_methods": row[3].split(',') if row[3] else ['web'],
                    "radius_km": row[4],
                    "is_active": bool(row[5]),
                    "created_at": row[6].isoformat(),
                    "updated_at": row[7].isoformat()
                }
            else:
                # Return default subscription settings
                return {
                    "id": None,
                    "user_id": user_id,
                    "disaster_types": [],
                    "locations": [],
                    "notification_methods": ['web'],
                    "radius_km": 10,
                    "is_active": True,
                    "created_at": None,
                    "updated_at": None
                }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@with_database_connection(max_retries=3, retry_delay=0.5)
def create_or_update_subscription(user_id: int, disaster_types: List[str], 
                                locations: List[str], notification_methods: List[str], 
                                radius_km: int = 10):
    """Create or update user's notification subscription"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Check if subscription exists
            cursor.execute("""
                SELECT id FROM user_subscriptions WHERE user_id = ? AND is_active = 1
            """, (user_id,))
            
            existing = cursor.fetchone()
            
            disaster_types_json = json.dumps(disaster_types)
            locations_json = json.dumps(locations)
            methods_str = ','.join(notification_methods)
            
            if existing:
                # Update existing subscription
                cursor.execute("""
                    UPDATE user_subscriptions 
                    SET disaster_types = ?, locations = ?, notification_methods = ?, 
                        radius_km = ?, updated_at = GETDATE()
                    WHERE user_id = ? AND is_active = 1
                """, (disaster_types_json, locations_json, methods_str, radius_km, user_id))
                subscription_id = existing[0]
            else:
                # Create new subscription
                cursor.execute("""
                    INSERT INTO user_subscriptions 
                    (user_id, disaster_types, locations, notification_methods, radius_km, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, GETDATE(), GETDATE())
                """, (user_id, disaster_types_json, locations_json, methods_str, radius_km))
                
                cursor.execute("SELECT @@IDENTITY")
                subscription_id = cursor.fetchone()[0]
            
            conn.commit()
            return {
            "message": "Subscription updated successfully", 
            "subscription_id": subscription_id,
            "user_id": user_id,
            "disaster_types": disaster_types,
            "locations": locations,
            "notification_methods": notification_methods,
            "radius_km": radius_km
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        try:
            conn.close()
        except:
            pass

def delete_subscription(user_id: int):
    """Delete (deactivate) user's subscription"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE user_subscriptions 
                SET is_active = 0, updated_at = GETDATE()
                WHERE user_id = ? AND is_active = 1
            """, (user_id,))
            
            conn.commit()
            return {"message": "Subscription deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

def get_subscribed_users_for_alert(disaster_type: str, location: str) -> List[int]:
    """Get list of user IDs who should receive alerts for specific disaster type and location"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT DISTINCT user_id, disaster_types, locations 
                FROM user_subscriptions 
                WHERE is_active = 1
            """)
            
            subscribed_users = []
            rows = cursor.fetchall()
            
            for row in rows:
                user_id = row[0]
                user_disaster_types = json.loads(row[1]) if row[1] else []
                user_locations = json.loads(row[2]) if row[2] else []
                
                # Check if user is subscribed to this disaster type (case-insensitive)
                disaster_match = any(
                    dt.lower() == disaster_type.lower() 
                    for dt in user_disaster_types
                ) if user_disaster_types else True  # If no specific types, subscribe to all
                
                # Check if user is subscribed to this location (case-insensitive, partial match)
                location_match = any(
                    loc.lower() in location.lower() or location.lower() in loc.lower()
                    for loc in user_locations
                ) if user_locations else True  # If no specific locations, subscribe to all
                
                if disaster_match and location_match:
                    subscribed_users.append(user_id)
            
            return subscribed_users
        
    except Exception as e:
        print(f"Error getting subscribed users: {e}")
        return []

def get_available_disaster_types() -> List[str]:
    """Get list of available disaster types for subscription"""
    return [
        "Flood",
        "Landslide", 
        "Earthquake",
        "Fire",
        "Storm",
        "Tsunami",
        "Volcanic Eruption",
        "Drought",
        "Cyclone",
        "Tornado"
    ]

def get_popular_locations() -> List[str]:
    """Get list of popular locations/cities for subscription"""
    return [
        "Kuala Lumpur",
        "Selangor",
        "Johor",
        "Penang",
        "Sabah",
        "Sarawak",
        "Perak",
        "Kedah",
        "Kelantan",
        "Terengganu",
        "Pahang",
        "Negeri Sembilan",
        "Melaka",
        "Perlis",
        "Putrajaya",
        "Labuan"
    ]

# Notification functions with subscription support

def create_targeted_disaster_notification(disaster_type: str, location: str, 
                                        title: str, message: str, 
                                        notification_type: str = "warning"):
    """Create notifications for users subscribed to specific disaster type and location"""
    from services.notification_service import create_notification
    
    # Get users who should receive this notification
    subscribed_users = get_subscribed_users_for_alert(disaster_type, location)
    
    if not subscribed_users:
        print(f"No subscribed users found for {disaster_type} in {location}")
        return {"message": "No subscribed users found", "users_notified": 0}
    
    notifications_created = 0
    errors = []
    
    for user_id in subscribed_users:
        try:
            create_notification(user_id, title, message, notification_type, disaster_type, location)
            notifications_created += 1
        except Exception as e:
            errors.append(f"User {user_id}: {str(e)}")
    
    return {
        "message": f"Notifications sent to {notifications_created} users",
        "users_notified": notifications_created,
        "errors": errors if errors else None
    }

def create_subscription_confirmation_notification(user_id: int, disaster_types: List[str], locations: List[str]):
    """Create a notification when user updates their subscription"""
    from services.notification_service import create_notification
    
    types_str = ", ".join(disaster_types) if disaster_types else "All types"
    locations_str = ", ".join(locations) if locations else "All locations"
    
    title = "Notification Preferences Updated"
    message = f"Your disaster alert preferences have been updated. You will now receive notifications for: {types_str} in {locations_str}."
    
    return create_notification(user_id, title, message, "success")
