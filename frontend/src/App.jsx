import React, { Suspense } from 'react';
import Routes from './Routes';
import { LayerProvider } from './contexts/LayerContext';
import './i18n'; // Initialize i18n

function App() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LayerProvider>
        <Routes />
      </LayerProvider>
    </Suspense>
  );
}

export default App;
