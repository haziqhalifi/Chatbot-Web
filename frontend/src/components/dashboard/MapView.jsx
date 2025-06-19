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

const MapView = () => {
  // NOTE: This component now uses official ArcGIS widgets:
  // - LayerList widget (top-left corner) - for layer visibility and opacity controls
  // - BasemapGallery widget (top-right corner) - for basemap selection
  // - Bookmarks widget (top-right corner) - for Malaysia city navigation
  // The custom layer list panel and control buttons below can be removed to avoid overlap.

  const [mapView, setMapView] = useState(null);
  const [showLayerList, setShowLayerList] = useState(false);
  const [showLayerInfo, setShowLayerInfo] = useState(null);
  const [showOpacityControl, setShowOpacityControl] = useState(null);
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

      // Initialize Bookmarks widget
      await initializeBookmarks(view);

      // Initialize LayerList widget
      await initializeLayerList(view);

      // Initialize BasemapGallery widget
      await initializeBasemapGallery(view);
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

      // Add the widget to the top-right corner of the view
      view.ui.add(bkExpand, 'top-right');

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
          // Customize layer list items
          const item = event.item;
          if (item.layer) {
            // Add custom actions or styling if needed
            console.log(`Layer list item created for: ${item.layer.title}`);
          }
        },
      });

      // Create expand widget to contain layer list
      const layerListExpand = new Expand({
        view: view,
        content: layerList,
        expanded: false,
        expandIconClass: 'esri-icon-layers',
        expandTooltip: 'Layer List',
        mode: 'floating',
      });

      // Add the widget to the top-left corner of the view
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

      // Add the widget to the top-right corner of the view (below bookmarks)
      view.ui.add(basemapExpand, 'top-right');

      console.log('BasemapGallery widget initialized successfully');
    } catch (error) {
      console.error('Failed to initialize BasemapGallery widget:', error);
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
