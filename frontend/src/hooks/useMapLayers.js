import { useState, useEffect, useCallback } from 'react';

// Malaysia-specific layer configurations - simplified for demo purposes
const MALAYSIA_LAYERS = [
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
];

export const useMapLayers = (mapView) => {
  const [layers, setLayers] = useState(MALAYSIA_LAYERS);
  const [layerObjects, setLayerObjects] = useState(new Map());
  const [loading, setLoading] = useState(false);

  // Create a simple graphics layer for demo purposes
  const createDemoLayer = useCallback(
    async (layerConfig) => {
      if (!mapView) return null;

      try {
        const { GraphicsLayer } = await import('@arcgis/core/layers/GraphicsLayer');
        const { Graphic } = await import('@arcgis/core/Graphic');
        const { Polygon, Point, Polyline } = await import('@arcgis/core/geometry');
        const { SimpleFillSymbol, SimpleMarkerSymbol, SimpleLineSymbol } = await import(
          '@arcgis/core/symbols'
        );

        const graphicsLayer = new GraphicsLayer({
          title: layerConfig.name,
          visible: layerConfig.visible,
          opacity: layerConfig.opacity,
        });

        // Create demo graphics based on layer type
        let symbol;
        let geometry;

        switch (layerConfig.id) {
          case 'malaysia-boundaries':
            // Create a simple polygon representing Malaysia
            geometry = new Polygon({
              rings: [
                [
                  [100.0, 1.0],
                  [120.0, 1.0],
                  [120.0, 7.0],
                  [100.0, 7.0],
                  [100.0, 1.0],
                ],
              ],
              spatialReference: { wkid: 4326 },
            });
            symbol = new SimpleFillSymbol({
              color: [200, 200, 200, 0.1],
              outline: new SimpleLineSymbol({
                color: layerConfig.color,
                width: 2,
              }),
            });
            break;

          case 'flood-risk-malaysia':
            // Create flood risk areas
            geometry = new Polygon({
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
            symbol = new SimpleFillSymbol({
              color: layerConfig.color,
              outline: new SimpleLineSymbol({
                color: [0, 0, 255, 0.8],
                width: 1,
              }),
            });
            break;

          case 'emergency-services-malaysia':
            // Create emergency service points
            geometry = new Point({
              longitude: 101.6869,
              latitude: 3.139,
              spatialReference: { wkid: 4326 },
            });
            symbol = new SimpleMarkerSymbol({
              color: layerConfig.color,
              size: 12,
              outline: new SimpleLineSymbol({
                color: [255, 255, 255, 1],
                width: 2,
              }),
            });
            break;

          case 'transportation-network-malaysia':
            // Create transportation lines
            geometry = new Polyline({
              paths: [
                [
                  [100.0, 3.0],
                  [110.0, 3.0],
                ],
              ],
              spatialReference: { wkid: 4326 },
            });
            symbol = new SimpleLineSymbol({
              color: layerConfig.color,
              width: 3,
            });
            break;

          default:
            // Create a generic polygon for other layers
            geometry = new Polygon({
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
            symbol = new SimpleFillSymbol({
              color: layerConfig.color,
              outline: new SimpleLineSymbol({
                color: [0, 0, 0, 0.8],
                width: 1,
              }),
            });
        }

        const graphic = new Graphic({
          geometry: geometry,
          symbol: symbol,
          attributes: {
            name: layerConfig.name,
            description: layerConfig.description,
          },
          popupTemplate: {
            title: layerConfig.name,
            content: layerConfig.description,
          },
        });

        graphicsLayer.add(graphic);
        mapView.map.add(graphicsLayer);

        return graphicsLayer;
      } catch (error) {
        console.error(`Failed to create demo layer ${layerConfig.name}:`, error);
        return null;
      }
    },
    [mapView]
  );

  // Initialize all layers
  const initializeLayers = useCallback(async () => {
    if (!mapView) return;

    setLoading(true);
    const newLayerObjects = new Map();

    try {
      for (const layerConfig of layers) {
        const layer = await createDemoLayer(layerConfig);
        if (layer) {
          newLayerObjects.set(layerConfig.id, layer);
        }
      }

      setLayerObjects(newLayerObjects);
    } catch (error) {
      console.error('Failed to initialize layers:', error);
    } finally {
      setLoading(false);
    }
  }, [mapView, layers, createDemoLayer]);

  // Toggle layer visibility
  const toggleLayerVisibility = useCallback(
    (layerId) => {
      setLayers((prevLayers) =>
        prevLayers.map((layer) =>
          layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
        )
      );

      const layerObject = layerObjects.get(layerId);
      if (layerObject) {
        layerObject.visible = !layerObject.visible;
      }
    },
    [layerObjects]
  );

  // Set layer opacity
  const setLayerOpacity = useCallback(
    (layerId, opacity) => {
      setLayers((prevLayers) =>
        prevLayers.map((layer) => (layer.id === layerId ? { ...layer, opacity } : layer))
      );

      const layerObject = layerObjects.get(layerId);
      if (layerObject) {
        layerObject.opacity = opacity;
      }
    },
    [layerObjects]
  );

  // Get visible layers count
  const getVisibleLayersCount = useCallback(() => {
    return layers.filter((layer) => layer.visible).length;
  }, [layers]);

  // Get layer by ID
  const getLayer = useCallback(
    (layerId) => {
      return layers.find((layer) => layer.id === layerId);
    },
    [layers]
  );

  // Initialize layers when map view is ready
  useEffect(() => {
    if (mapView) {
      initializeLayers();
    }
  }, [mapView, initializeLayers]);

  return {
    layers,
    layerObjects,
    loading,
    toggleLayerVisibility,
    setLayerOpacity,
    getVisibleLayersCount,
    getLayer,
    initializeLayers,
  };
};
