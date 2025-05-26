import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import page components
import DisasterMapPage from './pages/Dashboard';
import ReportDisaster from './pages/ReportDisaster';
import EmergencySupport from './pages/EmergencySupport';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DisasterMapPage />} />
        <Route path="/disaster-map" element={<DisasterMapPage />} />
        <Route path="/report-disaster" element={<ReportDisaster />} />
        <Route path="/emergency-support" element={<EmergencySupport />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
