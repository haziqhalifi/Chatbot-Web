from fastapi import APIRouter, HTTPException, Header, Query
from pydantic import BaseModel
from typing import Optional
import os
from database import (
    get_admin_dashboard_stats, get_system_status, get_all_faqs, 
    get_faq_by_id, add_faq, update_faq, delete_faq
)
from utils.chat import verify_api_key
from utils.performance import get_performance_stats

router = APIRouter()

class FAQCreate(BaseModel):
    question: str
    answer: str
    category: Optional[str] = None
    order_index: Optional[int] = 0

class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    order_index: Optional[int] = None

class AdminNotificationRequest(BaseModel):
    title: str
    message: str
    report_id: Optional[int] = None
    type: str = "disaster_alert"
    target_area: Optional[str] = None
    disaster_type: Optional[str] = None  # Add disaster_type field

# Dashboard endpoints
@router.get("/admin/dashboard/stats")
def get_dashboard_stats(x_api_key: str = Header(None)):
    """Get dashboard statistics for admin dashboard"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        stats = get_admin_dashboard_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/system/status")
def get_admin_system_status(x_api_key: str = Header(None)):
    """Get system status for admin dashboard"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        status = get_system_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# RAG endpoints removed - RAG feature has been deprecated

@router.get("/performance")
def get_performance_metrics(x_api_key: str = Header(None)):
    """Get performance metrics (requires API key)"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    return get_performance_stats()

# FAQ endpoints
@router.get("/faqs")
def get_faqs():
    """Get all active FAQs"""
    try:
        faqs = get_all_faqs()
        return {"faqs": faqs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/faqs/{faq_id}")
def get_faq(faq_id: int):
    """Get a specific FAQ by ID"""
    try:
        faq = get_faq_by_id(faq_id)
        if not faq:
            raise HTTPException(status_code=404, detail="FAQ not found")
        return faq
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/faqs")
def create_faq(faq: FAQCreate, x_api_key: str = Header(None)):
    """Create a new FAQ (Admin only)"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        faq_id = add_faq(faq.question, faq.answer, faq.category, faq.order_index)
        if faq_id:
            return {"message": "FAQ created successfully", "faq_id": faq_id}
        else:
            raise HTTPException(status_code=500, detail="Failed to create FAQ")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/faqs/{faq_id}")
