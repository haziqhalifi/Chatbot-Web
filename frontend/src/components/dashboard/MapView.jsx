import React, { useEffect } from 'react';

// Import essential ArcGIS map components
import '@arcgis/map-components/components/arcgis-map';
import '@arcgis/map-components/components/arcgis-search';
import '@arcgis/map-components/components/arcgis-sketch';
import '@arcgis/map-components/components/arcgis-basemap-gallery';
import '@arcgis/map-components/components/arcgis-layer-list';

const ARCGIS_MAP_SDK_CSS = 'https://js.arcgis.com/4.32/esri/themes/dark/main.css';

const MapView = () => {
  useEffect(() => {
    // Load ArcGIS CSS
    if (!document.querySelector(`link[href="${ARCGIS_MAP_SDK_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = ARCGIS_MAP_SDK_CSS;
      document.head.appendChild(link);
    }

    // Add custom CSS for basemap gallery
    if (!document.querySelector('#basemap-gallery-custom-styles')) {
      const style = document.createElement('style');
      style.id = 'basemap-gallery-custom-styles';
      style.textContent = `
        /* Custom styles for basemap gallery */
        arcgis-basemap-gallery {
          --calcite-shell-panel-max-width: 300px !important;
          --calcite-shell-panel-width: 280px !important;
        }
        
        arcgis-basemap-gallery::part(base) {
          max-width: 300px !important;
          width: 280px !important;
          max-height: 400px !important;
          overflow-y: auto !important;
          resize: both !important;
          border: 1px solid #ccc !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        }

        /* Make the basemap items smaller */
        arcgis-basemap-gallery .esri-basemap-gallery__item {
          width: 80px !important;
          height: 60px !important;
          margin: 4px !important;
        }

        /* Adjust the container grid */
        arcgis-basemap-gallery .esri-basemap-gallery {
          max-width: 280px !important;
          padding: 8px !important;
        }        /* Make the basemap gallery scrollable and resizable */
        .esri-basemap-gallery {
          max-height: 400px !important;
          overflow-y: auto !important;
          resize: both !important;
          min-width: 200px !important;
          min-height: 200px !important;
        }

        /* Remove blue border line from map */
        arcgis-map {
          border: none !important;
          outline: none !important;
        }

        .esri-view {
          border: none !important;
          outline: none !important;
        }

        .esri-view-surface {
          border: none !important;
          outline: none !important;
        }

        .esri-map {
          border: none !important;
          outline: none !important;
        }

        /* Remove focus outline from map */
        arcgis-map:focus,
        .esri-view:focus,
        .esri-view-surface:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Load ArcGIS API JavaScript
    if (!document.querySelector('script[src="https://js.arcgis.com/4.32/"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.arcgis.com/4.32/';
      script.async = true;
      script.onload = () => {
        console.log('ArcGIS API loaded');
      };
      document.head.appendChild(script);
    }
  }, []);
  const handleMapReady = (event) => {
    console.log('MapView ready', event);
    const map = event.target.map;
    const view = event.target.view;

    // Prevent duplicate layer creation
    if (map.layers && map.layers.length > 0) {
      console.log('Layers already exist, skipping creation');
      return;
    }

    // Add layers after map is ready
    setTimeout(() => {
      if (window.require && map && view) {
        console.log('Starting to load layers...');

        window.require(
          ['esri/layers/FeatureLayer', 'esri/layers/GraphicsLayer'],
          (FeatureLayer, GraphicsLayer) => {
            console.log('ArcGIS modules loaded successfully');

            try {
              // Create layers
              const layers = [];

              // 1. Graphics layer for sketching
              const sketchLayer = new GraphicsLayer({
                id: 'sketch-layer',
                title: 'Sketch Layer',
                listMode: 'show',
                visible: true,
              });
              layers.push(sketchLayer);

              // 2. US States layer - using more reliable service
              const statesLayer = new FeatureLayer({
                url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_States_Generalized/FeatureServer/0',
                id: 'states-layer',
                title: 'US States',
                opacity: 0.7,
                visible: true,
                outFields: ['STATE_NAME', 'POP2000', 'AREA'],
                listMode: 'show',
              });
              layers.push(statesLayer);

              // 3. US Cities layer - using more reliable service
              const citiesLayer = new FeatureLayer({
                url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Major_Cities/FeatureServer/0',
                id: 'cities-layer',
                title: 'US Cities',
                visible: true,
                outFields: ['NAME', 'POP_RANK', 'STATE_NAME'],
                listMode: 'show',
              });
              layers.push(citiesLayer);
              console.log(
                'Created layers:',
                layers.map((l) => ({ id: l.id, title: l.title, type: l.type }))
              );

              // Add layers to map with error handling
              layers.forEach((layer, index) => {
                try {
                  console.log(`Adding layer ${index + 1}: ${layer.title}`);
                  map.add(layer);

                  // Listen for layer view creation
                  view
                    .whenLayerView(layer)
                    .then((layerView) => {
                      console.log(`LayerView created for ${layer.title}:`, layerView);
                    })
                    .catch((error) => {
                      console.warn(`LayerView creation failed for ${layer.title}:`, error);
                    });
                } catch (addError) {
                  console.error(`Failed to add ${layer.title}:`, addError);
                }
              });

              // Check results after a delay
              setTimeout(() => {
                console.log('=== FINAL STATUS ===');
                console.log(
                  'Map layers count:',
                  map.layers ? map.layers.length : 'No layers property'
                );
                if (map.layers && map.layers.toArray) {
                  const layerArray = map.layers.toArray();
                  console.log(
                    'Layer titles:',
                    layerArray.map((l) => l.title || l.id)
                  );
                  console.log(
                    'Layer types:',
                    layerArray.map((l) => l.type)
                  );
                  console.log(
                    'Layer visibility:',
                    layerArray.map((l) => l.visible)
                  );
                }
              }, 5000);
            } catch (error) {
              console.error('Error in layer creation:', error);
            }
          }
        );
      } else {
        console.error('Prerequisites not met:', {
          require: !!window.require,
          map: !!map,
          view: !!view,
        });
      }
    }, 3000);
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      <arcgis-map
        basemap="topo-vector"
        center="-98,39.5"
        zoom="4"
        onarcgisViewReadyChange={handleMapReady}
      >
        {/* Search Widget */}
        <arcgis-search position="top-right"></arcgis-search>{' '}
        {/* Basemap Gallery - now smaller and resizable */}
        <arcgis-basemap-gallery position="top-left" expanded="false"></arcgis-basemap-gallery>
        {/* Layer List */}
        <arcgis-layer-list position="bottom-left"></arcgis-layer-list>
        {/* Sketch Widget */}
        <arcgis-sketch
          position="bottom-right"
          creation-mode="single"
          layer-id="sketch-layer"
        ></arcgis-sketch>
      </arcgis-map>
    </div>
  );
};

export default MapView;
