import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  MapPin,
  AlertTriangle,
  Building,
  TreePine,
  Droplets,
  Mountain,
  Settings,
  Info,
  X,
  Bookmark,
  Map as MapIcon,
} from 'lucide-react';

const MapView = () => {
  const [mapView, setMapView] = useState(null);
  const [showLayerList, setShowLayerList] = useState(false);
  const [showLayerInfo, setShowLayerInfo] = useState(null);
  const [showOpacityControl, setShowOpacityControl] = useState(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showBasemapGallery, setShowBasemapGallery] = useState(false);
  const [layers, setLayers] = useState([
    {
      id: 'malaysia-boundaries',
      name: 'Malaysia Administrative Boundaries',
      visible: true,
      type: 'feature',
      icon: 'Building',
      description: 'Administrative boundaries of Malaysia states and districts',
      opacity: 0.8,
      color: [0, 0, 0, 0.8],
    },
    {
      id: 'flood-risk-malaysia',
      name: 'Flood Risk Zones (Malaysia)',
      visible: true,
      type: 'feature',
      icon: 'Droplets',
      description: 'Areas at risk of flooding during monsoon seasons in Malaysia',
      opacity: 0.5,
      color: [0, 0, 255, 0.3],
    },
    {
      id: 'landslide-risk-malaysia',
      name: 'Landslide Risk Areas (Malaysia)',
      visible: false,
      type: 'feature',
      icon: 'Mountain',
      description: 'Areas prone to landslides and slope failures in Malaysia',
      opacity: 0.6,
      color: [139, 69, 19, 0.4],
    },
    {
      id: 'forest-cover-malaysia',
      name: 'Forest Cover (Malaysia)',
      visible: false,
      type: 'feature',
      icon: 'TreePine',
      description: 'Forest cover and protected natural areas in Malaysia',
      opacity: 0.6,
      color: [0, 128, 0, 0.4],
    },
    {
      id: 'emergency-services-malaysia',
      name: 'Emergency Services (Malaysia)',
      visible: true,
      type: 'feature',
      icon: 'MapPin',
      description: 'Hospitals, police stations, fire stations, and emergency response centers',
      opacity: 1.0,
      color: [0, 0, 255, 0.8],
    },
    {
      id: 'earthquake-risk-malaysia',
      name: 'Earthquake Risk Zones (Malaysia)',
      visible: false,
      type: 'feature',
      icon: 'AlertTriangle',
      description: 'Areas at risk of earthquakes in Malaysia',
      opacity: 0.7,
      color: [255, 0, 0, 0.3],
    },
    {
      id: 'tsunami-risk-malaysia',
      name: 'Tsunami Risk Zones (Malaysia)',
      visible: false,
      type: 'feature',
      icon: 'AlertTriangle',
      description: 'Coastal areas at risk of tsunamis in Malaysia',
      opacity: 0.5,
      color: [255, 165, 0, 0.4],
    },
    {
      id: 'population-density-malaysia',
      name: 'Population Density (Malaysia)',
      visible: false,
      type: 'feature',
      icon: 'Building',
      description: 'Population density across Malaysia for evacuation planning',
      opacity: 0.6,
      color: [128, 0, 128, 0.3],
    },
    {
      id: 'transportation-network-malaysia',
      name: 'Transportation Network (Malaysia)',
      visible: false,
      type: 'feature',
      icon: 'MapPin',
      description: 'Major roads, highways, and transportation infrastructure',
      opacity: 0.8,
      color: [255, 255, 0, 0.8],
    },
  ]);
  const [layerGraphics, setLayerGraphics] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const mapRef = useRef(null);

  // Malaysia cities bookmarks
  const malaysiaBookmarks = [
    {
      name: 'Kuala Lumpur',
      location: { longitude: 101.6869, latitude: 3.139 },
      description: 'Capital city of Malaysia',
    },
    {
      name: 'George Town',
      location: { longitude: 100.2381, latitude: 5.4164 },
      description: 'Capital of Penang state',
    },
    {
      name: 'Johor Bahru',
      location: { longitude: 103.7648, latitude: 1.4927 },
      description: 'Capital of Johor state',
    },
    {
      name: 'Ipoh',
      location: { longitude: 101.0901, latitude: 4.5979 },
      description: 'Capital of Perak state',
    },
    {
      name: 'Shah Alam',
      location: { longitude: 101.5327, latitude: 3.0738 },
      description: 'Capital of Selangor state',
    },
    {
      name: 'Malacca City',
      location: { longitude: 102.2486, latitude: 2.1896 },
      description: 'Capital of Malacca state',
    },
    {
      name: 'Alor Setar',
      location: { longitude: 100.3605, latitude: 6.1184 },
      description: 'Capital of Kedah state',
    },
    {
      name: 'Kota Kinabalu',
      location: { longitude: 116.0724, latitude: 5.9804 },
      description: 'Capital of Sabah state',
    },
    {
      name: 'Kuching',
      location: { longitude: 110.3593, latitude: 1.5497 },
      description: 'Capital of Sarawak state',
    },
    {
      name: 'Kuantan',
      location: { longitude: 103.3256, latitude: 3.8167 },
      description: 'Capital of Pahang state',
    },
  ];

  // Icon mapping for layer types
  const iconMap = {
    Building,
    AlertTriangle,
    TreePine,
    MapPin,
    Droplets,
    Mountain,
  };

  // Initialize map on component mount
  useEffect(() => {
    initializeMap();

    // Add a timeout to ensure loading doesn't get stuck
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout reached, forcing loading to false');
        setLoading(false);
      }
    }, 30000); // 30 seconds timeout

    return () => clearTimeout(timeoutId);
  }, []);

  const initializeMap = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Initializing map...');
      console.log('Initializing map...');

      // Import ArcGIS modules with different variable names to avoid conflicts
      let ArcGISMapView, ArcGISMap, ArcGISBasemap;

      try {
        const mapViewModule = await import('@arcgis/core/views/MapView');
        console.log('MapView module keys:', Object.keys(mapViewModule));
        ArcGISMapView = mapViewModule.default || mapViewModule.MapView;
        console.log('MapView imported successfully:', ArcGISMapView);
      } catch (mapViewError) {
        console.error('Failed to import MapView:', mapViewError);
        throw mapViewError;
      }

      try {
        const mapModule = await import('@arcgis/core/Map');
        console.log('Map module keys:', Object.keys(mapModule));
        ArcGISMap = mapModule.default || mapModule.Map;
        console.log('Map imported successfully:', ArcGISMap);
      } catch (mapError) {
        console.error('Failed to import Map:', mapError);
        throw mapError;
      }

      // Try different ways to import Basemap
      try {
        const basemapModule = await import('@arcgis/core/Basemap');
        ArcGISBasemap = basemapModule.default || basemapModule.Basemap;
        console.log('Basemap imported successfully');
      } catch (basemapImportError) {
        console.log('Failed to import Basemap:', basemapImportError);
        ArcGISBasemap = null;
      }

      console.log('ArcGIS modules imported:', {
        MapView: ArcGISMapView,
        Map: ArcGISMap,
        Basemap: ArcGISBasemap,
      });

      // Validate that we have the required constructors
      if (typeof ArcGISMap !== 'function') {
        throw new Error(`ArcGISMap is not a constructor. Got: ${typeof ArcGISMap}`);
      }
      if (typeof ArcGISMapView !== 'function') {
        throw new Error(`ArcGISMapView is not a constructor. Got: ${typeof ArcGISMapView}`);
      }

      // Create a simple map without basemap to avoid import issues
      const map = new ArcGISMap();
      console.log('Map created successfully');

      // Add a basemap after creation
      try {
        if (ArcGISBasemap && ArcGISBasemap.fromId) {
          const basemap = ArcGISBasemap.fromId('streets-vector');
          map.basemap = basemap;
          console.log('Basemap added successfully');
        } else {
          console.log('Basemap.fromId not available, using default');
          // Try using a simple basemap string
          map.basemap = 'streets-vector';
        }
      } catch (basemapError) {
        console.log('Failed to add basemap, using default:', basemapError);
        // Final fallback
        try {
          map.basemap = 'streets-vector';
        } catch (finalError) {
          console.log('All basemap methods failed, continuing without basemap');
        }
      }

      // Create the view
      const view = new ArcGISMapView({
        container: mapRef.current,
        map: map,
        zoom: 6,
        center: [101.6869, 3.139], // Kuala Lumpur
      });

      console.log('Map view created successfully');
      setMapView(view);
      setLoadingMessage('Map view ready, initializing layers...');

      // Wait for view to be ready
      await view.when();
      console.log('View is ready');

      // Initialize layers
      await initializeLayers(view);
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setLoading(false);
    }
  };

  // Manual initialization function for debugging
  const manualInitialize = async () => {
    console.log('Manual initialization triggered');
    await initializeMap();
  };

  const initializeLayers = async (view) => {
    console.log('Initializing layers...');
    setLoadingMessage('Loading Malaysia map layers...');
    const newLayerGraphics = new Map();

    try {
      // Import ArcGIS modules with default imports
      const graphicsLayerModule = await import('@arcgis/core/layers/GraphicsLayer');
      const GraphicsLayer = graphicsLayerModule.default || graphicsLayerModule.GraphicsLayer;

      const featureLayerModule = await import('@arcgis/core/layers/FeatureLayer');
      const FeatureLayer = featureLayerModule.default || featureLayerModule.FeatureLayer;

      const graphicModule = await import('@arcgis/core/Graphic');
      const Graphic = graphicModule.default || graphicModule.Graphic;

      const geometryModule = await import('@arcgis/core/geometry');
      const Polygon = geometryModule.Polygon;
      const Point = geometryModule.Point;
      const Polyline = geometryModule.Polyline;

      const symbolsModule = await import('@arcgis/core/symbols');
      const SimpleFillSymbol = symbolsModule.SimpleFillSymbol;
      const SimpleMarkerSymbol = symbolsModule.SimpleMarkerSymbol;
      const SimpleLineSymbol = symbolsModule.SimpleLineSymbol;

      const rendererModule = await import('@arcgis/core/renderers/SimpleRenderer');
      const SimpleRenderer = rendererModule.default || rendererModule.SimpleRenderer;

      console.log('ArcGIS modules imported successfully');

      for (const layer of layers) {
        console.log(`Processing layer: ${layer.id}`);
        let graphicsLayer;

        switch (layer.id) {
          case 'malaysia-boundaries':
            console.log('Creating Malaysia boundaries layer...');
            // Use the real Malaysia state boundaries service
            const stateLayer = new FeatureLayer({
              url: 'https://services7.arcgis.com/IyvyFk20mB7Wpc95/arcgis/rest/services/MALAYSIA_STATE_BOUNDARIES/FeatureServer',
              outFields: ['*'],
              visible: layer.visible,
              opacity: layer.opacity,
              title: layer.name,
              renderer: {
                type: 'simple',
                symbol: {
                  type: 'simple-fill',
                  color: [255, 255, 0, 0.2],
                  outline: {
                    color: 'red',
                    width: 1,
                  },
                },
              },
              popupTemplate: {
                title: layer.name,
                content: layer.description,
              },
            });

            view.map.add(stateLayer);
            newLayerGraphics.set(layer.id, stateLayer);
            console.log('Added Malaysia boundaries layer successfully');
            continue;

          case 'flood-risk-malaysia':
            // Create flood risk areas as graphics layer
            graphicsLayer = new GraphicsLayer({
              title: layer.name,
              visible: layer.visible,
              opacity: layer.opacity,
            });

            const floodGeometry = new Polygon({
              rings: [
                [
                  [101.0, 2.0],
                  [105.0, 2.0],
                  [105.0, 4.0],
                  [101.0, 4.0],
                  [101.0, 2.0],
                ],
              ],
              spatialReference: { wkid: 4326 },
            });
            const floodSymbol = new SimpleFillSymbol({
              color: layer.color,
              outline: new SimpleLineSymbol({
                color: [0, 0, 255, 0.8],
                width: 1,
              }),
            });
            const floodGraphic = new Graphic({
              geometry: floodGeometry,
              symbol: floodSymbol,
              attributes: {
                name: layer.name,
                description: layer.description,
              },
              popupTemplate: {
                title: layer.name,
                content: layer.description,
              },
            });
            graphicsLayer.add(floodGraphic);
            break;

          case 'emergency-services-malaysia':
            // Create emergency service points
            graphicsLayer = new GraphicsLayer({
              title: layer.name,
              visible: layer.visible,
              opacity: layer.opacity,
            });

            const emergencyPoints = [
              { longitude: 101.6869, latitude: 3.139, name: 'Kuala Lumpur Hospital' },
              { longitude: 100.2381, latitude: 5.4164, name: 'George Town Hospital' },
              { longitude: 103.7648, latitude: 1.4927, name: 'Johor Bahru Hospital' },
              { longitude: 101.0901, latitude: 4.5979, name: 'Ipoh Hospital' },
              { longitude: 101.5327, latitude: 3.0738, name: 'Shah Alam Hospital' },
            ];

            emergencyPoints.forEach((point) => {
              const pointGeometry = new Point({
                longitude: point.longitude,
                latitude: point.latitude,
                spatialReference: { wkid: 4326 },
              });
              const pointSymbol = new SimpleMarkerSymbol({
                color: layer.color,
                size: 12,
                outline: new SimpleLineSymbol({
                  color: [255, 255, 255, 1],
                  width: 2,
                }),
              });
              const pointGraphic = new Graphic({
                geometry: pointGeometry,
                symbol: pointSymbol,
                attributes: { name: point.name },
                popupTemplate: {
                  title: 'Emergency Service',
                  content: point.name,
                },
              });
              graphicsLayer.add(pointGraphic);
            });
            break;

          case 'transportation-network-malaysia':
            // Create transportation lines
            graphicsLayer = new GraphicsLayer({
              title: layer.name,
              visible: layer.visible,
              opacity: layer.opacity,
            });

            const transportLines = [
              [
                [100.0, 3.0],
                [110.0, 3.0],
              ], // East-West highway
              [
                [101.0, 2.0],
                [101.0, 6.0],
              ], // North-South highway
              [
                [103.0, 1.5],
                [103.0, 5.5],
              ], // Another major road
            ];

            transportLines.forEach((line) => {
              const lineGeometry = new Polyline({
                paths: [line],
                spatialReference: { wkid: 4326 },
              });
              const lineSymbol = new SimpleLineSymbol({
                color: layer.color,
                width: 3,
              });
              const lineGraphic = new Graphic({
                geometry: lineGeometry,
                symbol: lineSymbol,
                attributes: { name: 'Major Highway' },
                popupTemplate: {
                  title: 'Transportation',
                  content: 'Major transportation route',
                },
              });
              graphicsLayer.add(lineGraphic);
            });
            break;

          default:
            // Create a generic polygon for other layers
            graphicsLayer = new GraphicsLayer({
              title: layer.name,
              visible: layer.visible,
              opacity: layer.opacity,
            });

            const geometry = new Polygon({
              rings: [
                [
                  [102.0, 3.0],
                  [108.0, 3.0],
                  [108.0, 5.0],
                  [102.0, 5.0],
                  [102.0, 3.0],
                ],
              ],
              spatialReference: { wkid: 4326 },
            });
            const symbol = new SimpleFillSymbol({
              color: layer.color,
              outline: new SimpleLineSymbol({
                color: [0, 0, 0, 0.8],
                width: 1,
              }),
            });
            const graphic = new Graphic({
              geometry: geometry,
              symbol: symbol,
              attributes: {
                name: layer.name,
                description: layer.description,
              },
              popupTemplate: {
                title: layer.name,
                content: layer.description,
              },
            });
            graphicsLayer.add(graphic);
        }

        if (graphicsLayer) {
          view.map.add(graphicsLayer);
          newLayerGraphics.set(layer.id, graphicsLayer);
        }
      }

      setLayerGraphics(newLayerGraphics);
      console.log('All layers initialized successfully');
    } catch (error) {
      console.error('Failed to initialize layers:', error);
    } finally {
      setLoading(false);
      console.log('Layer initialization complete');
    }
  };

  const toggleLayerVisibility = (layerId) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );

    const layerObject = layerGraphics.get(layerId);
    if (layerObject) {
      layerObject.visible = !layerObject.visible;
      console.log(`Toggled layer ${layerId} visibility to:`, layerObject.visible);
    }
  };

  const setLayerOpacity = (layerId, opacity) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) => (layer.id === layerId ? { ...layer, opacity } : layer))
    );

    const layerObject = layerGraphics.get(layerId);
    if (layerObject) {
      layerObject.opacity = opacity;
      console.log(`Set layer ${layerId} opacity to:`, opacity);
    }
  };

  const getVisibleLayersCount = () => {
    return layers.filter((layer) => layer.visible).length;
  };

  const goToBookmark = async (bookmark) => {
    console.log('Attempting to go to bookmark:', bookmark);
    console.log('Current mapView:', mapView);

    if (!mapView) {
      console.error('Map view is not initialized');
      alert('Map is not ready yet. Please wait for initialization to complete.');
      return;
    }

    try {
      console.log('Navigating to:', bookmark.location);

      const target = {
        longitude: parseFloat(bookmark.location.longitude),
        latitude: parseFloat(bookmark.location.latitude),
        zoom: 10,
      };

      console.log('Target coordinates:', target);

      await mapView.goTo({
        target: target,
        duration: 2000,
      });

      console.log('Successfully navigated to bookmark');
    } catch (error) {
      console.error('Error navigating to bookmark:', error);

      // Fallback: try with array format
      try {
        console.log('Trying fallback navigation method...');
        await mapView.goTo({
          target: [parseFloat(bookmark.location.longitude), parseFloat(bookmark.location.latitude)],
          zoom: 10,
          duration: 2000,
        });
        console.log('Successfully navigated using fallback method');
      } catch (fallbackError) {
        console.error('Fallback navigation also failed:', fallbackError);
        alert(`Failed to navigate to ${bookmark.name}. Please try again.`);
      }
    }
  };

  const toggleLayerList = () => {
    setShowLayerList(!showLayerList);
  };

  const handleLayerToggle = (layerId) => {
    toggleLayerVisibility(layerId);
  };

  const handleOpacityChange = (layerId, opacity) => {
    setLayerOpacity(layerId, opacity);
  };

  const handleLayerInfo = (layerId) => {
    setShowLayerInfo(showLayerInfo === layerId ? null : layerId);
  };

  const handleOpacityControl = (layerId) => {
    setShowOpacityControl(showOpacityControl === layerId ? null : layerId);
  };

  return (
    <div className="relative w-full h-full">
      {/* Main Map Container */}
      <div ref={mapRef} className="w-full h-full"></div>

      {/* Fallback Map Container */}
      {!mapView && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Malaysia Disaster Management Map...</p>
            <p className="text-sm text-gray-500 mt-2">Initializing ArcGIS components</p>
            <button
              onClick={manualInitialize}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Manual Initialize
            </button>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        {/* Layer List Toggle Button */}
        <button
          onClick={toggleLayerList}
          className="bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-lg shadow-lg border border-gray-200 transition-all duration-200"
          title="Toggle Layer List"
        >
          <Layers className="w-5 h-5" />
        </button>

        {/* Basemap Gallery Toggle Button */}
        <button
          onClick={() => setShowBasemapGallery(!showBasemapGallery)}
          className="bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-lg shadow-lg border border-gray-200 transition-all duration-200"
          title="Toggle Basemap Gallery"
        >
          <MapIcon className="w-5 h-5" />
        </button>

        {/* Bookmarks Toggle Button */}
        <button
          onClick={() => setShowBookmarks(!showBookmarks)}
          className="bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-lg shadow-lg border border-gray-200 transition-all duration-200"
          title="Toggle Bookmarks"
        >
          <Bookmark className="w-5 h-5" />
        </button>
      </div>

      {/* Custom Layer List Panel */}
      {showLayerList && (
        <div className="absolute top-16 right-4 z-10 bg-white rounded-lg shadow-xl border border-gray-200 w-96 max-h-[80vh] overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Malaysia Map Layers</h3>
              <p className="text-sm text-gray-600 mt-1">Manage layer visibility and settings</p>
            </div>
            <button
              onClick={toggleLayerList}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading layers...</p>
            </div>
          )}

          <div className="p-2">
            {layers.map((layer) => {
              const IconComponent = iconMap[layer.icon];
              return (
                <div key={layer.id} className="space-y-2">
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150">
                    <div className="flex items-center space-x-3 flex-1">
                      <IconComponent className="w-5 h-5 text-gray-600" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-800">{layer.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{layer.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {/* Info Button */}
                      <button
                        onClick={() => handleLayerInfo(layer.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Layer information"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      {/* Opacity Control Button */}
                      <button
                        onClick={() => handleOpacityControl(layer.id)}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Opacity settings"
                      >
                        <Settings className="w-4 h-4" />
                      </button>

                      {/* Visibility Toggle */}
                      <button
                        onClick={() => handleLayerToggle(layer.id)}
                        className={`p-2 rounded-md transition-colors duration-150 ${
                          layer.visible
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={layer.visible ? 'Hide layer' : 'Show layer'}
                      >
                        {layer.visible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Layer Information Panel */}
                  {showLayerInfo === layer.id && (
                    <div className="ml-8 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="text-sm font-medium text-blue-800 mb-2">Layer Information</h5>
                      <div className="text-xs text-blue-700 space-y-1">
                        <p>
                          <strong>Type:</strong> {layer.type}
                        </p>
                        <p>
                          <strong>Opacity:</strong> {Math.round(layer.opacity * 100)}%
                        </p>
                        <p>
                          <strong>Status:</strong> {layer.visible ? 'Visible' : 'Hidden'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Opacity Control Panel */}
                  {showOpacityControl === layer.id && (
                    <div className="ml-8 p-3 bg-green-50 rounded-lg border border-green-200">
                      <h5 className="text-sm font-medium text-green-800 mb-2">Opacity Control</h5>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={layer.opacity}
                          onChange={(e) =>
                            handleOpacityChange(layer.id, parseFloat(e.target.value))
                          }
                          className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-green-700">
                          <span>0%</span>
                          <span>{Math.round(layer.opacity * 100)}%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Click the eye icon to toggle layer visibility</p>
              <p>• Use the settings icon to adjust layer opacity</p>
              <p>• Click the info icon for layer details</p>
              <p>• Layers are optimized for Malaysia disaster management</p>
            </div>
          </div>
        </div>
      )}

      {/* Malaysia Cities Bookmarks Panel */}
      {showBookmarks && (
        <div className="absolute top-16 left-4 z-10 bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-[80vh] overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Malaysia Cities</h3>
              <p className="text-sm text-gray-600 mt-1">Quick navigation to major cities</p>
            </div>
            <button
              onClick={() => setShowBookmarks(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-2">
            {malaysiaBookmarks.map((bookmark, index) => (
              <button
                key={index}
                onClick={async (event) => {
                  // Add visual feedback
                  const button = event.target.closest('button');
                  if (button) {
                    button.classList.add('bg-blue-100');
                    setTimeout(() => button.classList.remove('bg-blue-100'), 500);
                  }

                  // Navigate to bookmark
                  await goToBookmark(bookmark);

                  // Close the bookmarks panel after navigation
                  setTimeout(() => setShowBookmarks(false), 1000);
                }}
                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150 flex items-center space-x-3"
              >
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="text-sm font-medium text-gray-800">{bookmark.name}</h4>
                  <p className="text-xs text-gray-500">{bookmark.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Layer Status Indicator */}
      <div className="absolute bottom-4 left-4 z-10 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
        <div className="text-sm text-gray-700">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${mapView ? 'bg-green-500' : 'bg-red-500'}`}
            ></span>
            <span>{mapView ? 'Map Ready' : 'Map Loading...'}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {getVisibleLayersCount()} of {layers.length} layers active
          </div>
          <div className="text-xs text-gray-500">Malaysia Disaster Management System</div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">
              {loadingMessage || 'Loading Malaysia map layers...'}
            </p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            <button
              onClick={() => setLoading(false)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Skip Loading
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
