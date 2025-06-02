import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import page components
import DisasterMapPage from './pages/Dashboard';
import ReportDisaster from './pages/ReportDisaster';
import EmergencySupport from './pages/EmergencySupport';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import DatabaseView from './pages/DatabaseView';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DisasterMapPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/disaster-map" element={<DisasterMapPage />} />
        <Route path="/report-disaster" element={<ReportDisaster />} />
        <Route path="/emergency-support" element={<EmergencySupport />} />
        <Route path="/database-view" element={<DatabaseView />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
