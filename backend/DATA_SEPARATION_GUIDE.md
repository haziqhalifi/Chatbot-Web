# Data Separation Guide: NADMA vs User Disaster Reports

## Overview

This document explains the separation between NADMA official disaster data and user-submitted disaster reports in the system.

## Key Principle

**NADMA reports and user disaster reports are completely separate data sources and should NOT be mixed.**

### Data Sources

1. **User Disaster Reports** (`disaster_reports` table)

   - Reports submitted by registered users through the application
   - Stored in `disaster_reports` table
   - Managed by `database/reports.py`
   - Accessible via `/admin/reports` endpoint

2. **NADMA Disasters** (`nadma_disasters` table)
   - Official disaster data from Malaysia's National Disaster Management Agency (NADMA)
   - Synced from NADMA MyDIMS API
   - Stored in `nadma_disasters`, `nadma_categories`, `nadma_states`, `nadma_districts` tables
   - Managed by `database/nadma.py` and `services/nadma_service.py`
   - Accessible via `/map/admin/nadma/history` and `/map/nadma/disasters/db` endpoints

## API Endpoints

### User Disaster Reports

| Endpoint                     | Method | Description                             |
| ---------------------------- | ------ | --------------------------------------- |
| `/admin/reports`             | GET    | Get all user-submitted disaster reports |
| `/admin/reports/{report_id}` | GET    | Get specific user report by ID          |
| `/admin/reports/export/csv`  | GET    | Export user reports as CSV              |
| `/admin/reports/export/pdf`  | GET    | Export user reports as PDF              |
| `/my-reports`                | GET    | Get current user's reports              |
| `/report`                    | POST   | Submit new disaster report              |

### NADMA Disasters

| Endpoint                   | Method   | Description                             |
| -------------------------- | -------- | --------------------------------------- |
| `/map/admin/nadma/history` | GET      | Get NADMA disaster history (admin only) |
| `/map/nadma/disasters/db`  | GET      | Get NADMA disasters from database       |
| `/map/nadma/disasters`     | GET/POST | Fetch from NADMA API directly           |
| `/map/nadma/sync`          | POST     | Sync NADMA data to local database       |
| `/map/nadma/statistics`    | GET      | Get NADMA disaster statistics           |

## Database Schema

### User Disaster Reports Table

```sql
CREATE TABLE disaster_reports (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    location NVARCHAR(500),
    disaster_type NVARCHAR(100),
    description NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
)
```

### NADMA Disasters Table

```sql
CREATE TABLE nadma_disasters (
    id INT PRIMARY KEY,
    disaster_id INT,
    district_id INT,
    state_id INT,
    kategori_id INT,
    level_id INT,
    parish_id INT NULL,
    created_by_id INT,
    name NVARCHAR(255) NULL,
    description NVARCHAR(MAX) NULL,
    status NVARCHAR(50),
    bencana_khas NVARCHAR(50),
    is_backdated BIT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    datetime_start DATETIME,
    datetime_end DATETIME NULL,
    special_report NVARCHAR(MAX) NULL,
    created_at DATETIME,
    updated_at DATETIME,
    deleted_at DATETIME NULL,
    last_synced_at DATETIME DEFAULT GETDATE(),
    raw_data NVARCHAR(MAX) NULL
)
```

## Frontend Integration

### Admin Dashboard

The admin dashboard should fetch these data sources separately:

```javascript
// Fetch user disaster reports
const fetchUserReports = async () => {
  const response = await fetch("http://localhost:8000/admin/reports", {
    headers: {
      "X-API-Key": "secretkey",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  setUserReports(data.reports);
};

// Fetch NADMA disasters separately
const fetchNadmaDisasters = async () => {
  const response = await fetch(
    "http://localhost:8000/map/admin/nadma/history?limit=1000",
    {
      headers: {
        "X-API-Key": "secretkey",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();
  setNadmaDisasters(data.data);
};
```

### Dedicated Pages

- **User Reports**: Admin Dashboard > Disaster Reports tab
- **NADMA Data**: Admin Dashboard > NADMA History page (separate route)

## Migration Notes

### Previous Implementation (Deprecated)

Previously, the `/admin/reports` endpoint had a `source` parameter that allowed mixing NADMA and user reports:

- `source=all` - Combined both sources (❌ deprecated)
- `source=disaster` - User reports only
- `source=nadma` - NADMA disasters only

### Current Implementation

The `source` parameter has been removed. Each data source now has dedicated endpoints:

- `/admin/reports` - **Only** user disaster reports
- `/map/admin/nadma/history` - **Only** NADMA disasters

## Best Practices

1. **Never INSERT NADMA data into `disaster_reports` table**

   - NADMA data belongs in `nadma_disasters` and related tables
   - User reports belong in `disaster_reports` table

2. **Use appropriate endpoints**

   - For user-submitted reports → `/admin/reports`
   - For NADMA official data → `/map/admin/nadma/history`

3. **Frontend display**

   - Show user reports and NADMA data in separate UI sections/tabs
   - Clearly label the data source
   - Use separate state management for each

4. **Reporting and analytics**
   - Generate separate statistics for each data source
   - When combining data for visualization, clearly distinguish the source

## Why This Separation?

1. **Data Integrity**: Official government data should not be mixed with user-generated content
2. **Accountability**: Clear attribution of report sources
3. **Different Data Models**: NADMA has rich structured data (categories, states, districts, cases) while user reports are simpler
4. **Update Patterns**: NADMA data is synced periodically; user reports are created on-demand
5. **Access Control**: Different authorization rules may apply
6. **Data Quality**: Different validation and verification processes

## Related Files

- `backend/database/nadma.py` - NADMA database operations
- `backend/database/reports.py` - User reports database operations
- `backend/services/nadma_service.py` - NADMA business logic
- `backend/routes/reports.py` - User reports API endpoints
- `backend/routes/map.py` - NADMA API endpoints (under `/map` prefix)
- `frontend/src/pages/admin/NadmaHistory.jsx` - NADMA history page
- `frontend/src/pages/admin/Dashboard/index.jsx` - Admin dashboard with user reports

## Change Log

### 2026-01-12: Data Separation Implementation

- Removed `source` parameter from `/admin/reports` endpoint
- Removed NADMA data from user disaster reports endpoints
- Removed `_nadma_disaster_to_admin_report` helper function
- Updated CSV/PDF export endpoints to only export user reports
- Added documentation (this file)
