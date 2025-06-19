from .connection import DatabaseConnection

def insert_system_report(user_id, subject, message):
    """Insert a new system report"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO system_reports (user_id, subject, message, status, created_at)
                VALUES (?, ?, ?, 'PENDING', GETDATE())
                """,
                (user_id, subject, message)
            )
            if not conn.autocommit:
                conn.commit()
            cursor.close()
            return {"message": "System report submitted successfully", "status": "success"}
    except Exception as e:
        raise Exception(f"Failed to insert system report: {str(e)}")

def get_all_system_reports():
    """Fetch all system reports with user information"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
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
            return {"system_reports": system_reports}
    except Exception as e:
        raise Exception(f"Failed to fetch system reports: {str(e)}")

__all__ = ['insert_system_report', 'get_all_system_reports']
