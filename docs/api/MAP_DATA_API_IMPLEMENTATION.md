# Map Data API - Implementation Summary

## Overview

Added a new Map Data API to the Chatbot Web application that provides ArcGIS Feature Server endpoints for disaster management mapping in Malaysia.

## Changes Made

### 1. Backend Changes

#### New Files Created

**`backend/routes/map.py`**

- New FastAPI router with map data endpoints
- Provides ArcGIS Feature Server URLs for:
  - Land Slide Risk Area
  - Flood Prone Area
  - Place of Interest (POI)
  - Population data
- Includes 3 endpoints:
  - `GET /map/endpoints` - Get all endpoints
  - `GET /map/endpoints/{type}` - Get endpoint by type
  - `GET /map/types` - Get available types

**`backend/routes/MAP_API.md`**

- Comprehensive API documentation
- Usage examples for JavaScript/React
- Integration guides for frontend developers
- Error handling examples

**`backend/tests/test_map_api.py`**

- Test suite for the Map Data API
- Tests all endpoints
- Validates ArcGIS URL accessibility
- Easy-to-run verification script

#### Modified Files

**`backend/main.py`**

- Added import for the new `map` route module
- Registered the map router with `/map` prefix
- Tagged as "Map" in API documentation

### 2. Frontend Examples

**`frontend/src/examples/MapDataAPIExample.jsx`**

- Custom React hooks for fetching map endpoints:
  - `useMapEndpoints()` - Fetch all endpoints
  - `useMapEndpointByType(type)` - Fetch specific endpoint
- Helper functions:
  - `createFeatureLayerFromEndpoint()` - Create ArcGIS FeatureLayer
- Example components:
  - `MapDataExample` - Basic usage
  - `FloodLayerExample` - Single layer example
  - `LayerControlPanel` - Full layer control UI

### 3. Documentation

**`README.md`**

- Added "Map Data API" section
- Listed available endpoints
- Documented data sources
- Provided integration example
- Referenced detailed documentation

## API Endpoints

### Get All Map Endpoints

```
GET /map/endpoints
```

Returns all available ArcGIS Feature Server endpoints.

### Get Endpoint by Type

```
GET /map/endpoints/{type}
```

Get a specific endpoint. Valid types:

- `landslide` - Land slide risk areas
- `flood` - Flood prone areas
- `poi` - Points of interest
- `population` - Population density data

### Get Available Types

```
GET /map/types
```

Returns list of available map data types.

## Data Sources

All endpoints point to ArcGIS Feature Servers:

1. **Land Slide Risk Area**

   - URL: `https://services7.arcgis.com/DpGu4Fz48xobufjF/arcgis/rest/services/Land_Slide_Risk_Area/FeatureServer`
   - Areas prone to landslides and slope failures

2. **Flood Prone Area**

   - URL: `https://services7.arcgis.com/DpGu4Fz48xobufjF/arcgis/rest/services/Flood_Prone_Area/FeatureServer`
   - Areas at risk of flooding during monsoon seasons

3. **Place of Interest**

   - URL: `https://services7.arcgis.com/DpGu4Fz48xobufjF/arcgis/rest/services/Place_of_Interest/FeatureServer`
   - Emergency services, hospitals, police stations, etc.

4. **Population**
   - URL: `https://services7.arcgis.com/DpGu4Fz48xobufjF/arcgis/rest/services/Population/FeatureServer`
   - Population density for evacuation planning

## Integration with Existing Code

### Backend Integration

The new map router is:

- Registered in `main.py` with the `/map` prefix
- Accessible at `http://localhost:8000/map/*`
- Documented in FastAPI's auto-generated docs at `/docs`
- Uses existing CORS configuration (no changes needed)

### Frontend Integration

The frontend can integrate these endpoints with the existing `MapView` component:

```javascript
// In MapView.jsx or a custom hook
import {
  useMapEndpoints,
  createFeatureLayerFromEndpoint,
} from "./examples/MapDataAPIExample";

function MapView() {
  const { endpoints, loading, error } = useMapEndpoints();

  useEffect(() => {
    if (mapView && endpoints.length) {
      endpoints.forEach((endpoint) => {
        const layer = createFeatureLayerFromEndpoint(endpoint);
        mapView.map.add(layer);
      });
    }
  }, [mapView, endpoints]);

  // ... rest of component
}
```

## Testing

### Test the API

1. Start the backend server:

   ```bash
   .\env\Scripts\uvicorn.exe backend.main:app --reload
   ```

2. Run the test suite:

   ```bash
   cd backend
   python tests/test_map_api.py
   ```

3. Or visit the interactive API docs:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Manual Testing

Test with curl:

```bash
# Get all endpoints
curl http://localhost:8000/map/endpoints

# Get flood endpoint
curl http://localhost:8000/map/endpoints/flood

# Get types
curl http://localhost:8000/map/types
```

## Next Steps

### Recommended Enhancements

1. **Integrate with MapView Component**

   - Replace hardcoded layer configurations with API data
   - Dynamically create FeatureLayers from endpoints
   - Add loading states for map data

2. **Add Caching**

   - Cache endpoint data in frontend
   - Use localStorage or React Query
   - Reduce API calls

3. **Add Layer Management**

   - User preferences for visible layers
   - Save layer configurations
   - Preset layer combinations

4. **Enhance Error Handling**

   - Graceful fallbacks if ArcGIS servers are unavailable
   - Retry logic for failed requests
   - User-friendly error messages

5. **Add More Data Sources**
   - Additional ArcGIS Feature Servers
   - Weather data layers
   - Real-time incident reports

## File Structure

```
backend/
├── routes/
│   ├── map.py                    # New map API router
│   └── MAP_API.md                # API documentation
└── tests/
    └── test_map_api.py           # Test suite

frontend/
└── src/
    └── examples/
        └── MapDataAPIExample.jsx  # Usage examples

README.md                          # Updated with API info
```

## Notes

- All endpoints are **publicly accessible** (no authentication required)
- ArcGIS Feature Server URLs are **read-only**
- Data is hosted on ArcGIS Online
- CORS is already configured for local development
- The API follows RESTful conventions
- Response models use Pydantic for validation

## Compatibility

- Backend: FastAPI (Python 3.8+)
- Frontend: React with ArcGIS JavaScript API
- Tested with: Uvicorn server
- CORS configured for ports: 3000, 3001, 4028

## Support

For issues or questions:

1. Check `backend/routes/MAP_API.md` for detailed documentation
2. Review examples in `frontend/src/examples/MapDataAPIExample.jsx`
3. Visit the interactive API docs at `/docs` when server is running
4. Run the test suite to verify functionality
