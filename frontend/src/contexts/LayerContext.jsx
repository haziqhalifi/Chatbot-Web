import React, { createContext, useContext, useState, useCallback } from 'react';

const LayerContext = createContext();

// Define layer types and their z-index priorities
const LAYER_TYPES = {
  // Dropdowns (lower z-index)
  NOTIFICATION_DROPDOWN: { type: 'notification', zIndex: 20 },
  LANGUAGE_DROPDOWN: { type: 'language', zIndex: 20 },
  PROFILE_DROPDOWN: { type: 'profile', zIndex: 30 },

  // Modals (higher z-index)
  ACCOUNT_MODAL: { type: 'account', zIndex: 50 },
  REPORT_MODAL: { type: 'report', zIndex: 50 },
  SYSTEM_REPORT_MODAL: { type: 'system_report', zIndex: 50 },
  SETTINGS_MODAL: { type: 'settings', zIndex: 50 },
  EMERGENCY_MODAL: { type: 'emergency', zIndex: 50 },

  // Chat interface (highest z-index for overlays)
  CHAT_INTERFACE: { type: 'chat', zIndex: 40 },
};

export const LayerProvider = ({ children }) => {
  const [activeLayer, setActiveLayer] = useState(null);
  const [layerData, setLayerData] = useState({});

  // Open a layer and close any existing one
  const openLayer = useCallback((layerType, data = {}) => {
    if (!LAYER_TYPES[layerType]) {
      console.warn(`Unknown layer type: ${layerType}`);
      return;
    }

    setActiveLayer(layerType);
    setLayerData(data);
  }, []);

  // Close the current layer
  const closeLayer = useCallback(() => {
    setActiveLayer(null);
    setLayerData({});
  }, []);

  // Check if a specific layer is active
  const isLayerActive = useCallback(
    (layerType) => {
      return activeLayer === layerType;
    },
    [activeLayer]
  );

  // Get layer configuration
  const getLayerConfig = useCallback((layerType) => {
    return LAYER_TYPES[layerType] || null;
  }, []);

  // Close layer if it's a specific type
  const closeLayerIfType = useCallback(
    (layerType) => {
      if (activeLayer === layerType) {
        closeLayer();
      }
    },
    [activeLayer, closeLayer]
  );

  // Toggle a layer (open if closed, close if open)
  const toggleLayer = useCallback(
    (layerType, data = {}) => {
      if (activeLayer === layerType) {
        closeLayer();
      } else {
        openLayer(layerType, data);
      }
    },
    [activeLayer, openLayer, closeLayer]
  );

  const value = {
    activeLayer,
    layerData,
    openLayer,
    closeLayer,
    toggleLayer,
    isLayerActive,
    getLayerConfig,
    closeLayerIfType,
    LAYER_TYPES,
  };

  return <LayerContext.Provider value={value}>{children}</LayerContext.Provider>;
};

export const useLayer = () => {
  const context = useContext(LayerContext);
  if (!context) {
    throw new Error('useLayer must be used within a LayerProvider');
  }
  return context;
};

export default LayerContext;
