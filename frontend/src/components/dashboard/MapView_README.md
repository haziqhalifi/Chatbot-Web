# MapView Component - Malaysia Disaster Management System

## Overview

The MapView component has been enhanced with advanced layer management capabilities specifically designed for Malaysia disaster management. It includes a comprehensive layer list with Malaysia-specific data layers and interactive controls.

## Features

### 🗺️ Layer Management

- **Layer List Panel**: Toggle visibility of different map layers
- **Opacity Controls**: Adjust layer transparency for better visualization
- **Layer Information**: View detailed information about each layer
- **Real-time Status**: See how many layers are currently active

### 🏛️ Malaysia-Specific Layers

1. **Malaysia Administrative Boundaries**

   - Shows state and district boundaries
   - Essential for administrative reference

2. **Flood Risk Zones (Malaysia)**

   - Identifies areas prone to flooding during monsoon seasons
   - Critical for flood preparedness and response

3. **Landslide Risk Areas (Malaysia)**

   - Highlights areas prone to landslides and slope failures
   - Important for infrastructure planning and safety

4. **Forest Cover (Malaysia)**

   - Shows forest cover and protected natural areas
   - Useful for environmental monitoring and conservation

5. **Emergency Services (Malaysia)**

   - Displays hospitals, police stations, fire stations
   - Essential for emergency response coordination

6. **Earthquake Risk Zones (Malaysia)**

   - Identifies areas at risk of earthquakes
   - Important for building codes and preparedness

7. **Tsunami Risk Zones (Malaysia)**

   - Shows coastal areas at risk of tsunamis
   - Critical for coastal evacuation planning

8. **Population Density (Malaysia)**

   - Displays population density for evacuation planning
   - Helps prioritize emergency response efforts

9. **Transportation Network (Malaysia)**
   - Shows major roads, highways, and infrastructure
   - Essential for evacuation route planning

## Usage

### Basic Layer Control

```jsx
// The layer list can be toggled using the layers button
// Click the layers icon in the top-right corner of the map
```

### Layer Visibility

- Click the eye icon next to each layer to show/hide it
- Green eye = layer is visible
- Gray eye with slash = layer is hidden

### Opacity Control

- Click the settings icon to open opacity controls
- Use the slider to adjust layer transparency (0-100%)
- Real-time preview of opacity changes

### Layer Information

- Click the info icon to view layer details
- Shows layer type, opacity, status, and data source

## Technical Implementation

### Custom Hook: `useMapLayers`

The component uses a custom React hook for layer management:

```jsx
const {
  layers, // Array of layer configurations
  layerObjects, // Map of actual ArcGIS layer objects
  loading, // Loading state
  toggleLayerVisibility, // Function to toggle layer visibility
  setLayerOpacity, // Function to set layer opacity
  getVisibleLayersCount, // Function to get count of visible layers
  getLayer, // Function to get layer by ID
} = useMapLayers(mapView);
```

### Layer Configuration

Each layer is configured with:

- Unique ID and name
- Visibility state
- Opacity level
- Color scheme
- Description
- Icon representation

### ArcGIS Integration

- Uses ArcGIS GraphicsLayer for demo data
- Supports polygons, points, and polylines
- Includes popup templates for layer information
- Compatible with existing ArcGIS map components

## Styling

The component uses Tailwind CSS for styling with:

- Responsive design
- Hover effects and transitions
- Color-coded layer types
- Modern UI with shadows and rounded corners
- Accessibility-friendly controls

## Future Enhancements

1. **Real Data Integration**: Connect to actual Malaysia GIS data sources
2. **Layer Filtering**: Add filters for specific regions or disaster types
3. **Export Capabilities**: Allow users to export layer data
4. **Time-based Layers**: Add temporal data for historical analysis
5. **Custom Layer Creation**: Allow users to create custom layers
6. **Layer Grouping**: Organize layers into logical groups
7. **Search Functionality**: Search for specific layers or features

## Dependencies

- `@arcgis/core`: Core ArcGIS functionality
- `@arcgis/map-components`: ArcGIS web components
- `lucide-react`: Icons for layer types
- `react`: React framework
- `tailwindcss`: Styling framework

## Browser Compatibility

- Modern browsers with ES6+ support
- Requires WebGL for optimal performance
- Responsive design for mobile and desktop

## Performance Considerations

- Layers are loaded dynamically to reduce initial load time
- Graphics are optimized for web rendering
- Opacity changes are handled efficiently
- Layer visibility toggles are immediate

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Clear visual indicators for layer states
