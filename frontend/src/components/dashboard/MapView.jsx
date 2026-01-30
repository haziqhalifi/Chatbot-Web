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
  const [layers, setLayers] = useState([]);
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

  // Initialize map on component mount
  useEffect(() => {
    initializeMap();

    // Add a timeout to ensure loading doesn't get stuck
    const timeoutId = setTimeout(() => {
      if (loading) {
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
        const response = await fetch('http://localhost:8000/map/endpoints');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

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
            case 'nadma-natural-disaster':
              icon = 'AlertTriangle';
              color = [255, 0, 0, 0.6];
              break;
            case 'plan-malaysia-disaster':
              icon = 'MapIcon';
              color = [220, 53, 69, 0.5];
              break;
            default:
              icon = 'AlertTriangle';
              color = [255, 165, 0, 0.4];
          }

          return {
            id: `api-${endpoint.type}`,
            name: endpoint.name,
            visible:
              endpoint.type === 'nadma-natural-disaster' ||
              endpoint.type === 'plan-malaysia-disaster'
                ? true
                : false, // Show disaster layers by default
            type: 'api-feature',
            icon: icon,
            description: endpoint.description,
            opacity:
              endpoint.type === 'nadma-natural-disaster' ||
              endpoint.type === 'plan-malaysia-disaster'
                ? 0.7
                : 0.5,
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
      } catch (error) {}
    };

    const fetchNadmaDisasters = async () => {
      try {
        const response = await fetch('http://localhost:8000/map/nadma/disasters/db');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Add NADMA disasters as a layer
        const nadmaLayer = {
          id: 'nadma-db-disasters',
          name: 'NADMA Active Disasters (Database)',
          visible: true,
          type: 'nadma-feature',
          icon: 'AlertTriangle',
          description: 'Active disaster data from NADMA database',
          opacity: 0.9,
          color: [255, 0, 0, 0.8],
          nadmaData: result.data || [],
          isStatic: false,
        };

        setLayers((prevLayers) => [...prevLayers, nadmaLayer]);
      } catch (error) {
        // Silent error handling
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
      return json.token;
    } catch (error) {
      return null;
    }
  };

  const initializeMap = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Authenticating with ArcGIS...');

      // Generate token first
      const token = await generateArcGISToken();

      setLoadingMessage('Loading map modules...');

      let ArcGISMapView, ArcGISMap, ArcGISBasemap, ArcGISWebMap, esriConfig;

      // Import esriConfig first to set up token authentication
      try {
        const esriConfigModule = await import('@arcgis/core/config');
        esriConfig = esriConfigModule.default;

        // Configure token authentication if token is available
        if (token && esriConfig) {
          esriConfig.request.interceptors.push({
            urls: /arcgis\.com/,
            before: function (params) {
              params.requestOptions.query = params.requestOptions.query || {};
              params.requestOptions.query.token = token;
            },
          });
        }
      } catch (configError) {}

      try {
        const mapViewModule = await import('@arcgis/core/views/MapView');

        ArcGISMapView = mapViewModule.default || mapViewModule.MapView;
      } catch (mapViewError) {
        throw mapViewError;
      }

      try {
        const mapModule = await import('@arcgis/core/Map');

        ArcGISMap = mapModule.default || mapModule.Map;
      } catch (mapError) {
        throw mapError;
      }

      // Import WebMap for secured web maps
      try {
        const webMapModule = await import('@arcgis/core/WebMap');
        ArcGISWebMap = webMapModule.default || webMapModule.WebMap;
      } catch (webMapError) {
        ArcGISWebMap = null;
      }

      // Try different ways to import Basemap
      try {
        const basemapModule = await import('@arcgis/core/Basemap');
        ArcGISBasemap = basemapModule.default || basemapModule.Basemap;
      } catch (basemapImportError) {
        ArcGISBasemap = null;
      }

      setLoadingMessage('Creating map...');

      // Use secured WebMap from index.html with all its layers
      let map;
      const useSecuredWebMap = true; // Using the WebMap from index.html by default

      if (useSecuredWebMap && ArcGISWebMap && token) {
        try {
          map = new ArcGISWebMap({
            portalItem: {
              id: '84651c5dc3714cb1b9e89376a57b7c99', // WebMap ID with disaster layers
            },
          });
        } catch (webMapError) {
          map = new ArcGISMap();
        }
      } else {
        // Validate that we have the required constructors
        if (typeof ArcGISMap !== 'function') {
          throw new Error(`ArcGISMap is not a constructor. Got: ${typeof ArcGISMap}`);
        }
        if (typeof ArcGISMapView !== 'function') {
          throw new Error(`ArcGISMapView is not a constructor. Got: ${typeof ArcGISMapView}`);
        }

        // Create a simple map without basemap to avoid import issues
        map = new ArcGISMap();

        // Add a basemap after creation
        try {
          if (ArcGISBasemap && ArcGISBasemap.fromId) {
            const basemap = ArcGISBasemap.fromId('streets-vector');
            map.basemap = basemap;
          } else {
            // Try using a simple basemap string
            map.basemap = 'streets-vector';
          }
        } catch (basemapError) {
          // Final fallback
          try {
            map.basemap = 'streets-vector';
          } catch (finalError) {}
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

      setMapView(view);
      setLoadingMessage('Map view ready, loading layers...');

      // Wait for view to be ready
      await view.when();

      // Wait for map to load (especially important for WebMap)
      if (map.load) {
        await map.load();

        // Log all layers from the WebMap
        if (map.layers && map.layers.length > 0) {
          map.layers.forEach((layer, index) => {
            // Hide all layers on startup
            layer.visible = false;
          });
        }
      }

      // Initialize basic navigation widgets (like in index.html)
      await initializeBasicWidgets(view);

      // Initialize custom API layers (NADMA, Plan Malaysia, etc.) even with WebMap

      await initializeLayers(view);

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
      setLoading(false);
    }
  };

  const initializeLayers = async (view) => {
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

      for (const layer of layers) {
        let graphicsLayer;

        switch (layer.id) {
          case 'nadma-disasters':
            // Handle NADMA disasters layer

            graphicsLayer = new GraphicsLayer({
              title: layer.name,
              visible: layer.visible,
              opacity: layer.opacity,
            });

            // Add disaster points from NADMA data
            if (layer.nadmaData && Array.isArray(layer.nadmaData)) {
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
            }
            break;

          default:
            // Check if this is an API-based layer with a URL
            if (layer.type === 'api-feature' && layer.url) {
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

              break;
            }

            // Fallback: Create a generic placeholder polygon for other layers

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
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Initialize basic navigation widgets (Zoom, Home, Compass, ScaleBar)
  const initializeBasicWidgets = async (view) => {
    try {
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
    } catch (error) {}
  };

  // Initialize Search widget
  const initializeSearchWidget = async (view) => {
    try {
      const searchModule = await import('@arcgis/core/widgets/Search');
      const Search = searchModule.default || searchModule.Search;

      const expandModule = await import('@arcgis/core/widgets/Expand');
      const Expand = expandModule.default || expandModule.Expand;

      const searchWidget = new Search({ view });

      const searchExpand = new Expand({
        view: view,
        content: searchWidget,
        expanded: false,
        mode: 'floating',
      });

      view.ui.add(searchExpand, 'top-left');
    } catch (error) {}
  };

  // Initialize coordinate display (like in index.html)
  const initializeCoordinateDisplay = (view) => {
    try {
      // Create coordinate display div
      const coordDiv = document.createElement('div');
      coordDiv.style.background = 'white';
      coordDiv.style.padding = '6px';
      coordDiv.style.fontFamily = 'Arial';
      coordDiv.style.fontSize = '12px';
      coordDiv.style.borderRadius = '4px';
      coordDiv.style.boxShadow = '0 1px 2px rgba(0,0,0,0.3)';
      coordDiv.innerHTML = 'Lon: 0.00000<br>Lat: 0.00000';

      view.ui.add(coordDiv, 'top-right');

      // Update coordinates on pointer move
      view.on('pointer-move', (evt) => {
        const point = view.toMap(evt);
        if (point) {
          coordDiv.innerHTML = `Lon: ${point.longitude.toFixed(5)}<br>Lat: ${point.latitude.toFixed(5)}`;
        }
      });
    } catch (error) {}
  };

  const initializeBookmarks = async (view) => {
    try {
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
      });

      // Add the widget to the top-left corner of the view
      view.ui.add(bkExpand, 'top-left');

      // Add custom Malaysia bookmarks to the widget
      await addCustomBookmarks(bookmarks);
    } catch (error) {}
  };

  const addCustomBookmarks = async (bookmarksWidget) => {
    try {
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
      } else if (bookmarksWidget.bookmarks && bookmarksWidget.bookmarks.add) {
        // Alternative: add one by one
        for (const bookmark of customBookmarks) {
          await bookmarksWidget.bookmarks.add(bookmark);
        }
      }
    } catch (error) {}
  };

  const initializeLayerList = async (view) => {
    try {
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
        expanded: false,
      });

      // Add the widget to the top-left corner (moved to avoid chatbot overlap)
      view.ui.add(layerListExpand, 'top-left');
    } catch (error) {}
  };

  const initializeBasemapGallery = async (view) => {
    try {
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
        mode: 'floating',
      });

      // Add the widget to the top-left corner (moved to avoid chatbot overlap)
      view.ui.add(basemapExpand, 'top-left');
    } catch (error) {}
  };

  // Initialize Legend widget (from index.html)
  const initializeLegendWidget = async (view) => {
    try {
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
        mode: 'floating',
      });

      view.ui.add(legendExpand, 'top-left');
    } catch (error) {}
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
