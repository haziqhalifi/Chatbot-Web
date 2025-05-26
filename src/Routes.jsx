import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import page components
import DisasterMapPage from './pages/Dashboard';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DisasterMapPage />} />
        <Route path="/disaster-map" element={<DisasterMapPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
