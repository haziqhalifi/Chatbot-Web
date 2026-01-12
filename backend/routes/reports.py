from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
import jwt
import os
from database import insert_report, get_all_reports, get_report_by_id, get_db_conn, insert_system_report, migrate_reports_tables, get_all_system_reports, update_report_status
from utils.chat import verify_api_key
from services.notification_service import create_report_confirmation_notification
from services.subscription_service import create_targeted_disaster_notification
from datetime import datetime
import json
import csv
import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT

router = APIRouter()

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret")
JWT_ALGORITHM = "HS256"

class ReportRequest(BaseModel):
    title: str
    location: str
    disaster_type: str
    description: str
    created_at: Optional[str] = None

class SystemReportRequest(BaseModel):
    subject: str
    message: str

class UpdateReportStatusRequest(BaseModel):
    status: str  # PENDING, APPROVED, DECLINED, UNDER_REVIEW
    admin_notes: Optional[str] = None
    severity: Optional[str] = None  # Low, Medium, High, Critical
    coordinates: Optional[str] = None  # GPS coordinates
    affected_people: Optional[int] = None  # Number of affected people
    estimated_damage: Optional[str] = None  # Damage estimate
    response_team: Optional[str] = None  # Assigned response team

def get_user_id_from_token(authorization: str):
    """Helper function to extract user_id from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required. Please sign in.")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please sign in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token. Please sign in again.")

@router.post("/report")
def submit_report(report: ReportRequest, authorization: str = Header(None)):
    """Submit disaster report with notification"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        # Validate report data
        if not report.title or not report.title.strip():
            raise HTTPException(status_code=400, detail="Report title is required")
        if not report.location or not report.location.strip():
            raise HTTPException(status_code=400, detail="Location is required")
        if not report.disaster_type:
            raise HTTPException(status_code=400, detail="Disaster type is required")
        if not report.description or not report.description.strip():
            raise HTTPException(status_code=400, detail="Description is required")
        if len(report.description.strip()) < 20:
            raise HTTPException(status_code=400, detail="Description must be at least 20 characters")
        
        # Create a complete report object with the authenticated user_id
        from types import SimpleNamespace
        complete_report = SimpleNamespace(
            user_id=user_id,
            title=report.title,
            location=report.location,
            disaster_type=report.disaster_type,
            description=report.description,
            created_at=report.created_at if report.created_at else datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        )
        
        result = insert_report(complete_report)
        
        # Create confirmation notification for the reporter
        create_report_confirmation_notification(user_id, report.title)
        
        # Create targeted notifications for subscribed users
        try:
            create_targeted_disaster_notification(
                disaster_type=report.disaster_type,
                location=report.location,
                title=f"Disaster Report: {report.disaster_type}",
                message=f"A {report.disaster_type} has been reported in {report.location}. {report.title}",
                notification_type="warning"
            )
        except Exception as e:
            print(f"Failed to send targeted notifications: {e}")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Report submission error: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit report. Please try again.")

