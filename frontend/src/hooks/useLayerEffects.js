import { useEffect } from 'react';
import { useLayer } from '../contexts/LayerContext';

export const useLayerEffects = () => {
  const { activeLayer, closeLayer, LAYER_TYPES } = useLayer();

  // Handle ESC key to close any active layer
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && activeLayer) {
        closeLayer();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [activeLayer, closeLayer]);

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!activeLayer) return;

      const layerConfig = LAYER_TYPES[activeLayer];
      if (!layerConfig) return;

      // Different handling based on layer type
      switch (layerConfig.type) {
        case 'notification':
          if (
            !event.target.closest('.notification-dropdown') &&
            !event.target.closest('.notification-btn')
          ) {
            closeLayer();
          }
          break;

        case 'language':
          if (
            !event.target.closest('.language-dropdown') &&
            !event.target.closest('.language-btn')
          ) {
            closeLayer();
          }
          break;

        case 'profile':
          if (!event.target.closest('.profile-dropdown') && !event.target.closest('.profile-img')) {
            closeLayer();
          }
          break;

        case 'chat':
          // Chat interface has its own click handling
          break;

        default:
          // For modals, clicking on backdrop should close them
          if (event.target.classList.contains('modal-backdrop')) {
            closeLayer();
          }
          break;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeLayer, closeLayer, LAYER_TYPES]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    const layerConfig = activeLayer ? LAYER_TYPES[activeLayer] : null;
    const isModal =
      layerConfig && ['account', 'report', 'settings', 'emergency'].includes(layerConfig.type);

    if (isModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeLayer, LAYER_TYPES]);
};

export default useLayerEffects;
