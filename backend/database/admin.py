from .connection import DatabaseConnection, format_timestamp

def get_admin_dashboard_stats():
    """Get dashboard statistics for admin"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Get total reports count
            cursor.execute("SELECT COUNT(*) FROM disaster_reports")
            total_reports = cursor.fetchone()[0]
            
            # Get active reports (assuming reports are active by default)
            cursor.execute("SELECT COUNT(*) FROM disaster_reports WHERE created_at >= DATEADD(day, -7, GETDATE())")
            active_alerts = cursor.fetchone()[0]
            
            # Get total users count
            cursor.execute("SELECT COUNT(*) FROM users")
            total_users = cursor.fetchone()[0]
            
            # Get reports by type for the last 30 days
            cursor.execute("""
                SELECT disaster_type, COUNT(*) as count 
                FROM disaster_reports 
                WHERE created_at >= DATEADD(day, -30, GETDATE())
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
                    r.created_at,
                    u.name as reporter_name
                FROM disaster_reports r
                LEFT JOIN users u ON r.user_id = u.id
                ORDER BY r.created_at DESC
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
            
            cursor.close()
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

def get_system_status():
    """Get system status information"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Test database connection
            cursor.execute("SELECT 1")
            db_status = "operational"
            
            # Get latest report timestamp to check if system is receiving data
            cursor.execute("SELECT TOP 1 created_at FROM disaster_reports ORDER BY created_at DESC")
            latest_report = cursor.fetchone()
            
            cursor.close()
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

__all__ = ['get_admin_dashboard_stats', 'get_system_status']