@router.post("/system-report")
def submit_system_report(report: SystemReportRequest, authorization: str = Header(None)):
    """Submit system issue/bug report"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        # Validate report data
        if not report.subject or not report.subject.strip():
            raise HTTPException(status_code=400, detail="Subject is required")
        if not report.message or not report.message.strip():
            raise HTTPException(status_code=400, detail="Message is required")
        
        result = insert_system_report(user_id, report.subject, report.message)
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"System report error: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit report. Please try again.")

@router.get("/my-reports")
def get_my_reports(authorization: str = Header(None)):
    """Get disaster reports submitted by the authenticated user"""
    user_id = get_user_id_from_token(authorization)
    
    try:
        # Get all reports and filter by user_id
        all_reports = get_all_reports().get("reports", [])
        user_reports = [report for report in all_reports if report.get("user_id") == user_id]
        
        return {"reports": user_reports}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get reports error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve reports. Please try again.")

@router.get("/admin/reports")
def get_reports(
    q: Optional[str] = None,
    x_api_key: str = Header(None),
):
    """Get user-submitted disaster reports for admin dashboard.

    NOTE: NADMA disasters have separate endpoints:
    - GET /map/admin/nadma/history - for NADMA disaster history
    - GET /map/nadma/disasters/db - for current NADMA disasters

    Query params:
      - q: free-text search across title/location/type/description/reporter
    """
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        reports: List[dict] = []

        # Get only user-submitted disaster reports
        user_reports = get_all_reports().get("reports", [])
        for report in user_reports:
            report["source"] = "Disaster Report"
        reports.extend(user_reports)

        # Apply search filter if provided
        if q:
            needle = q.strip().lower()
            if needle:
                reports = [r for r in reports if _matches_report_query(r, needle)]

        # Keep newest first if timestamps are present
        def _sort_key(r: dict):
            return r.get("timestamp") or ""

        reports.sort(key=_sort_key, reverse=True)

        return {"reports": reports}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _matches_report_query(report: dict, needle: str) -> bool:
    haystacks = [
        str(report.get("title", "")),
        str(report.get("location", "")),
        str(report.get("type", "")),
        str(report.get("description", "")),
        str(report.get("reportedBy", "")),
        str(report.get("source", "")),
    ]
    combined = " ".join(haystacks).lower()
    return needle in combined


@router.put("/admin/reports/{report_id}/status")
def update_disaster_report_status(
    report_id: int,
    status_update: UpdateReportStatusRequest,
    authorization: str = Header(None),
    x_api_key: str = Header(None)
):
    """Update disaster report status and details (Admin only)
    
    Allows admins to:
    - Approve, decline, or update the status of user-submitted disaster reports
    - Assign severity level
    - Add GPS coordinates
    - Record number of affected people
    - Estimate damage
    - Assign response teams
    - Add administrative notes
    
    Status values:
    - PENDING: Initial state, awaiting review
    - APPROVED: Report verified and approved
    - DECLINED: Report rejected or invalid
    - UNDER_REVIEW: Currently being investigated
    
    Severity values:
    - Low: Minor incident
    - Medium: Moderate impact
    - High: Significant damage/danger
    - Critical: Extreme emergency
    """
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    # Get admin user_id from token
    admin_id = get_user_id_from_token(authorization)
    
    try:
        # Validate status value
        valid_statuses = ["PENDING", "APPROVED", "DECLINED", "UNDER_REVIEW"]
        if status_update.status not in valid_statuses:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        # Validate severity if provided
        if status_update.severity:
            valid_severities = ["Low", "Medium", "High", "Critical"]
            if status_update.severity not in valid_severities:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid severity. Must be one of: {', '.join(valid_severities)}"
                )
        
        # Validate affected_people if provided
        if status_update.affected_people is not None and status_update.affected_people < 0:
            raise HTTPException(
                status_code=400,
                detail="Affected people count cannot be negative"
            )
        
        # Update the report with all provided fields
        result = update_report_status(
            report_id=report_id,
            status=status_update.status,
            admin_notes=status_update.admin_notes,
            reviewed_by=admin_id,
            severity=status_update.severity,
            coordinates=status_update.coordinates,
            affected_people=status_update.affected_people,
            estimated_damage=status_update.estimated_damage,
            response_team=status_update.response_team
        )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        if "Report not found" in str(e):
            raise HTTPException(status_code=404, detail="Report not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/reports/{report_id}/approve")
def approve_disaster_report(
    report_id: int,
    authorization: str = Header(None),
    x_api_key: str = Header(None)
):
    """Quick action: Approve a disaster report (Admin only)
    
    This is a convenience endpoint that sets the status to APPROVED.
    For more detailed updates, use PUT /admin/reports/{report_id}/status
    """
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    admin_id = get_user_id_from_token(authorization)
    
    try:
        result = update_report_status(
            report_id=report_id,
            status="APPROVED",
            admin_notes="Report approved by admin",
            reviewed_by=admin_id
        )
        return result
    except Exception as e:
        if "Report not found" in str(e):
            raise HTTPException(status_code=404, detail="Report not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/reports/{report_id}/decline")
def decline_disaster_report(
    report_id: int,
    reason: Optional[str] = None,
    authorization: str = Header(None),
    x_api_key: str = Header(None)
):
    """Quick action: Decline a disaster report (Admin only)
    
    This is a convenience endpoint that sets the status to DECLINED.
    
    Query params:
      - reason: Optional reason for declining the report
    """
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    admin_id = get_user_id_from_token(authorization)
    
    try:
        admin_notes = f"Report declined. Reason: {reason}" if reason else "Report declined by admin"
        result = update_report_status(
            report_id=report_id,
            status="DECLINED",
            admin_notes=admin_notes,
            reviewed_by=admin_id
        )
        return result
    except Exception as e:
        if "Report not found" in str(e):
            raise HTTPException(status_code=404, detail="Report not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/reports/{report_id}/review")
def mark_under_review(
    report_id: int,
    authorization: str = Header(None),
    x_api_key: str = Header(None)
):
    """Quick action: Mark report as under review (Admin only)
    
    This is a convenience endpoint that sets the status to UNDER_REVIEW.
    """
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    admin_id = get_user_id_from_token(authorization)
    
    try:
        result = update_report_status(
            report_id=report_id,
            status="UNDER_REVIEW",
            admin_notes="Report is currently under investigation",
            reviewed_by=admin_id
        )
        return result
    except Exception as e:
        if "Report not found" in str(e):
            raise HTTPException(status_code=404, detail="Report not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/reports/{report_id}")
def get_report(report_id: int, x_api_key: str = Header(None)):
    """Get specific disaster report by ID"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        report = get_report_by_id(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/migrate-database")
