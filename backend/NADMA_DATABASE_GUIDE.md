# NADMA Disaster Database Integration

This module provides complete integration with NADMA MyDIMS API, including local database storage and synchronization.

## Features

- 🗄️ **Local Database Storage**: Stores all disaster data in SQL Server
- 🔄 **Automatic Sync**: Fetch and sync data from NADMA API
- 📊 **Statistics & Analytics**: Query disaster statistics by category, state, status
- 🎯 **Efficient Queries**: Indexed tables for fast retrieval
- 📍 **Location Data**: Stores states, districts, and coordinates
- 👥 **Victim Information**: Tracks relief centers, families, and victims affected

## Database Schema

### Tables Created

1. **nadma_disasters** - Main disaster records

   - Disaster details (ID, status, dates, location)
   - Coordinates (latitude, longitude)
   - Special case flag (bencana_khas)
   - Raw JSON data backup

2. **nadma_categories** - Disaster types/categories

   - Category names (Banjir, Tanah Runtuh, etc.)
   - Icon paths

3. **nadma_states** - Malaysian states

   - State names and IDs

4. **nadma_districts** - Districts

   - District names, coordinates
   - Linked to states

5. **nadma_disaster_cases** - Case information
   - Relief centers (PPS) count
   - Families affected
   - Total victims

## Setup

### 1. Initialize Database

Run the initialization script:

```bash
cd backend
python init_nadma_db.py
```

This will:

- Create all necessary tables
- Fetch current disasters from NADMA API
- Store them in the database
- Display statistics

### 2. Configure Environment Variables

Ensure these are in your `.env` file:

```env
NADMA_API_URL=https://mydims.nadma.gov.my/api/disasters
NADMA_API_TOKEN=6571756|yN5L6StiHQOlyouD5FjmMFBOeywAxjPE79x0m7n843ac4e63
```

## API Endpoints

### Sync Disasters from NADMA API to Database

```http
POST /map/nadma/sync
Content-Type: application/json

{
  "filters": {}  // Optional filters
}
```

**Response:**

```json
{
  "success": true,
  "message": "Synced 45 disasters (12 new, 33 updated)",
  "statistics": {
    "success": 45,
    "failed": 0,
    "new": 12,
    "updated": 33
  }
}
```

### Get Disasters from Database

```http
GET /map/nadma/disasters/db?status=Aktif&limit=100
```

**Parameters:**

- `status` (optional): Filter by status (Aktif, Selesai)
- `limit` (optional): Max records to return (default: 100)

**Response:**

```json
{
  "success": true,
  "count": 45,
  "data": [
    {
      "id": 1929,
      "kategori_id": 7,
      "status": "Aktif",
      "state_id": 6,
      "district_id": 46,
      "latitude": 4.46789210,
      "longitude": 101.38478680,
      ...
    }
  ]
}
```

### Get Statistics

```http
GET /map/nadma/statistics
```

**Response:**

```json
{
  "success": true,
  "statistics": {
    "total": 45,
    "active": 12,
    "special_cases": 3,
    "by_category": {
      "Banjir": 20,
      "Tanah Runtuh": 15,
      "Kebakaran": 10
    },
    "by_state": {
      "Pahang": 15,
      "Kelantan": 12,
      "Terengganu": 18
    }
  }
}
```

### Initialize Database Tables

```http
POST /map/nadma/init-db
```

Creates all tables (safe to call multiple times).

## Usage in Code

### Python Service

```python
from services.nadma_service import nadma_service

# Sync from API
result = await nadma_service.sync_from_api()

# Get from database
disasters = nadma_service.get_disasters(status="Aktif", limit=50)

# Get statistics
stats = nadma_service.get_statistics()
```

### Frontend Integration

Update your DisasterDashboard to use database endpoint:

```javascript
// Fetch from database instead of direct API call
const response = await fetch(
  "http://localhost:8000/map/nadma/disasters/db?status=Aktif"
);
const data = await response.json();
setDisasters(data.data);

// Sync new data from NADMA
const syncResponse = await fetch("http://localhost:8000/map/nadma/sync", {
  method: "POST",
});
```

## Scheduled Sync

To keep data up-to-date, set up a scheduled task:

### Windows Task Scheduler

```batch
cd C:\Users\user\Desktop\Chatbot Web\backend
..\\.venv\Scripts\python.exe init_nadma_db.py
```

Schedule to run every hour or as needed.

### Python Scheduler (Alternative)

Add to your `main.py`:

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from services.nadma_service import nadma_service

scheduler = AsyncIOScheduler()

async def sync_nadma_data():
    await nadma_service.sync_from_api()
    print("NADMA data synced")

# Run every hour
scheduler.add_job(sync_nadma_data, 'interval', hours=1)
scheduler.start()
```

## Benefits

✅ **Faster Response**: No need to call NADMA API for every request
✅ **Offline Access**: Data available even if NADMA API is down
✅ **Historical Data**: Keep track of disaster changes over time
✅ **Advanced Queries**: Filter and analyze data efficiently
✅ **Reduced API Load**: Minimize calls to NADMA servers
✅ **Analytics**: Generate reports and statistics easily

## Troubleshooting

### Connection Errors

If database connection fails:

1. Check SQL Server is running
2. Verify connection string in `.env`
3. Ensure Windows Authentication is enabled

### API Sync Failures

If sync fails:

1. Verify NADMA API token is correct
2. Check internet connectivity
3. Review API response in logs

### Missing Data

If some fields are empty:

1. NADMA API might not provide all fields
2. Check `raw_data` column for original JSON
3. Fields are stored as provided by API

## Maintenance

### Clear Old Data

```sql
-- Delete resolved disasters older than 6 months
DELETE FROM nadma_disasters
WHERE status = 'Selesai'
AND datetime_end < DATEADD(month, -6, GETDATE())
```

### Re-sync All Data

```bash
python init_nadma_db.py
```

This will update all existing records and add new ones.
