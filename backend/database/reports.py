from .connection import DatabaseConnection, format_timestamp

def insert_report(report):
    """Insert a disaster report into the database"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO disaster_reports (user_id, title, location, disaster_type, description, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    report.user_id,
                    report.title,
                    report.location,
                    report.disaster_type,
                    report.description,
                    report.created_at
                )
            )
            if not conn.autocommit:
                conn.commit()
            cursor.close()
            return {"message": "Report saved successfully"}
    except Exception as e:
        raise Exception(f"Database error: {e}")

def get_all_reports():
    """Fetch all disaster reports from the database with user information"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 
                    r.id,
                    r.title,
                    r.location,
                    r.disaster_type,
                    r.description,
                    r.created_at,
                    r.user_id,
                    u.name as reporter_name,
                    u.email as reporter_email,
                    u.phone as reporter_phone
                FROM disaster_reports r
                LEFT JOIN users u ON r.user_id = u.id
                ORDER BY r.created_at DESC
            """)
            
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
            
            cursor.close()
            return {"reports": reports}
    except Exception as e:
        raise Exception(f"Database error: {e}")

def get_report_by_id(report_id):
    """Fetch a specific report by ID"""
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 
                    r.id,
                    r.title,
                    r.location,
                    r.disaster_type,
                    r.description,
                    r.created_at,
                    r.user_id,
                    u.name as reporter_name,
                    u.email as reporter_email,
                    u.phone as reporter_phone
                FROM disaster_reports r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.id = ?
            """, (report_id,))
            
            row = cursor.fetchone()
            cursor.close()
            
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

__all__ = ['insert_report', 'get_all_reports', 'get_report_by_id']