def migrate_database(x_api_key: str = Header(None)):
    """Migrate database tables - rename reports to disaster_reports and create system_reports"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        success = migrate_reports_tables()
        if success:
            return {"message": "Database migration completed successfully", "status": "success"}
        else:
            raise HTTPException(status_code=500, detail="Migration failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/system-reports")
def get_system_reports(x_api_key: str = Header(None)):
    """Get all system reports for admin dashboard"""
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        result = get_all_system_reports()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/reports/export/csv")
def export_reports_csv(
    q: Optional[str] = None,
    x_api_key: str = Header(None),
):
    """Export user-submitted disaster reports as CSV
    
    NOTE: For NADMA data exports, use /map/admin/nadma/history endpoint
    """
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        reports: List[dict] = []

        # Get only user-submitted disaster reports
        user_reports = get_all_reports().get("reports", [])
        for report in user_reports:
            report["source"] = "Disaster Report"
        reports.extend(user_reports)

        if q:
            needle = q.strip().lower()
            if needle:
                reports = [r for r in reports if _matches_report_query(r, needle)]

        # Sort reports
        def _sort_key(r: dict):
            return r.get("timestamp") or ""
        reports.sort(key=_sort_key, reverse=True)

        # Create CSV
        output = io.StringIO()
        if reports:
            # Define CSV columns
            fieldnames = [
                'ID', 'Title', 'Type', 'Location', 'Coordinates', 'Severity', 
                'Status', 'Reporter', 'Email', 'Phone', 'Description', 
                'Affected People', 'Estimated Damage', 'Response Team', 
                'Timestamp', 'Source'
            ]
            
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            
            for report in reports:
                writer.writerow({
                    'ID': report.get('id', ''),
                    'Title': report.get('title', ''),
                    'Type': report.get('type', ''),
                    'Location': report.get('location', ''),
                    'Coordinates': report.get('coordinates', ''),
                    'Severity': report.get('severity', ''),
                    'Status': report.get('status', ''),
                    'Reporter': report.get('reportedBy', ''),
                    'Email': report.get('reporterEmail', ''),
                    'Phone': report.get('reporterPhone', ''),
                    'Description': report.get('description', ''),
                    'Affected People': report.get('affectedPeople', ''),
                    'Estimated Damage': report.get('estimatedDamage', ''),
                    'Response Team': report.get('responseTeam', ''),
                    'Timestamp': report.get('timestamp', ''),
                    'Source': report.get('source', '')
                })
        
        # Convert to bytes
        output.seek(0)
        csv_content = output.getvalue().encode('utf-8')
        
        # Create filename with current date
        filename = f"disaster_reports_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        return StreamingResponse(
            io.BytesIO(csv_content),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/reports/export/pdf")
def export_reports_pdf(
    q: Optional[str] = None,
    x_api_key: str = Header(None),
):
    """Export user-submitted disaster reports as PDF
    
    NOTE: For NADMA data exports, use /map/admin/nadma/history endpoint
    """
    from config.settings import API_KEY_CREDITS
    x_api_key = verify_api_key(x_api_key, API_KEY_CREDITS)
    
    try:
        reports: List[dict] = []

        # Get only user-submitted disaster reports
        user_reports = get_all_reports().get("reports", [])
        for report in user_reports:
            report["source"] = "Disaster Report"
        reports.extend(user_reports)

        if q:
            needle = q.strip().lower()
            if needle:
                reports = [r for r in reports if _matches_report_query(r, needle)]

        # Sort reports
        def _sort_key(r: dict):
            return r.get("timestamp") or ""
        reports.sort(key=_sort_key, reverse=True)

        # Create PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=18)
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Define styles
        styles = getSampleStyleSheet()
        brand_style = ParagraphStyle(
            'BrandTitle',
            parent=styles['Heading1'],
            fontSize=32,
            textColor=colors.HexColor('#DC2626'),
            spaceAfter=10,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Normal'],
            fontSize=14,
            textColor=colors.HexColor('#6B7280'),
            spaceAfter=20,
            alignment=TA_CENTER,
            fontName='Helvetica-Oblique'
        )
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=20,
            textColor=colors.HexColor('#1F2937'),
            spaceAfter=20,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1F2937'),
            spaceAfter=12,
        )
        info_style = ParagraphStyle(
            'InfoStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#4B5563'),
            spaceAfter=6,
        )
        normal_style = styles['Normal']
        
        # Add DisasterWatch branding
        brand_title = Paragraph("DisasterWatch", brand_style)
        elements.append(brand_title)
        
        brand_subtitle = Paragraph("Disaster Reporting & Management System", subtitle_style)
        elements.append(brand_subtitle)
        
        # Add separator line
        elements.append(Spacer(1, 10))
        
        # Add report title
        title = Paragraph("Disaster Reports Export", title_style)
        elements.append(title)
        
        # Add comprehensive metadata in a styled box
        meta_info = []
        meta_info.append(['Report Information', ''])
        meta_info.append(['Generated Date:', datetime.now().strftime('%Y-%m-%d')])
        meta_info.append(['Generated Time:', datetime.now().strftime('%H:%M:%S')])
        meta_info.append(['Total Reports:', str(len(reports))])
        
        # Add filter information
        meta_info.append(['Data Source:', 'User Disaster Reports'])
        
        if q:
            meta_info.append(['Search Query:', q])
        
        # Count reports by severity
        severity_counts = {}
        status_counts = {}
        type_counts = {}
        for report in reports:
            severity = report.get('severity', 'Unknown')
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
            
            status = report.get('status', 'Unknown')
            status_counts[status] = status_counts.get(status, 0) + 1
            
            report_type = report.get('type', 'Unknown')
            type_counts[report_type] = type_counts.get(report_type, 0) + 1
        
        meta_info.append(['', ''])  # Spacer
        meta_info.append(['Summary Statistics', ''])
        meta_info.append(['High Severity:', str(severity_counts.get('High', 0))])
        meta_info.append(['Medium Severity:', str(severity_counts.get('Medium', 0))])
        meta_info.append(['Low Severity:', str(severity_counts.get('Low', 0))])
        meta_info.append(['Active Reports:', str(status_counts.get('Active', 0))])
        meta_info.append(['Resolved Reports:', str(status_counts.get('Resolved', 0))])
        
        # Create metadata table
        meta_table = Table(meta_info, colWidths=[2.5*inch, 4.5*inch])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#DC2626')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 7), (-1, 7), colors.HexColor('#3B82F6')),
            ('TEXTCOLOR', (0, 7), (-1, 7), colors.whitesmoke),
            ('FONTNAME', (0, 7), (-1, 7), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, 6), [colors.white, colors.HexColor('#F9FAFB')]),
            ('ROWBACKGROUNDS', (0, 8), (-1, -1), [colors.white, colors.HexColor('#EFF6FF')]),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        elements.append(meta_table)
        elements.append(Spacer(1, 20))
        
        # Create summary table
        if reports:
            # Create a table with report summaries (first page overview)
            data = [['ID', 'Title', 'Type', 'Location', 'Severity', 'Status', 'Date']]
            
            for report in reports[:20]:  # First 20 for summary
                report_id = str(report.get('id', ''))
                if len(report_id) > 15:
                    report_id = report_id[:12] + '...'
                
                title_text = str(report.get('title', ''))
                if len(title_text) > 30:
                    title_text = title_text[:27] + '...'
                    
                location_text = str(report.get('location', ''))
                if len(location_text) > 25:
                    location_text = location_text[:22] + '...'
                
                data.append([
                    report_id,
                    title_text,
                    str(report.get('type', ''))[:15],
                    location_text,
                    str(report.get('severity', ''))[:10],
                    str(report.get('status', ''))[:10],
                    str(report.get('timestamp', ''))[:16]
                ])
            
            # Create table
            table = Table(data, colWidths=[0.8*inch, 1.8*inch, 1*inch, 1.5*inch, 0.8*inch, 0.8*inch, 1.1*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#DC2626')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')]),
            ]))
            
            elements.append(table)
            elements.append(PageBreak())
            
            # Detailed reports section
            elements.append(Paragraph("Detailed Report Information", heading_style))
            elements.append(Spacer(1, 12))
            
            for idx, report in enumerate(reports, 1):
                # Report header
                report_title = f"Report #{idx}: {report.get('title', 'Untitled')}"
                elements.append(Paragraph(report_title, heading_style))
                
                # Report details
                details = [
                    ['Field', 'Value'],
                    ['Report ID', str(report.get('id', 'N/A'))],
                    ['Disaster Type', str(report.get('type', 'N/A'))],
                    ['Location', str(report.get('location', 'N/A'))],
                    ['Coordinates', str(report.get('coordinates', 'N/A'))],
                    ['Severity Level', str(report.get('severity', 'N/A'))],
                    ['Current Status', str(report.get('status', 'N/A'))],
                    ['Reported By', str(report.get('reportedBy', 'N/A'))],
                    ['Reporter Email', str(report.get('reporterEmail', 'N/A'))],
                    ['Reporter Phone', str(report.get('reporterPhone', 'N/A'))],
                    ['Data Source', str(report.get('source', 'N/A'))],
                    ['Date & Time', str(report.get('timestamp', 'N/A'))],
                    ['Affected People', str(report.get('affectedPeople', 'N/A'))],
                    ['Estimated Damage', str(report.get('estimatedDamage', 'N/A'))],
                    ['Response Team', str(report.get('responseTeam', 'N/A'))],
                ]
                
                # Add description if available
                description = report.get('description', '')
                if description:
                    # Truncate very long descriptions
                    if len(description) > 300:
                        description = description[:297] + '...'
                    details.append(['Description', description])
                else:
                    details.append(['Description', 'No description provided'])
                
                detail_table = Table(details, colWidths=[2*inch, 5*inch])
                detail_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3B82F6')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                    ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 1), (-1, -1), 9),
                    ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#EFF6FF')),
                    ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('ROWBACKGROUNDS', (1, 1), (1, -1), [colors.white]),
                ]))
                
                elements.append(detail_table)
                elements.append(Spacer(1, 20))
                
                # Add page break every 3 detailed reports
                if idx % 3 == 0 and idx < len(reports):
                    elements.append(PageBreak())
        else:
            elements.append(Paragraph("No reports found matching the criteria.", normal_style))
        
        # Build PDF
        doc.build(elements)
        
        # Get PDF content
        buffer.seek(0)
        pdf_content = buffer.getvalue()
        
        # Create filename with current date
        filename = f"disaster_reports_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        return StreamingResponse(
            io.BytesIO(pdf_content),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
