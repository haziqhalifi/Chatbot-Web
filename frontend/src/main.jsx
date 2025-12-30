import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import './i18n.js';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { loadSettings } from './utils/settingsStorage.js';

// Import ArcGIS CSS for proper styling
import '@arcgis/core/assets/esri/themes/light/main.css';

// Apply persisted UI settings before React renders
try {
  const settings = loadSettings();
  document.documentElement.dataset.textSize = settings.textSize || 'Medium';
} catch {
  // ignore
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
