# MapView Integration with Map Data API - Complete Guide

## Overview

The MapView component has been successfully integrated with the Map Data API. Users can now toggle layers that are dynamically loaded from the backend API, providing real-time access to disaster management data from ArcGIS Feature Servers.

## What Changed

### 1. **Dynamic Layer Loading**

The MapView component now:

- Fetches map endpoints from the backend API on load
- Automatically converts API data into map layers
- Merges API layers with existing static layers
- Updates the layer list with real data

### 2. **API-Driven Layer Configuration**

Layers are now created in two ways:

**Static Layers** (hardcoded):

- Malaysia Administrative Boundaries
- Emergency Services (demo data)

**API Layers** (from backend):

- Land Slide Risk Area (`/map/endpoints` → type: `landslide`)
- Flood Prone Area (`/map/endpoints` → type: `flood`)
- Place of Interest (`/map/endpoints` → type: `poi`)
- Population (`/map/endpoints` → type: `population`)

### 3. **Real ArcGIS Feature Server Integration**

API layers use actual ArcGIS Feature Server URLs, providing:

- Real disaster management data
- Interactive features with popup information
- Professional cartographic styling
- Automatic data updates from ArcGIS Online

## How It Works

### Flow Diagram

```
1. MapView Component Mounts
   ↓
2. Fetch Map Endpoints from API (useEffect)
   GET http://localhost:8000/map/endpoints
   ↓
3. Transform API Data to Layer Configuration
   - Map endpoint types to icons (Droplets, Mountain, etc.)
   - Set default visibility (flood & landslide visible)
   - Assign colors and opacity
   ↓
4. Merge with Static Layers
   - Keep Malaysia Boundaries
   - Keep Emergency Services
   - Add API layers
   ↓
5. Update Layer State
   setLayers([...staticLayers, ...apiLayers])
   ↓
6. Initialize Map (user action or auto)
   ↓
7. Create Map Layers (initializeLayers)
   - Static layers: Use hardcoded logic
   - API layers: Create FeatureLayer from URL
   ↓
8. Add Layers to Map
   view.map.add(layer)
   ↓
9. User Toggles Layer Visibility
   - Updates layer state
   - Toggles layer.visible property
   - Map reflects changes immediately
```

### Key Code Changes

#### 1. State Management

```javascript
// Added API endpoints state
const [apiEndpoints, setApiEndpoints] = useState([]);

// Simplified initial layers to only static ones
const [layers, setLayers] = useState([
  {
    id: "malaysia-boundaries",
    name: "Malaysia Administrative Boundaries",
    isStatic: true, // Mark as static
    // ...
  },
  {
    id: "emergency-services-malaysia",
    name: "Emergency Services (Malaysia)",
    isStatic: true, // Mark as static
    // ...
  },
]);
```

#### 2. API Fetching (New useEffect)

```javascript
useEffect(() => {
  const fetchMapEndpoints = async () => {
    try {
      const response = await fetch("http://localhost:8000/map/endpoints");
      const data = await response.json();

      // Transform API data to layer config
      const apiLayers = data.endpoints.map((endpoint) => ({
        id: `api-${endpoint.type}`,
        name: endpoint.name,
        visible: endpoint.type === "flood" || endpoint.type === "landslide",
        type: "api-feature",
        url: endpoint.url, // Store ArcGIS URL
        // ... more config
      }));

      // Merge with static layers
      setLayers((prevLayers) => {
        const staticLayers = prevLayers.filter((l) => l.isStatic);
        return [...staticLayers, ...apiLayers];
      });
    } catch (error) {
      console.error("Error fetching map endpoints:", error);
    }
  };

  fetchMapEndpoints();
}, []);
```

#### 3. Layer Creation (Updated initializeLayers)

```javascript
// In the switch statement default case:
if (layer.type === "api-feature" && layer.url) {
  // Create FeatureLayer from API URL
  const apiLayer = new FeatureLayer({
    url: layer.url,
    title: layer.name,
    visible: layer.visible,
    opacity: layer.opacity,
    outFields: ["*"],
    popupTemplate: {
      title: layer.name,
      content: layer.description,
    },
  });

  view.map.add(apiLayer);
  newLayerGraphics.set(layer.id, apiLayer);
}
```

## User Experience

### Layer Panel

Users will see the following layers in the layer panel:

**Always Available (Static):**

- ✓ Malaysia Administrative Boundaries (visible by default)
- ✓ Emergency Services (Malaysia) (visible by default)

**From API (Dynamic):**

- ✓ Flood Prone Area (visible by default)
- ✓ Land Slide Risk Area (visible by default)
- ☐ Place of Interest (hidden by default)
- ☐ Population (hidden by default)

### Layer Controls

Each layer has:

- **Toggle Button** - Show/hide layer
- **Opacity Slider** - Adjust transparency (when visible)
- **Info Button** - View layer description
- **Icon** - Visual identifier (Droplets, Mountain, etc.)

### User Actions

1. **Toggle Layer Visibility**

   - Click the eye icon or checkbox
   - Layer appears/disappears on map
   - Changes persist during session

