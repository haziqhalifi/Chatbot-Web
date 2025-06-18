import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import './i18n.js';
import { AuthProvider } from './contexts/AuthContext.jsx';

// Import ArcGIS CSS for proper styling
import '@arcgis/core/assets/esri/themes/light/main.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
