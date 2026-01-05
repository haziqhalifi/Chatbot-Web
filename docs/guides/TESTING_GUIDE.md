# Testing the Integrated Map Data API

## Quick Test Steps

### 1. Start Backend Server

```bash
cd "C:\Users\user\Desktop\Chatbot Web"
.\env\Scripts\uvicorn.exe backend.main:app --reload
```

### 2. Test API Endpoint

Open browser: http://localhost:8000/map/endpoints

You should see JSON with 4 endpoints:

- Land Slide Risk Area
- Flood Prone Area
- Place of Interest
- Population

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

### 4. Open Map in Browser

Navigate to the map view in your application.

### 5. Check Browser Console

Look for these messages:

```
Fetching map endpoints from API...
Map endpoints fetched: [...]
Layers updated with API data
Creating API-based FeatureLayer for: Flood Prone Area
Creating API-based FeatureLayer for: Land Slide Risk Area
```

### 6. Test Layer Toggle

1. Click the "Layers" button (📚 icon)
2. You should see:

   - Malaysia Administrative Boundaries ✓
   - Emergency Services (Malaysia) ✓
   - **Flood Prone Area** ✓ (from API)
   - **Land Slide Risk Area** ✓ (from API)
   - Place of Interest
   - Population

3. Toggle each layer on/off
4. Adjust opacity sliders
5. Verify map updates in real-time

## What You Should See

### Layer Panel

The layer list now shows API-loaded layers with:

- Proper icons (💧 for flood, ⛰️ for landslide, etc.)
- Real names from the API
- Descriptions from the API
- Toggle controls working

### Map Display

When layers are visible, you'll see:

- Real flood-prone areas from ArcGIS
- Real landslide risk zones from ArcGIS
- Actual place of interest markers
- Population density data

### Interactive Features

Click on any feature on the map to see:

- Popup with feature information
- Data from the ArcGIS Feature Server
- Attributes and details

## Success Indicators

✅ Backend responds at http://localhost:8000/map/endpoints
✅ Console shows "Layers updated with API data"
✅ Layer panel shows API layers
✅ Toggling layers works
✅ Real data displays on map
✅ No errors in console

## Common Issues & Fixes

### Backend not responding

```bash
# Make sure you're in the right directory
cd "C:\Users\user\Desktop\Chatbot Web"

# Check if port 8000 is free
netstat -ano | findstr :8000

# Start backend
.\env\Scripts\uvicorn.exe backend.main:app --reload
```

### Frontend can't connect

- Check CORS settings in backend/main.py
- Verify frontend port is in the allowed origins list
- Check browser console for CORS errors

### Layers don't display

- Verify ArcGIS URLs are accessible
- Check zoom level (some layers only show at certain scales)
- Look for JavaScript errors in console

## Next Steps

Once everything works:

1. Customize layer default visibility
2. Add more layer styling options
3. Implement layer grouping
4. Add search/filter functionality
5. Save user preferences