2. **Adjust Layer Opacity**

   - Drag opacity slider
   - See-through effect changes in real-time
   - Useful for overlaying multiple layers

3. **View Layer Information**
   - Click info button
   - See description of data source
   - Understand what the layer shows

## Testing the Integration

### 1. Start the Backend

```bash
cd "C:\Users\user\Desktop\Chatbot Web"
.\env\Scripts\uvicorn.exe backend.main:app --reload
```

**Expected Output:**

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### 2. Verify API Endpoints

Open browser and visit:

```
http://localhost:8000/map/endpoints
```

**Expected Response:**

```json
{
  "endpoints": [
    {
      "name": "Land Slide Risk Area",
      "url": "https://services7.arcgis.com/.../Land_Slide_Risk_Area/FeatureServer",
      "type": "landslide",
      "description": "Areas prone to landslides..."
    }
    // ... more endpoints
  ]
}
```

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

### 4. Open the Map View

1. Navigate to the Dashboard or Map page
2. Wait for map to initialize
3. Check browser console for logs:
   - "Fetching map endpoints from API..."
   - "Map endpoints fetched: [...]"
   - "Layers updated with API data"
   - "Creating API-based FeatureLayer for: Flood Prone Area"

### 5. Test Layer Toggling

1. Click the Layers button (top-left of map)
2. See list of all layers
3. Toggle each layer on/off
4. Verify map updates correctly
5. Adjust opacity sliders
6. Check that layers display real data

## Troubleshooting

### Issue: Layers don't appear

**Symptoms:** Layer panel is empty or only shows static layers

**Solutions:**

1. Check backend is running: `http://localhost:8000/docs`
2. Check browser console for errors
3. Verify CORS settings in backend `main.py`
4. Check network tab in DevTools for failed requests

### Issue: "Failed to load map endpoints"

**Symptoms:** Console shows fetch error

**Solutions:**

1. Verify backend URL is correct: `http://localhost:8000`
2. Check if port 8000 is in use by another application
3. Ensure API route is registered in `main.py`
4. Test endpoint manually in browser

### Issue: Layers load but don't display

**Symptoms:** Layers in panel but nothing on map

**Solutions:**

1. Check ArcGIS Feature Server URLs are accessible
2. Open URL directly in browser (add `?f=json`)
3. Verify layer visibility is set to `true`
4. Check zoom level (some layers only show at certain scales)
5. Look for JavaScript errors in console

### Issue: Opacity control doesn't work

**Symptoms:** Slider moves but layer doesn't change

**Solutions:**

1. Verify `layerGraphics.get(layerId)` returns valid layer object
2. Check that layer is actually visible
3. Ensure opacity value is between 0 and 1
4. Look for errors in `setLayerOpacity` function

## API Endpoint Reference

### Get All Endpoints

```javascript
fetch("http://localhost:8000/map/endpoints")
  .then((r) => r.json())
  .then((data) => console.log(data.endpoints));
```

### Get Specific Endpoint

```javascript
fetch("http://localhost:8000/map/endpoints/flood")
  .then((r) => r.json())
  .then((data) => console.log(data));
```

### Get Available Types

```javascript
fetch("http://localhost:8000/map/types")
  .then((r) => r.json())
  .then((data) => console.log(data.types));
```

## Future Enhancements

### Recommended Improvements

1. **Layer Caching**

   - Cache API responses in localStorage
   - Reduce API calls on component remount
   - Faster initial load

2. **Loading States**

   - Show loading spinner while fetching API data
   - Display progress for each layer
   - Better user feedback

3. **Error Boundaries**

   - Graceful fallback if API fails
   - Show error messages to user
   - Retry mechanism

4. **Layer Grouping**

   - Group layers by category (Risk, Infrastructure, etc.)
   - Collapsible groups in layer panel
   - Bulk toggle (show/hide all in group)

5. **User Preferences**

   - Save layer visibility preferences
   - Remember opacity settings
   - Persist across sessions

6. **Advanced Filters**
   - Filter features within layers
   - Query by attributes
   - Spatial selection tools

## Code References

### Files Modified

- `frontend/src/components/dashboard/MapView.jsx`
  - Added API fetching logic (lines ~132-200)
  - Updated layer initialization (lines ~368-730)
  - Modified default case to handle API layers

### Files Created

- `backend/routes/map.py` - API endpoint implementation
- `backend/routes/MAP_API.md` - API documentation
- `backend/tests/test_map_api.py` - API tests

### Related Documentation

- `MAP_DATA_API_QUICKSTART.md` - Quick start guide
- `MAP_DATA_API_IMPLEMENTATION.md` - Implementation details
- `README.md` - Updated with API info

## Summary

✅ **Integration Complete!**

The MapView component now:

- Dynamically loads layers from the backend API
- Displays real disaster management data from ArcGIS
- Allows users to toggle layers on/off
- Provides full layer controls (visibility, opacity)
- Falls back gracefully if API is unavailable

Users can now interact with live data sources and customize their map view based on their needs!
