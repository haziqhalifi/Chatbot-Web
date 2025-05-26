import React, { useEffect } from 'react';

// Import ArcGIS map components
import '@arcgis/map-components/components/arcgis-map';
import '@arcgis/map-components/components/arcgis-legend';
import '@arcgis/map-components/components/arcgis-search';
import '@arcgis/map-components/components/arcgis-sketch';

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
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <arcgis-map
        basemap="topo-vector"
        center="101.9758,4.2105"
        zoom="12"
        onarcgisViewReadyChange={(event) => {
          console.log('MapView ready', event);
        }}
      >
        <arcgis-search position="top-right"></arcgis-search>
        <arcgis-legend position="bottom-left"></arcgis-legend>
        <arcgis-sketch position="bottom-right" creation-mode="update"></arcgis-sketch>
        {/* <arcgis-feature-layer url="https://services.arcgis.com/example/arcgis/rest/services/YourLayer/FeatureServer/0"></arcgis-feature-layer> */}
      </arcgis-map>
    </div>
  );
};

export default MapView;
