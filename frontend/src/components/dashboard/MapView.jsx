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
  Map as MapIcon,
} from 'lucide-react';

const MapView = ({ onMapViewReady, chatSidebarWidth = 0 }) => {
  const [mapView, setMapView] = useState(null);
  const [showLayerList, setShowLayerList] = useState(false);
  const [showLayerInfo, setShowLayerInfo] = useState(null);
  const [showOpacityControl, setShowOpacityControl] = useState(null);
  const [apiEndpoints, setApiEndpoints] = useState([]);
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
      isStatic: true, // Mark as static layer (not from API)
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
      isStatic: true, // Mark as static layer (not from API)
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

  useEffect(() => {
    if (mapView && typeof onMapViewReady === 'function') {
      onMapViewReady(mapView);
    }
  }, [mapView, onMapViewReady]);

  // Update map view size when sidebar width changes
  useEffect(() => {
    if (mapView) {
      // Small delay to allow CSS transition to complete
      const timeoutId = setTimeout(() => {
        // Force the map to recalculate its size
        if (mapView.container) {
          mapView.container.style.width = '100%';
          mapView.container.style.height = '100%';
        }
        // This is a crucial call to make ArcGIS aware of the size change
        if (typeof mapView.resize === 'function') {
          mapView.resize();
        }
      }, 350); // Slightly longer than CSS transition (300ms)

      return () => clearTimeout(timeoutId);
    }
  }, [chatSidebarWidth, mapView]);

  // Fetch map endpoints from API and merge with existing layers
  useEffect(() => {
    const fetchMapEndpoints = async () => {
      try {
        console.log('Fetching map endpoints from API...');
        const response = await fetch('http://localhost:8000/map/endpoints');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Map endpoints fetched:', data.endpoints);

        setApiEndpoints(data.endpoints);

        // Map API endpoints to layer configuration
        const apiLayers = data.endpoints.map((endpoint) => {
          let icon = 'MapPin';
          let color = [0, 0, 255, 0.3];

          // Map endpoint types to icons and colors
          switch (endpoint.type) {
            case 'flood':
              icon = 'Droplets';
              color = [0, 0, 255, 0.3];
              break;
            case 'landslide':
              icon = 'Mountain';
              color = [139, 69, 19, 0.4];
              break;
            case 'poi':
              icon = 'MapPin';
              color = [255, 0, 0, 0.8];
              break;
            case 'population':
              icon = 'Building';
              color = [128, 0, 128, 0.3];
              break;
            default:
              icon = 'AlertTriangle';
              color = [255, 165, 0, 0.4];
          }

          return {
            id: `api-${endpoint.type}`,
            name: endpoint.name,
            visible: endpoint.type === 'flood' || endpoint.type === 'landslide', // Show flood and landslide by default
            type: 'api-feature',
            icon: icon,
            description: endpoint.description,
            opacity: 0.5,
            color: color,
            url: endpoint.url, // Store the ArcGIS Feature Server URL
            apiType: endpoint.type,
          };
        });

        // Merge API layers with existing static layers
        setLayers((prevLayers) => {
          const staticLayers = prevLayers.filter((layer) => layer.isStatic);
          return [...staticLayers, ...apiLayers];
        });

        console.log('Layers updated with API data');
      } catch (error) {
        console.error('Error fetching map endpoints:', error);
        // Continue with existing layers if API fails
      }
    };

    const fetchNadmaDisasters = async () => {
      try {
        console.log('Fetching NADMA disasters directly from NADMA API...');
        const NADMA_API_URL = 'https://mydims.nadma.gov.my/api/disasters';
        const NADMA_TOKEN = '6571756|yN5L6StiHQOlyouD5FjmMFBOeywAxjPE79x0m7n843ac4e63';

        const response = await fetch(NADMA_API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${NADMA_TOKEN}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('NADMA disasters fetched:', result);

        // Add NADMA disasters as a layer
        const nadmaLayer = {
          id: 'nadma-disasters',
          name: 'NADMA Real-time Disasters',
          visible: true,
          type: 'nadma-feature',
          icon: 'AlertTriangle',
          description: 'Real-time disaster data from NADMA MyDIMS',
          opacity: 1.0,
          color: [255, 0, 0, 0.8],
          nadmaData: Array.isArray(result) ? result : result.data || [],
          isStatic: false,
        };

        setLayers((prevLayers) => [...prevLayers, nadmaLayer]);
        console.log('NADMA layer added to map');
      } catch (error) {
        console.error('Error fetching NADMA disasters:', error);
      }
    };

    fetchMapEndpoints();
    fetchNadmaDisasters();
  }, []); // Run once on mount

  // Generate ArcGIS token for authentication
  const generateArcGISToken = async () => {
    try {
      const params = new URLSearchParams({
        username: 'kleos_dev',
        password: 'Pass@1234',
        client: 'referer',
        referer: window.location.origin,
        expiration: 120,
        f: 'json',
      });

      const response = await fetch('https://www.arcgis.com/sharing/rest/generateToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });

      const json = await response.json();
      console.log('ArcGIS Token generated successfully');
      return json.token;
    } catch (error) {
      console.error('Failed to generate ArcGIS token:', error);
      return null;
    }
  };

  const initializeMap = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Authenticating with ArcGIS...');
      console.log('Initializing map...');

      // Generate token first
      const token = await generateArcGISToken();
      if (!token) {
        console.warn('Failed to generate token, continuing without authentication');
      }

      setLoadingMessage('Loading map modules...');

      // Import ArcGIS modules with different variable names to avoid conflicts
      let ArcGISMapView, ArcGISMap, ArcGISBasemap, ArcGISWebMap, esriConfig;

      // Import esriConfig first to set up token authentication
      try {
        const esriConfigModule = await import('@arcgis/core/config');
        esriConfig = esriConfigModule.default;
        console.log('esriConfig imported successfully');

        // Configure token authentication if token is available
        if (token && esriConfig) {
          esriConfig.request.interceptors.push({
            urls: /arcgis\.com/,
            before: function (params) {
              params.requestOptions.query = params.requestOptions.query || {};
              params.requestOptions.query.token = token;
            },
          });
          console.log('Token interceptor configured successfully');
        }
      } catch (configError) {
        console.error('Failed to import esriConfig:', configError);
      }

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

      // Import WebMap for secured web maps
      try {
        const webMapModule = await import('@arcgis/core/WebMap');
        ArcGISWebMap = webMapModule.default || webMapModule.WebMap;
        console.log('WebMap imported successfully');
      } catch (webMapError) {
        console.log('Failed to import WebMap:', webMapError);
        ArcGISWebMap = null;
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
        WebMap: ArcGISWebMap,
        Basemap: ArcGISBasemap,
        esriConfig: esriConfig,
      });

      setLoadingMessage('Creating map...');

      // Use secured WebMap from index.html with all its layers
      let map;
      const useSecuredWebMap = true; // Using the WebMap from index.html by default

      if (useSecuredWebMap && ArcGISWebMap && token) {
        console.log('Creating secured WebMap with ID: 9186757d793f4b0d87d58a65ae16c736');
        try {
          map = new ArcGISWebMap({
            portalItem: {
              id: '9186757d793f4b0d87d58a65ae16c736', // WebMap ID from index.html
            },
          });
          console.log(
            'Secured WebMap created successfully - all layers will be loaded from WebMap'
          );
        } catch (webMapError) {
          console.error('Failed to create WebMap, falling back to basic map:', webMapError);
          map = new ArcGISMap();
        }
      } else {
        console.log('Token not available or WebMap module not loaded, using basic map');

        // Validate that we have the required constructors
        if (typeof ArcGISMap !== 'function') {
          throw new Error(`ArcGISMap is not a constructor. Got: ${typeof ArcGISMap}`);
        }
        if (typeof ArcGISMapView !== 'function') {
          throw new Error(`ArcGISMapView is not a constructor. Got: ${typeof ArcGISMapView}`);
        }

        // Create a simple map without basemap to avoid import issues
        map = new ArcGISMap();
        console.log('Basic map created successfully');

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
      }

      // Create the view with settings from index.html
      const view = new ArcGISMapView({
        container: mapRef.current,
        map: map,
        center: [101.58, 3.08], // Petaling (from index.html)
        zoom: 11, // Zoom level from index.html
        constraints: {
          minZoom: 3, // Prevents zooming out too far
        },
        ui: {
          components: [], // Remove all default UI components to avoid duplicates
        },
      });

      console.log('Map view created successfully');
      setMapView(view);
      setLoadingMessage('Map view ready, loading layers...');

      // Wait for view to be ready
      await view.when();
      console.log('View is ready');

      // Wait for map to load (especially important for WebMap)
      if (map.load) {
        await map.load();
        console.log('Map loaded successfully');

        // Log all layers from the WebMap
        if (map.layers && map.layers.length > 0) {
          console.log(`WebMap contains ${map.layers.length} layers:`);
          map.layers.forEach((layer, index) => {
            console.log(`  Layer ${index + 1}: ${layer.title || layer.id} (${layer.type})`);
          });
        }
      }

      // Initialize basic navigation widgets (like in index.html)
      await initializeBasicWidgets(view);

      // Only initialize custom layers if not using WebMap (WebMap has its own layers)
      if (!useSecuredWebMap) {
        await initializeLayers(view);
      } else {
        console.log('Using WebMap layers - skipping custom layer initialization');
        setLoading(false);
      }

      // Initialize Bookmarks widget
      await initializeBookmarks(view);

      // Initialize LayerList widget (will show WebMap layers)
      await initializeLayerList(view);

      // Initialize BasemapGallery widget
      await initializeBasemapGallery(view);

      // Initialize Search widget
      await initializeSearchWidget(view);

      // Initialize Legend widget (from index.html)
      await initializeLegendWidget(view);

      // Initialize coordinate display (like in index.html)
      initializeCoordinateDisplay(view);
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
            // Create flood risk area over Kelantan (Kota Bharu)
            graphicsLayer = new GraphicsLayer({
              title: layer.name,
              visible: layer.visible,
              opacity: layer.opacity,
            });

            const floodGeometry = new Polygon({
              rings: [
                [
                  [102.15, 6.1], // Near Kota Bharu, Kelantan
                  [102.3, 6.1],
                  [102.3, 6.25],
                  [102.15, 6.25],
                  [102.15, 6.1],
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
            // Create emergency service points at real hospitals
            graphicsLayer = new GraphicsLayer({
              title: layer.name,
              visible: layer.visible,
              opacity: layer.opacity,
            });

            const emergencyPoints = [
              { longitude: 101.6869, latitude: 3.139, name: 'Hospital Kuala Lumpur' },
              {
                longitude: 102.2405,
                latitude: 6.1254,
                name: 'Hospital Raja Perempuan Zainab II, Kota Bharu',
              },
              { longitude: 100.3075, latitude: 5.4164, name: 'Hospital Pulau Pinang' },
              {
                longitude: 103.4271,
                latitude: 3.8236,
                name: 'Hospital Tengku Ampuan Afzan, Kuantan',
              },
              {
                longitude: 116.0735,
                latitude: 5.9804,
                name: 'Hospital Queen Elizabeth, Kota Kinabalu',
              },
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

          case 'landslide-risk-malaysia':
            // Landslide risk polygon over Genting Highlands
            graphicsLayer = new GraphicsLayer({
              title: layer.name,
              visible: layer.visible,
              opacity: layer.opacity,
            });
            const landslideGeometry = new Polygon({
              rings: [
                [
                  [101.76, 3.4],
                  [101.8, 3.4],
                  [101.8, 3.45],
                  [101.76, 3.45],
                  [101.76, 3.4],
                ],
              ],
              spatialReference: { wkid: 4326 },
            });
            const landslideSymbol = new SimpleFillSymbol({
              color: layer.color,
              outline: new SimpleLineSymbol({
                color: [139, 69, 19, 1],
                width: 1,
              }),
            });
            const landslideGraphic = new Graphic({
              geometry: landslideGeometry,
              symbol: landslideSymbol,
              attributes: {
                name: layer.name,
                description: layer.description,
              },
              popupTemplate: {
                title: layer.name,
                content: layer.description,
              },
            });
            graphicsLayer.add(landslideGraphic);
            break;

          case 'tsunami-risk-malaysia':
            // Tsunami risk polygon over Penang coast
            graphicsLayer = new GraphicsLayer({
              title: layer.name,
              visible: layer.visible,
              opacity: layer.opacity,
            });
            const tsunamiGeometry = new Polygon({
              rings: [
                [
                  [100.2, 5.2],
                  [100.4, 5.2],
                  [100.4, 5.5],
                  [100.2, 5.5],
                  [100.2, 5.2],
                ],
              ],
              spatialReference: { wkid: 4326 },
            });
            const tsunamiSymbol = new SimpleFillSymbol({
              color: layer.color,
              outline: new SimpleLineSymbol({
                color: [255, 165, 0, 1],
                width: 1,
              }),
            });
            const tsunamiGraphic = new Graphic({
              geometry: tsunamiGeometry,
              symbol: tsunamiSymbol,
              attributes: {
                name: layer.name,
                description: layer.description,
              },
              popupTemplate: {
                title: layer.name,
                content: layer.description,
              },
            });
            graphicsLayer.add(tsunamiGraphic);
            break;

          case 'earthquake-risk-malaysia':
            // Earthquake risk polygon over Ranau, Sabah
            graphicsLayer = new GraphicsLayer({
              title: layer.name,
              visible: layer.visible,
              opacity: layer.opacity,
            });
            const earthquakeGeometry = new Polygon({
              rings: [
                [
                  [116.6, 5.9],
                  [116.8, 5.9],
                  [116.8, 6.1],
                  [116.6, 6.1],
                  [116.6, 5.9],
                ],
              ],
              spatialReference: { wkid: 4326 },
            });
            const earthquakeSymbol = new SimpleFillSymbol({
              color: layer.color,
              outline: new SimpleLineSymbol({
                color: [255, 0, 0, 1],
                width: 1,
              }),
            });
            const earthquakeGraphic = new Graphic({
              geometry: earthquakeGeometry,
              symbol: earthquakeSymbol,
              attributes: {
                name: layer.name,
                description: layer.description,
              },
              popupTemplate: {
                title: layer.name,
                content: layer.description,
              },
            });
            graphicsLayer.add(earthquakeGraphic);
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

          case 'nadma-disasters':
            // Handle NADMA disasters layer
            console.log('Creating NADMA disasters layer...');
            graphicsLayer = new GraphicsLayer({
              title: layer.name,
              visible: layer.visible,
              opacity: layer.opacity,
            });

            // Add disaster points from NADMA data
            if (layer.nadmaData && Array.isArray(layer.nadmaData)) {
              console.log(`Adding ${layer.nadmaData.length} NADMA disaster points`);

              layer.nadmaData.forEach((disaster) => {
                // Extract coordinates from NADMA API format
                const lat = parseFloat(disaster.latitude);
                const lon = parseFloat(disaster.longitude);

                if (lat && lon && !isNaN(lat) && !isNaN(lon)) {
                  const point = new Point({
                    longitude: lon,
                    latitude: lat,
                    spatialReference: { wkid: 4326 },
                  });

                  // Get disaster category color and icon
                  const kategoriName = disaster.kategori?.name || 'Unknown';
                  let symbolColor = [255, 0, 0, 0.8]; // Default red

                  // Color code by disaster type
                  if (
                    kategoriName.toLowerCase().includes('banjir') ||
                    kategoriName.toLowerCase().includes('flood')
                  ) {
                    symbolColor = [0, 123, 255, 0.8]; // Blue for floods
                  } else if (
                    kategoriName.toLowerCase().includes('tanah runtuh') ||
                    kategoriName.toLowerCase().includes('landslide')
                  ) {
                    symbolColor = [255, 193, 7, 0.8]; // Amber for landslides
                  } else if (
                    kategoriName.toLowerCase().includes('kebakaran') ||
                    kategoriName.toLowerCase().includes('fire')
                  ) {
                    symbolColor = [255, 87, 34, 0.8]; // Orange for fires
                  } else if (
                    kategoriName.toLowerCase().includes('ribut') ||
                    kategoriName.toLowerCase().includes('storm')
                  ) {
                    symbolColor = [156, 39, 176, 0.8]; // Purple for storms
                  }

                  // Use different marker styles based on status
                  const isActive = disaster.status?.toLowerCase() === 'aktif';
                  const symbol = new SimpleMarkerSymbol({
                    style: isActive ? 'circle' : 'square',
                    color: symbolColor,
                    size: disaster.bencana_khas?.toLowerCase() === 'ya' ? '16px' : '12px',
                    outline: {
                      color:
                        disaster.bencana_khas?.toLowerCase() === 'ya'
                          ? [255, 255, 0]
                          : [255, 255, 255],
                      width: disaster.bencana_khas?.toLowerCase() === 'ya' ? 3 : 2,
                    },
                  });

                  // Create detailed popup content
                  const popupContent = `
                    <div style="font-family: Arial, sans-serif;">
                      <div style="margin-bottom: 12px;">
                        <strong style="font-size: 16px; color: #1a73e8;">Disaster #${disaster.id}</strong>
                        ${
                          disaster.bencana_khas?.toLowerCase() === 'ya'
                            ? '<span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 8px;">SPECIAL CASE</span>'
                            : ''
                        }
                      </div>
                      
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 4px 0; font-weight: bold; width: 40%;">Category:</td>
                          <td style="padding: 4px 0;">${kategoriName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; font-weight: bold;">Status:</td>
                          <td style="padding: 4px 0;">
                            <span style="background: ${isActive ? '#ff9800' : '#4caf50'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                              ${disaster.status || 'N/A'}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; font-weight: bold;">Location:</td>
                          <td style="padding: 4px 0;">${disaster.district?.name || 'N/A'}, ${disaster.state?.name || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; font-weight: bold;">Started:</td>
                          <td style="padding: 4px 0;">${disaster.datetime_start ? new Date(disaster.datetime_start).toLocaleString() : 'N/A'}</td>
                        </tr>
                        ${
                          disaster.case
                            ? `
                        <tr>
                          <td style="padding: 4px 0; font-weight: bold;">Relief Centers:</td>
                          <td style="padding: 4px 0;">${disaster.case.jumlah_pps || 0} centers</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; font-weight: bold;">Families Affected:</td>
                          <td style="padding: 4px 0;">${disaster.case.jumlah_keluarga || 0} families</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; font-weight: bold;">Total Victims:</td>
                          <td style="padding: 4px 0;">${disaster.case.jumlah_mangsa || 0} people</td>
                        </tr>
                        `
                            : ''
                        }
                        ${
                          disaster.description
                            ? `
                        <tr>
                          <td colspan="2" style="padding: 8px 0;">
                            <strong>Description:</strong><br>
                            ${disaster.description}
                          </td>
                        </tr>
                        `
                            : ''
                        }
                      </table>
                      
                      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #ddd;">
                        <a href="https://maps.google.com/?q=${lat},${lon}" target="_blank" 
                           style="color: #1a73e8; text-decoration: none; font-weight: bold;">
                          📍 View on Google Maps
                        </a>
                      </div>
                    </div>
                  `;

                  const graphic = new Graphic({
                    geometry: point,
                    symbol: symbol,
                    attributes: {
                      id: disaster.id,
                      name: `Disaster #${disaster.id}`,
                      type: kategoriName,
                      status: disaster.status,
                      state: disaster.state?.name,
                      district: disaster.district?.name,
                      specialCase: disaster.bencana_khas,
                      ...disaster,
                    },
                    popupTemplate: {
                      title: `${kategoriName} - #${disaster.id}`,
                      content: popupContent,
                    },
                  });

                  graphicsLayer.add(graphic);
                }
              });

              console.log(`Added ${graphicsLayer.graphics.length} disaster points to map`);
            }
            break;

          default:
            // Check if this is an API-based layer with a URL
            if (layer.type === 'api-feature' && layer.url) {
              console.log(`Creating API-based FeatureLayer for: ${layer.name}`);
              console.log(`Using URL: ${layer.url}`);

              // Create a FeatureLayer from the API endpoint URL
              const apiLayer = new FeatureLayer({
                url: layer.url,
                title: layer.name,
                visible: layer.visible,
                opacity: layer.opacity,
                outFields: ['*'],
                popupTemplate: {
                  title: layer.name,
                  content: layer.description,
                },
              });

              view.map.add(apiLayer);
              newLayerGraphics.set(layer.id, apiLayer);
              console.log(`Added API layer: ${layer.name}`);
              break;
            }

            // Fallback: Create a generic placeholder polygon for other layers
            console.log(`Creating generic placeholder for: ${layer.name}`);
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

  // Initialize basic navigation widgets (Zoom, Home, Compass, ScaleBar)
  const initializeBasicWidgets = async (view) => {
    try {
      console.log('Initializing basic navigation widgets...');
      setLoadingMessage('Setting up navigation tools...');

      // Import widget modules
      const zoomModule = await import('@arcgis/core/widgets/Zoom');
      const Zoom = zoomModule.default || zoomModule.Zoom;

      const homeModule = await import('@arcgis/core/widgets/Home');
      const Home = homeModule.default || homeModule.Home;

      const compassModule = await import('@arcgis/core/widgets/Compass');
      const Compass = compassModule.default || compassModule.Compass;

      const scaleBarModule = await import('@arcgis/core/widgets/ScaleBar');
      const ScaleBar = scaleBarModule.default || scaleBarModule.ScaleBar;

      // Add Zoom widget
      view.ui.add(new Zoom({ view }), 'top-left');

      // Add Home widget
      view.ui.add(new Home({ view }), 'top-left');

      // Add Compass widget
      view.ui.add(new Compass({ view }), 'top-left');

      // Add ScaleBar widget
      const scaleBar = new ScaleBar({ view, unit: 'metric' });
      view.ui.add(scaleBar, 'bottom-left');

      console.log('Basic navigation widgets initialized successfully');
    } catch (error) {
      console.error('Failed to initialize basic widgets:', error);
    }
  };

  // Initialize Search widget
  const initializeSearchWidget = async (view) => {
    try {
      console.log('Initializing Search widget...');

      const searchModule = await import('@arcgis/core/widgets/Search');
      const Search = searchModule.default || searchModule.Search;

      const expandModule = await import('@arcgis/core/widgets/Expand');
      const Expand = expandModule.default || expandModule.Expand;

      const searchWidget = new Search({ view });

      const searchExpand = new Expand({
        view: view,
        content: searchWidget,
        expanded: false,
        expandIconClass: 'esri-icon-search',
        expandTooltip: 'Search',
        mode: 'floating',
      });

      view.ui.add(searchExpand, 'top-left');
      console.log('Search widget initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Search widget:', error);
    }
  };

  // Initialize coordinate display (like in index.html)
  const initializeCoordinateDisplay = (view) => {
    try {
      console.log('Initializing coordinate display...');

      // Create coordinate display div
      const coordDiv = document.createElement('div');
      coordDiv.style.background = 'white';
      coordDiv.style.padding = '6px';
      coordDiv.style.fontFamily = 'Arial';
      coordDiv.style.fontSize = '12px';
      coordDiv.style.borderRadius = '4px';
      coordDiv.style.boxShadow = '0 1px 2px rgba(0,0,0,0.3)';
      coordDiv.innerHTML = 'Lon: 0.00000<br>Lat: 0.00000';

      view.ui.add(coordDiv, 'bottom-right');

      // Update coordinates on pointer move
      view.on('pointer-move', (evt) => {
        const point = view.toMap(evt);
        if (point) {
          coordDiv.innerHTML = `Lon: ${point.longitude.toFixed(5)}<br>Lat: ${point.latitude.toFixed(5)}`;
        }
      });

      console.log('Coordinate display initialized successfully');
    } catch (error) {
      console.error('Failed to initialize coordinate display:', error);
    }
  };

  const initializeBookmarks = async (view) => {
    try {
      console.log('Initializing Bookmarks widget...');
      setLoadingMessage('Setting up bookmarks...');

      // Import Bookmarks and Expand widgets
      const bookmarksModule = await import('@arcgis/core/widgets/Bookmarks');
      const Bookmarks = bookmarksModule.default || bookmarksModule.Bookmarks;

      const expandModule = await import('@arcgis/core/widgets/Expand');
      const Expand = expandModule.default || expandModule.Expand;

      // Create bookmarks widget
      const bookmarks = new Bookmarks({
        view: view,
      });

      // Create expand widget to contain bookmarks
      const bkExpand = new Expand({
        view: view,
        content: bookmarks,
        expanded: false,
        expandIconClass: 'esri-icon-bookmark',
        expandTooltip: 'Bookmarks',
      });

      // Add the widget to the top-left corner of the view
      view.ui.add(bkExpand, 'top-left');

      console.log('Bookmarks widget initialized successfully');

      // Add custom Malaysia bookmarks to the widget
      await addCustomBookmarks(bookmarks);
    } catch (error) {
      console.error('Failed to initialize Bookmarks widget:', error);
    }
  };

  const addCustomBookmarks = async (bookmarksWidget) => {
    try {
      console.log('Adding custom Malaysia bookmarks...');

      // Create bookmark objects directly without importing Bookmark class
      const customBookmarks = malaysiaBookmarks.map((bookmark) => ({
        name: bookmark.name,
        extent: {
          xmin: bookmark.location.longitude - 0.1,
          ymin: bookmark.location.latitude - 0.1,
          xmax: bookmark.location.longitude + 0.1,
          ymax: bookmark.location.latitude + 0.1,
          spatialReference: { wkid: 4326 },
        },
        viewpoint: {
          targetGeometry: {
            type: 'point',
            longitude: bookmark.location.longitude,
            latitude: bookmark.location.latitude,
            spatialReference: { wkid: 4326 },
          },
          rotation: 0,
          scale: 100000,
        },
      }));

      // Add bookmarks to the widget's bookmarks collection
      if (bookmarksWidget.bookmarks && bookmarksWidget.bookmarks.addMany) {
        await bookmarksWidget.bookmarks.addMany(customBookmarks);
        console.log(`Added ${customBookmarks.length} custom bookmarks successfully`);
      } else if (bookmarksWidget.bookmarks && bookmarksWidget.bookmarks.add) {
        // Alternative: add one by one
        for (const bookmark of customBookmarks) {
          await bookmarksWidget.bookmarks.add(bookmark);
        }
        console.log(`Added ${customBookmarks.length} custom bookmarks successfully`);
      } else {
        console.warn(
          'Bookmarks collection not available, bookmarks widget may not be fully initialized'
        );
        console.log('Available properties on bookmarksWidget:', Object.keys(bookmarksWidget));
      }
    } catch (error) {
      console.error('Failed to add custom bookmarks:', error);
    }
  };

  const initializeLayerList = async (view) => {
    try {
      console.log('Initializing LayerList widget...');
      setLoadingMessage('Setting up layer list...');

      // Import LayerList and Expand widgets
      const layerListModule = await import('@arcgis/core/widgets/LayerList');
      const LayerList = layerListModule.default || layerListModule.LayerList;

      const expandModule = await import('@arcgis/core/widgets/Expand');
      const Expand = expandModule.default || expandModule.Expand;

      // Create layer list widget
      const layerList = new LayerList({
        view: view,
        listItemCreatedFunction: (event) => {
          const item = event.item;
          if (item.layer.type !== 'group') {
            // Add panel for layer actions
            item.panel = {
              content: 'legend',
              open: false,
            };
          }
        },
      });

      // Create expand widget to contain layer list
      const layerListExpand = new Expand({
        view: view,
        content: layerList,
        expanded: true,
        expandIconClass: 'esri-icon-layers',
        expandTooltip: 'Layer List',
      });

      // Add the widget to the top-left corner (moved to avoid chatbot overlap)
      view.ui.add(layerListExpand, 'top-left');

      console.log('LayerList widget initialized successfully');
    } catch (error) {
      console.error('Failed to initialize LayerList widget:', error);
    }
  };

  const initializeBasemapGallery = async (view) => {
    try {
      console.log('Initializing BasemapGallery widget...');
      setLoadingMessage('Setting up basemap gallery...');

      // Import BasemapGallery and Expand widgets
      const basemapGalleryModule = await import('@arcgis/core/widgets/BasemapGallery');
      const BasemapGallery = basemapGalleryModule.default || basemapGalleryModule.BasemapGallery;

      const expandModule = await import('@arcgis/core/widgets/Expand');
      const Expand = expandModule.default || expandModule.Expand;

      // Create basemap gallery widget
      const basemapGallery = new BasemapGallery({
        view: view,
        source: {
          portal: {
            url: 'https://www.arcgis.com',
            useVectorBasemaps: true,
          },
        },
      });

      // Create expand widget to contain basemap gallery
      const basemapExpand = new Expand({
        view: view,
        content: basemapGallery,
        expanded: false,
        expandIconClass: 'esri-icon-basemap',
        expandTooltip: 'Basemap Gallery',
        mode: 'floating',
      });

      // Add the widget to the top-left corner (moved to avoid chatbot overlap)
      view.ui.add(basemapExpand, 'top-left');

      console.log('BasemapGallery widget initialized successfully');
    } catch (error) {
      console.error('Failed to initialize BasemapGallery widget:', error);
    }
  };

  // Initialize Legend widget (from index.html)
  const initializeLegendWidget = async (view) => {
    try {
      console.log('Initializing Legend widget...');

      const legendModule = await import('@arcgis/core/widgets/Legend');
      const Legend = legendModule.default || legendModule.Legend;

      const expandModule = await import('@arcgis/core/widgets/Expand');
      const Expand = expandModule.default || expandModule.Expand;

      const legend = new Legend({
        view: view,
      });

      const legendExpand = new Expand({
        view: view,
        content: legend,
        expanded: false,
        expandIconClass: 'esri-icon-legend',
        expandTooltip: 'Legend',
        mode: 'floating',
      });

      view.ui.add(legendExpand, 'top-left');
      console.log('Legend widget initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Legend widget:', error);
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
    <div 
      className="relative h-full transition-all duration-300 ease-in-out"
      style={{
        width: chatSidebarWidth > 0 ? `calc(100% - ${chatSidebarWidth}px)` : '100%',
      }}
    >
      {/* Main Map Container */}
      <div ref={mapRef} className="w-full h-full" id="real-map-container"></div>
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
      {/* {/* Layer Status Indicator */}
      {/* <div className="absolute bottom-4 left-4 z-10 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
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
      </div>  */}
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
