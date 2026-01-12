from .connection import DatabaseConnection, format_timestamp

def update_disaster_reports_table():
    """Add status and admin_notes columns to disaster_reports table if they don't exist"""
    try:
        with DatabaseConnection() as conn:
            conn.autocommit = False
            cursor = conn.cursor()
            
            # Check if status column exists
            cursor.execute("""
                IF NOT EXISTS (
                    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'disaster_reports' AND COLUMN_NAME = 'status'
                )
                BEGIN
                    ALTER TABLE disaster_reports 
                    ADD status NVARCHAR(50) DEFAULT 'PENDING'
                END
            """)
            
            # Check if admin_notes column exists
            cursor.execute("""
                IF NOT EXISTS (
                    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'disaster_reports' AND COLUMN_NAME = 'admin_notes'
                )
                BEGIN
                    ALTER TABLE disaster_reports 
                    ADD admin_notes NVARCHAR(MAX) NULL
                END
            """)
            
            # Check if updated_at column exists
            cursor.execute("""
                IF NOT EXISTS (
                    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'disaster_reports' AND COLUMN_NAME = 'updated_at'
                )
                BEGIN
                    ALTER TABLE disaster_reports 
                    ADD updated_at DATETIME DEFAULT GETDATE()
                END
            """)
            
            # Check if reviewed_by column exists (admin user_id who reviewed)
            cursor.execute("""
                IF NOT EXISTS (
                    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'disaster_reports' AND COLUMN_NAME = 'reviewed_by'
                )
                BEGIN
                    ALTER TABLE disaster_reports 
                    ADD reviewed_by INT NULL
                END
            """)
            
            # Check if severity column exists
            cursor.execute("""
                IF NOT EXISTS (
                    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'disaster_reports' AND COLUMN_NAME = 'severity'
                )
                BEGIN
                    ALTER TABLE disaster_reports 
                    ADD severity NVARCHAR(50) DEFAULT 'Medium'
                END
            """)
            
            # Check if coordinates column exists
            cursor.execute("""
                IF NOT EXISTS (
                    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'disaster_reports' AND COLUMN_NAME = 'coordinates'
                )
                BEGIN
                    ALTER TABLE disaster_reports 
                    ADD coordinates NVARCHAR(100) NULL
                END
            """)
            
            # Check if affected_people column exists
            cursor.execute("""
                IF NOT EXISTS (
                    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'disaster_reports' AND COLUMN_NAME = 'affected_people'
                )
                BEGIN
                    ALTER TABLE disaster_reports 
                    ADD affected_people INT DEFAULT 0
                END
            """)
            
            # Check if estimated_damage column exists
            cursor.execute("""
                IF NOT EXISTS (
                    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'disaster_reports' AND COLUMN_NAME = 'estimated_damage'
                )
                BEGIN
                    ALTER TABLE disaster_reports 
                    ADD estimated_damage NVARCHAR(255) NULL
                END
            """)
            
            # Check if response_team column exists
            cursor.execute("""
                IF NOT EXISTS (
                    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'disaster_reports' AND COLUMN_NAME = 'response_team'
                )
                BEGIN
                    ALTER TABLE disaster_reports 
                    ADD response_team NVARCHAR(255) NULL
                END
            """)
            
            conn.commit()
            conn.autocommit = True
            cursor.close()
            print("disaster_reports table updated successfully")
            return True
    except Exception as e:
        print(f"Error updating disaster_reports table: {e}")
        return False

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
                    u.phone as reporter_phone,
                    r.status,
                    r.admin_notes,
                    r.updated_at,
                    r.reviewed_by,
                    admin.name as reviewer_name,
                    r.severity,
                    r.coordinates,
                    r.affected_people,
                    r.estimated_damage,
                    r.response_team
                FROM disaster_reports r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN users admin ON r.reviewed_by = admin.id
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
                    "status": row[10] or "PENDING",
                    "adminNotes": row[11] or "",
                    "updatedAt": format_timestamp(row[12]) if row[12] else None,
                    "reviewedBy": row[13],
                    "reviewerName": row[14] or "",
                    "severity": row[15] or "Medium",
                    "coordinates": row[16] or "",
                    "affectedPeople": row[17] or 0,
                    "estimatedDamage": row[18] or "Unknown",
                    "responseTeam": row[19] or "Emergency Response Team",
                    # Not implemented yet
                    "images": [],
                    "updates": []
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
                    u.phone as reporter_phone,
                    r.status,
                    r.admin_notes,
                    r.updated_at,
                    r.reviewed_by,
                    admin.name as reviewer_name,
                    r.severity,
                    r.coordinates,
                    r.affected_people,
                    r.estimated_damage,
                    r.response_team
                FROM disaster_reports r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN users admin ON r.reviewed_by = admin.id
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
                "status": row[10] or "PENDING",
                "adminNotes": row[11] or "",
                "updatedAt": format_timestamp(row[12]) if row[12] else None,
                "reviewedBy": row[13],
                "reviewerName": row[14] or "",
                "severity": row[15] or "Medium",
                "coordinates": row[16] or "",
                "affectedPeople": row[17] or 0,
                "estimatedDamage": row[18] or "Unknown",
                "responseTeam": row[19] or "Emergency Response Team",
                "images": [],
                "updates": []
            }
            
            return report
    except Exception as e:
        raise Exception(f"Database error: {e}")

def update_report_status(report_id, status, admin_notes=None, reviewed_by=None, 
                        severity=None, coordinates=None, affected_people=None, 
                        estimated_damage=None, response_team=None):
    """Update disaster report status and admin information
    
    Args:
        report_id: ID of the report to update
        status: New status (PENDING, APPROVED, DECLINED, UNDER_REVIEW)
        admin_notes: Optional admin notes/comments
        reviewed_by: ID of admin who reviewed the report
        severity: Disaster severity (Low, Medium, High, Critical)
        coordinates: GPS coordinates of the disaster
        affected_people: Number of people affected
        estimated_damage: Estimated damage amount or description
        response_team: Assigned response team
    """
    try:
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # First check if report exists
            cursor.execute("SELECT id FROM disaster_reports WHERE id = ?", (report_id,))
            if not cursor.fetchone():
                cursor.close()
                raise Exception("Report not found")
            
            # Build dynamic UPDATE query based on provided parameters
            update_fields = ["status = ?", "updated_at = GETDATE()"]
            params = [status]
            
            if admin_notes is not None:
                update_fields.append("admin_notes = ?")
                params.append(admin_notes)
            
            if reviewed_by is not None:
                update_fields.append("reviewed_by = ?")
                params.append(reviewed_by)
            
            if severity is not None:
                update_fields.append("severity = ?")
                params.append(severity)
            
            if coordinates is not None:
                update_fields.append("coordinates = ?")
                params.append(coordinates)
            
            if affected_people is not None:
                update_fields.append("affected_people = ?")
                params.append(affected_people)
            
            if estimated_damage is not None:
                update_fields.append("estimated_damage = ?")
                params.append(estimated_damage)
            
            if response_team is not None:
                update_fields.append("response_team = ?")
                params.append(response_team)
            
            params.append(report_id)
            
            # Execute the update
            query = f"""
                UPDATE disaster_reports 
                SET {', '.join(update_fields)}
                WHERE id = ?
            """
            
            cursor.execute(query, params)
            
            if not conn.autocommit:
                conn.commit()
            
            cursor.close()
            return {"message": "Report updated successfully"}
    except Exception as e:
        raise Exception(f"Database error: {e}")

__all__ = ['insert_report', 'get_all_reports', 'get_report_by_id', 'update_report_status', 'update_disaster_reports_table']