def update_faq_endpoint(faq_id: int, faq: FAQUpdate, x_api_key: str = Header(None)):
    """Update an existing FAQ (Admin only)"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        success = update_faq(
            faq_id, 
            faq.question, 
            faq.answer, 
            faq.category, 
            faq.order_index
        )
        if success:
            return {"message": "FAQ updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="FAQ not found or failed to update")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/admin/faqs/{faq_id}")
def delete_faq_endpoint(faq_id: int, x_api_key: str = Header(None)):
    """Delete an FAQ (Admin only)"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        success = delete_faq(faq_id)
        if success:
            return {"message": "FAQ deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="FAQ not found or failed to delete")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# User management endpoints
@router.get("/admin/users")
def get_all_users(x_api_key: str = Header(None)):
    """Get all users for admin management"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        from database.connection import DatabaseConnection
        
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 
                    id, email, name, role, auth_provider, 
                    created_at, last_login, email_verified,
                    phone, city, country, account_status, 
                    status_reason, status_updated_at
                FROM users 
                ORDER BY created_at DESC
            """)
            
            columns = [column[0] for column in cursor.description]
            users = []
            for row in cursor.fetchall():
                user_dict = dict(zip(columns, row))
                # Convert datetime objects to string
                if user_dict.get('created_at'):
                    user_dict['created_at'] = user_dict['created_at'].isoformat()
                if user_dict.get('last_login'):
                    user_dict['last_login'] = user_dict['last_login'].isoformat()
                if user_dict.get('status_updated_at'):
                    user_dict['status_updated_at'] = user_dict['status_updated_at'].isoformat()
                # Set default account status if null
                if not user_dict.get('account_status'):
                    user_dict['account_status'] = 'active'
                users.append(user_dict)
            
            return {"users": users, "total": len(users)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")

@router.post("/admin/users/{user_id}/promote")
def promote_user_to_admin(user_id: int, x_api_key: str = Header(None)):
    """Promote a user to admin role"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        from database.connection import DatabaseConnection
        
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Check if user exists
            cursor.execute("SELECT id, email, role FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Update user role to admin
            cursor.execute("UPDATE users SET role = 'admin' WHERE id = ?", (user_id,))
            conn.commit()
            
            return {
                "message": "User promoted to admin successfully",
                "user_id": user_id,
                "email": user[1]
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to promote user: {str(e)}")

@router.post("/admin/users/{user_id}/demote")
def demote_admin_to_user(user_id: int, x_api_key: str = Header(None)):
    """Demote an admin back to regular user"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        from database.connection import DatabaseConnection
        
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Check if user exists
            cursor.execute("SELECT id, email, role FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Update user role to Public
            cursor.execute("UPDATE users SET role = 'Public' WHERE id = ?", (user_id,))
            conn.commit()
            
            return {
                "message": "Admin demoted to user successfully",
                "user_id": user_id,
                "email": user[1]
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to demote user: {str(e)}")

@router.post("/admin/users/{user_id}/suspend")
def suspend_user(user_id: int, x_api_key: str = Header(None), reason: Optional[str] = Query(None)):
    """Suspend a user account"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        from database.connection import DatabaseConnection
        
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Check if user exists
            cursor.execute("SELECT id, email, account_status FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Update user status to suspended
            cursor.execute("""
                UPDATE users 
                SET account_status = 'suspended', 
                    status_reason = ?, 
                    status_updated_at = GETDATE()
                WHERE id = ?
            """, (reason or "Suspended by admin", user_id))
            conn.commit()
            
            return {
                "message": "User suspended successfully",
                "user_id": user_id,
                "email": user[1],
                "status": "suspended"
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to suspend user: {str(e)}")

@router.post("/admin/users/{user_id}/block")
def block_user(user_id: int, x_api_key: str = Header(None), reason: Optional[str] = Query(None)):
    """Block a user account"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        from database.connection import DatabaseConnection
        
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Check if user exists
            cursor.execute("SELECT id, email, account_status FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Update user status to blocked
            cursor.execute("""
                UPDATE users 
                SET account_status = 'blocked', 
                    status_reason = ?, 
                    status_updated_at = GETDATE()
                WHERE id = ?
            """, (reason or "Blocked by admin", user_id))
            conn.commit()
            
            return {
                "message": "User blocked successfully",
                "user_id": user_id,
                "email": user[1],
                "status": "blocked"
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to block user: {str(e)}")

@router.post("/admin/users/{user_id}/unblock")
def unblock_user(user_id: int, x_api_key: str = Header(None)):
    """Unblock/reactivate a user account"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        from database.connection import DatabaseConnection
        
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Check if user exists
            cursor.execute("SELECT id, email, account_status FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Update user status to active
            cursor.execute("""
                UPDATE users 
                SET account_status = 'active', 
                    status_reason = NULL, 
                    status_updated_at = GETDATE()
                WHERE id = ?
            """, (user_id,))
            conn.commit()
            
            return {
                "message": "User account reactivated successfully",
                "user_id": user_id,
                "email": user[1],
                "status": "active"
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unblock user: {str(e)}")

# Admin notification endpoint
@router.post("/admin/notifications/send")
def send_admin_notification(notification: AdminNotificationRequest, x_api_key: str = Header(None)):
    """Send custom notification to users (Admin only)"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        # Import notification services
        from services.notification_service import create_system_notification
        from services.subscription_service import create_targeted_disaster_notification        # Send notification to all users or targeted users based on target_area
        if notification.target_area:
            # Use the actual disaster type from the notification, or extract from report
            disaster_type = notification.disaster_type or "alert"
            
            # Send targeted notification based on location and disaster type
            result = create_targeted_disaster_notification(
                disaster_type=disaster_type,
                location=notification.target_area,
                title=notification.title,
                message=notification.message,
                notification_type=notification.type
            )
            
            # If no targeted users found, fall back to system-wide notification
            if result.get('users_notified', 0) == 0:
                print(f"No subscribers found for {disaster_type} in {notification.target_area}, sending system-wide notification")
                result = create_system_notification(
                    title=notification.title,
                    message=notification.message,
                    notification_type=notification.type,
                    user_ids=None  # Send to all users
                )
                # Update the result to indicate it was sent system-wide
                if isinstance(result, dict) and 'message' in result:
                    result['message'] += " (sent to all users - no specific subscribers found)"
        else:
            # Send system-wide notification
            result = create_system_notification(
                title=notification.title,
                message=notification.message,
                notification_type=notification.type,
                user_ids=None  # Send to all users
            )
          # Return success response with recipient count
        if isinstance(result, dict):
            recipients_count = result.get('users_notified', 0) or result.get('notifications_sent', 0) or 1
        else:
            recipients_count = 1
        
        return {
            "message": "Notification sent successfully",
            "recipients_count": recipients_count,
            "report_id": notification.report_id,
            "type": notification.type,
            "details": result.get('message', '') if isinstance(result, dict) else str(result)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send notification: {str(e)}")
