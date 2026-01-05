# Quick Start Guide - Map Data API

## What Was Added?

Your Chatbot Web application now has a **Map Data API** that provides ArcGIS Feature Server endpoints for disaster management data in Malaysia.

## 🗺️ Available Data

| Data Type                | Description                    | API Type     |
| ------------------------ | ------------------------------ | ------------ |
| **Land Slide Risk Area** | Areas prone to landslides      | `landslide`  |
| **Flood Prone Area**     | Flooding risk zones            | `flood`      |
| **Place of Interest**    | Emergency services, facilities | `poi`        |
| **Population**           | Population density data        | `population` |

## 🚀 Quick Usage

### 1. Start the Backend

From the project root:

```bash
.\env\Scripts\uvicorn.exe backend.main:app --reload
```

### 2. Test the API

Open your browser and visit:

- **API Docs**: http://localhost:8000/docs
- **All Endpoints**: http://localhost:8000/map/endpoints
- **Specific Type**: http://localhost:8000/map/endpoints/flood

### 3. Use in Frontend

```javascript
// Fetch all map endpoints
const response = await fetch("http://localhost:8000/map/endpoints");
const data = await response.json();

console.log(data.endpoints);
// [
//   { name: "Land Slide Risk Area", url: "https://...", type: "landslide", ... },
//   { name: "Flood Prone Area", url: "https://...", type: "flood", ... },
//   ...
// ]
```

### 4. Create ArcGIS Layers

```javascript
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

// For each endpoint, create a layer
data.endpoints.forEach((endpoint) => {
  const layer = new FeatureLayer({
    url: endpoint.url,
    title: endpoint.name,
    visible: true,
  });

  // Add to your map
  map.add(layer);
});
```

## 📋 API Endpoints Summary

### Get All Endpoints

**GET** `/map/endpoints`

Returns all 4 map data endpoints with their ArcGIS URLs.

### Get Specific Endpoint

**GET** `/map/endpoints/{type}`

Get one endpoint by type: `landslide`, `flood`, `poi`, or `population`

### Get Available Types

**GET** `/map/types`

Returns: `["landslide", "flood", "poi", "population"]`

## 💡 Example Use Cases

### Use Case 1: Show Flood Risk Areas

```javascript
const response = await fetch("http://localhost:8000/map/endpoints/flood");
const floodData = await response.json();

const floodLayer = new FeatureLayer({
  url: floodData.url,
  title: floodData.name,
  opacity: 0.5,
});

map.add(floodLayer);
```

### Use Case 2: Load All Disaster Layers

```javascript
const response = await fetch("http://localhost:8000/map/endpoints");
const { endpoints } = await response.json();

endpoints.forEach((endpoint) => {
  if (endpoint.type === "landslide" || endpoint.type === "flood") {
    const layer = new FeatureLayer({ url: endpoint.url });
    map.add(layer);
  }
});
```

### Use Case 3: Create Layer Toggle

```javascript
const { endpoints } = await fetch("http://localhost:8000/map/endpoints").then(
  (r) => r.json()
);

// Create a layer for each endpoint
const layers = {};
endpoints.forEach((endpoint) => {
  layers[endpoint.type] = new FeatureLayer({
    url: endpoint.url,
    title: endpoint.name,
    visible: false, // Hidden by default
  });
  map.add(layers[endpoint.type]);
});

// Toggle function
function toggleLayer(type) {
  layers[type].visible = !layers[type].visible;
}

// Use in UI
<button onClick={() => toggleLayer("flood")}>Toggle Flood Layer</button>;
```

## 📖 Full Documentation

- **API Details**: See `backend/routes/MAP_API.md`
- **Code Examples**: See `frontend/src/examples/MapDataAPIExample.jsx`
- **Implementation Summary**: See `MAP_DATA_API_IMPLEMENTATION.md`

## 🧪 Testing

Run the test suite:

```bash
cd backend
python tests/test_map_api.py
```

This will:

- ✓ Test all API endpoints
- ✓ Verify ArcGIS URLs are accessible
- ✓ Check error handling

## 🔗 Integration with Existing MapView

Your existing `frontend/src/components/dashboard/MapView.jsx` can be enhanced:

```javascript
// Add to MapView.jsx
useEffect(() => {
  async function loadRealData() {
    try {
      const response = await fetch("http://localhost:8000/map/endpoints");
      const { endpoints } = await response.json();

      // Replace demo layers with real ArcGIS data
      endpoints.forEach((endpoint) => {
        const layer = new FeatureLayer({
          url: endpoint.url,
          title: endpoint.name,
          visible: endpoint.type === "flood", // Show flood by default
        });
        mapView.map.add(layer);
      });
    } catch (error) {
      console.error("Failed to load map data:", error);
    }
  }

  if (mapView) {
    loadRealData();
  }
}, [mapView]);
```

## ✅ What's Working

- ✅ Backend API endpoints created
- ✅ Routes registered in FastAPI
- ✅ CORS configured for frontend
- ✅ API documentation available at `/docs`
- ✅ Test suite ready
- ✅ Frontend examples provided
- ✅ README updated

## 🎯 Next Steps

1. **Test the API**: Visit http://localhost:8000/docs
2. **Integrate with MapView**: Update your MapView component
3. **Customize styling**: Adjust layer colors and opacity
4. **Add user controls**: Let users toggle layers on/off

## 📞 Quick Reference

| What               | Where                                         |
| ------------------ | --------------------------------------------- |
| API Implementation | `backend/routes/map.py`                       |
| API Documentation  | `backend/routes/MAP_API.md`                   |
| Test Suite         | `backend/tests/test_map_api.py`               |
| Frontend Examples  | `frontend/src/examples/MapDataAPIExample.jsx` |
| Main README        | `README.md` (updated)                         |
| This Guide         | `MAP_DATA_API_QUICKSTART.md`                  |

---

**Ready to use!** Start your backend server and visit http://localhost:8000/docs to explore the new Map Data API.
