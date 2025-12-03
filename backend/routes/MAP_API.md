# Map Data API Documentation

This document describes the Map Data API endpoints that provide ArcGIS Feature Server URLs for disaster management mapping in Malaysia.

## Overview

The Map Data API provides access to various geospatial datasets including:

- Land slide risk areas
- Flood prone areas
- Points of interest (emergency services, facilities)
- Population density data

All endpoints are accessible under the `/map` prefix.

## Endpoints

### Get All Map Endpoints

**GET** `/map/endpoints`

Returns a list of all available ArcGIS Feature Server endpoints.

**Response:**

```json
{
  "endpoints": [
    {
      "name": "Land Slide Risk Area",
      "url": "https://services7.arcgis.com/DpGu4Fz48xobufjF/arcgis/rest/services/Land_Slide_Risk_Area/FeatureServer",
      "type": "landslide",
      "description": "Areas prone to landslides and slope failures in Malaysia"
    },
    {
      "name": "Flood Prone Area",
      "url": "https://services7.arcgis.com/DpGu4Fz48xobufjF/arcgis/rest/services/Flood_Prone_Area/FeatureServer",
      "type": "flood",
      "description": "Areas at risk of flooding during monsoon seasons in Malaysia"
    },
    {
      "name": "Place of Interest",
      "url": "https://services7.arcgis.com/DpGu4Fz48xobufjF/arcgis/rest/services/Place_of_Interest/FeatureServer",
      "type": "poi",
      "description": "Points of interest including emergency services and important facilities"
    },
    {
      "name": "Population",
      "url": "https://services7.arcgis.com/DpGu4Fz48xobufjF/arcgis/rest/services/Population/FeatureServer",
      "type": "population",
      "description": "Population density across Malaysia for evacuation planning"
    }
  ]
}
```

**Example:**

```bash
curl http://localhost:8000/map/endpoints
```

---

### Get Map Endpoint by Type

**GET** `/map/endpoints/{endpoint_type}`

Returns a specific map endpoint by type.

**Path Parameters:**

- `endpoint_type` (string): The type of map data. Valid values: `landslide`, `flood`, `poi`, `population`

**Response:**

```json
{
  "name": "Flood Prone Area",
  "url": "https://services7.arcgis.com/DpGu4Fz48xobufjF/arcgis/rest/services/Flood_Prone_Area/FeatureServer",
  "type": "flood",
  "description": "Areas at risk of flooding during monsoon seasons in Malaysia"
}
```

**Example:**

```bash
curl http://localhost:8000/map/endpoints/flood
```

**Error Response (404):**

```json
{
  "detail": "Map endpoint type 'invalid' not found. Available types: landslide, flood, poi, population"
}
```

---

### Get Available Map Types

**GET** `/map/types`

Returns a list of all available map data types.

**Response:**

```json
{
  "types": ["landslide", "flood", "poi", "population"]
}
```

**Example:**

```bash
curl http://localhost:8000/map/types
```

---

## Using the ArcGIS Feature Server URLs

The URLs returned by these endpoints can be used with ArcGIS JavaScript API to display map layers:

### JavaScript Example

```javascript
// Fetch map endpoints from the API
const response = await fetch("http://localhost:8000/map/endpoints");
const data = await response.json();

// Use with ArcGIS JavaScript API
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

data.endpoints.forEach((endpoint) => {
  const layer = new FeatureLayer({
    url: endpoint.url,
    title: endpoint.name,
    visible: true,
  });

  // Add layer to map
  map.add(layer);
});
```

### React Example

```javascript
import { useEffect, useState } from "react";

function MapComponent() {
  const [mapEndpoints, setMapEndpoints] = useState([]);

  useEffect(() => {
    // Fetch map endpoints
    fetch("http://localhost:8000/map/endpoints")
      .then((res) => res.json())
      .then((data) => setMapEndpoints(data.endpoints))
      .catch((error) => console.error("Error fetching map endpoints:", error));
  }, []);

  // Use mapEndpoints to create ArcGIS layers
  // ...
}
```

---

## Integration with Frontend

To integrate these endpoints with the existing MapView component in the frontend:

1. **Fetch endpoints on component mount:**

```javascript
useEffect(() => {
  async function loadMapEndpoints() {
    try {
      const response = await fetch("http://localhost:8000/map/endpoints");
      const data = await response.json();
      // Update layer configuration with real endpoints
      updateLayersWithEndpoints(data.endpoints);
    } catch (error) {
      console.error("Failed to load map endpoints:", error);
    }
  }
  loadMapEndpoints();
}, []);
```

2. **Create FeatureLayers from the endpoints:**

```javascript
const createFeatureLayerFromEndpoint = (endpoint) => {
  return new FeatureLayer({
    url: endpoint.url,
    title: endpoint.name,
    visible: true,
    opacity: 0.6,
    popupTemplate: {
      title: endpoint.name,
      content: endpoint.description,
    },
  });
};
```

---

## CORS Configuration

The backend is already configured to allow CORS requests from the frontend development server (ports 3000, 3001, 4028). No additional configuration is needed.

---

## Notes

- All endpoints are **publicly accessible** and do not require authentication
- The ArcGIS Feature Server URLs are read-only
- Data is hosted on ArcGIS Online and maintained by the service provider
- Frontend should handle loading states and errors when fetching data from ArcGIS servers

---

## Error Handling

When using these endpoints in your frontend application, implement proper error handling:

```javascript
async function fetchMapEndpoints() {
  try {
    const response = await fetch("http://localhost:8000/map/endpoints");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.endpoints;
  } catch (error) {
    console.error("Error fetching map endpoints:", error);
    // Show user-friendly error message
    return [];
  }
}
```

---

## API Documentation

When the backend is running, you can access the interactive API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

These interfaces allow you to test the endpoints directly from your browser.
