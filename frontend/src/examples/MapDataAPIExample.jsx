/**
 * Example usage of the Map Data API endpoints
 *
 * This file demonstrates how to fetch and use the ArcGIS Feature Server
 * endpoints from the backend API in a React component.
 */

import { useEffect, useState } from 'react';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

/**
 * Hook to fetch map endpoints from the backend
 */
export const useMapEndpoints = () => {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEndpoints = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/map/endpoints');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setEndpoints(data.endpoints);
        setError(null);
      } catch (err) {
        console.error('Error fetching map endpoints:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEndpoints();
  }, []);

  return { endpoints, loading, error };
};

/**
 * Hook to fetch a specific endpoint by type
 */
export const useMapEndpointByType = (type) => {
  const [endpoint, setEndpoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!type) {
      setLoading(false);
      return;
    }

    const fetchEndpoint = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/map/endpoints/${type}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setEndpoint(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching ${type} endpoint:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEndpoint();
  }, [type]);

  return { endpoint, loading, error };
};

/**
 * Create ArcGIS FeatureLayer from endpoint data
 */
export const createFeatureLayerFromEndpoint = (endpoint, options = {}) => {
  if (!endpoint || !endpoint.url) {
    console.error('Invalid endpoint data:', endpoint);
    return null;
  }

  return new FeatureLayer({
    url: endpoint.url,
    title: endpoint.name,
    visible: options.visible ?? true,
    opacity: options.opacity ?? 0.6,
    outFields: ['*'],
    popupTemplate: {
      title: endpoint.name,
      content: endpoint.description,
    },
    ...options,
  });
};

/**
 * Example React component that uses the map endpoints
 */
export const MapDataExample = ({ mapView }) => {
  const { endpoints, loading, error } = useMapEndpoints();
  const [activeLayers, setActiveLayers] = useState([]);

  useEffect(() => {
    if (!mapView || !endpoints.length) return;

    // Create feature layers from endpoints
    const layers = endpoints
      .map((endpoint) => {
        const layer = createFeatureLayerFromEndpoint(endpoint, {
          visible: endpoint.type === 'flood' || endpoint.type === 'landslide', // Show flood and landslide by default
          opacity: 0.5,
        });
        return layer;
      })
      .filter(Boolean); // Remove any null layers

    // Add layers to map
    layers.forEach((layer) => {
      mapView.map.add(layer);
    });

    setActiveLayers(layers);

    // Cleanup function to remove layers when component unmounts
    return () => {
      layers.forEach((layer) => {
        mapView.map.remove(layer);
      });
    };
  }, [mapView, endpoints]);

  if (loading) {
    return <div>Loading map data endpoints...</div>;
  }

  if (error) {
    return <div>Error loading map data: {error}</div>;
  }

  return (
    <div className="map-data-info">
      <h3>Active Map Layers</h3>
      <ul>
        {endpoints.map((endpoint) => (
          <li key={endpoint.type}>
            <strong>{endpoint.name}</strong>: {endpoint.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Example: Fetch specific endpoint type
 */
export const FloodLayerExample = ({ mapView }) => {
  const { endpoint, loading, error } = useMapEndpointByType('flood');
  const [layer, setLayer] = useState(null);

  useEffect(() => {
    if (!mapView || !endpoint) return;

    const floodLayer = createFeatureLayerFromEndpoint(endpoint, {
      visible: true,
      opacity: 0.4,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [0, 0, 255, 0.3],
          outline: {
            color: [0, 0, 255, 0.8],
            width: 1,
          },
        },
      },
    });

    if (floodLayer) {
      mapView.map.add(floodLayer);
      setLayer(floodLayer);
    }

    return () => {
      if (floodLayer) {
        mapView.map.remove(floodLayer);
      }
    };
  }, [mapView, endpoint]);

  if (loading) return <div>Loading flood data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!endpoint) return null;

  return (
    <div className="flood-layer-info">
      <h4>{endpoint.name}</h4>
      <p>{endpoint.description}</p>
      <button onClick={() => layer && (layer.visible = !layer.visible)}>Toggle Visibility</button>
    </div>
  );
};

/**
 * Example: Load all endpoints and create a layer control panel
 */
export const LayerControlPanel = ({ mapView }) => {
  const { endpoints, loading, error } = useMapEndpoints();
  const [layers, setLayers] = useState(new Map());

  useEffect(() => {
    if (!mapView || !endpoints.length) return;

    const layerMap = new Map();

    endpoints.forEach((endpoint) => {
      const layer = createFeatureLayerFromEndpoint(endpoint, {
        visible: false, // All layers start hidden
      });

      if (layer) {
        mapView.map.add(layer);
        layerMap.set(endpoint.type, layer);
      }
    });

    setLayers(layerMap);

    return () => {
      layerMap.forEach((layer) => {
        mapView.map.remove(layer);
      });
    };
  }, [mapView, endpoints]);

  const toggleLayer = (type) => {
    const layer = layers.get(type);
    if (layer) {
      layer.visible = !layer.visible;
      // Force re-render
      setLayers(new Map(layers));
    }
  };

  const setLayerOpacity = (type, opacity) => {
    const layer = layers.get(type);
    if (layer) {
      layer.opacity = opacity;
    }
  };

  if (loading) {
    return <div>Loading layer controls...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="layer-control-panel">
      <h3>Map Layers</h3>
      {endpoints.map((endpoint) => {
        const layer = layers.get(endpoint.type);
        return (
          <div key={endpoint.type} className="layer-control-item">
            <div className="layer-header">
              <input
                type="checkbox"
                checked={layer?.visible ?? false}
                onChange={() => toggleLayer(endpoint.type)}
                id={`layer-${endpoint.type}`}
              />
              <label htmlFor={`layer-${endpoint.type}`}>{endpoint.name}</label>
            </div>
            {layer?.visible && (
              <div className="layer-opacity-control">
                <label>Opacity:</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={layer.opacity}
                  onChange={(e) => setLayerOpacity(endpoint.type, parseFloat(e.target.value))}
                />
              </div>
            )}
            <p className="layer-description">{endpoint.description}</p>
          </div>
        );
      })}
    </div>
  );
};

// Export default
export default {
  useMapEndpoints,
  useMapEndpointByType,
  createFeatureLayerFromEndpoint,
  MapDataExample,
  FloodLayerExample,
  LayerControlPanel,
};
