# Severity Assignment Changes - Summary

## Changes Implemented

### 1. Database Schema Update

- **Removed** default value 'Medium' from severity column
- **Set** severity to NULL by default for new reports
- Dropped constraint: `DF__disaster___sever__6FB49575`
- Column now: `severity NVARCHAR(50) NULL` (no default)

### 2. Backend Changes

**File: `backend/database/reports.py`**

- Updated `update_disaster_reports_table()` to add severity column as NULL (line 57-67)
- Modified `get_all_reports()` to return `None` instead of 'Medium' for NULL severity (line 196)
- Modified `get_report_by_id()` to return `None` instead of 'Medium' for NULL severity (line 270)

### 3. Frontend Changes

**Display Changes:**

- **ReportsTable.jsx** - Shows "N/A" badge (gray) for unassigned severity
- **ReportDetailModal.jsx** - Shows "N/A" badge for unassigned severity
- **NotificationModal.jsx** - Shows "N/A" badge for unassigned severity
- **UpdateReportModal.jsx** - Added "-- Select Severity --" as default option

**Form Changes:**

- **Reports/index.jsx** - Changed default from 'Medium' to empty string when opening update modal (line 230)

### 4. Severity Values Display

Severity levels are shown in **normal case** (not uppercase):

- Critical (red)
- High (orange)
- Medium (yellow)
- Low (green)
- N/A (gray) - for unassigned

## Migration Results

- **2 reports** reset from 'Medium' to NULL
- **1 report** kept 'High' (manually assigned by admin)
- **Total reports**: 12

## Testing

✓ New reports have NULL severity by default
✓ Frontend displays "N/A" for NULL severity
✓ Admin can assign severity through Update Report modal
✓ Severity values display in normal case format

## User Workflow

1. User submits disaster report → severity = NULL, status = PENDING
2. Report appears in admin dashboard with "N/A" severity badge
3. Admin reviews report and assigns appropriate severity level
4. Severity displays in normal case with color-coded badge
