import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import page components
import Dashboard from './pages/Dashboard';
import ReportDisaster from './pages/ReportDisaster';
import EmergencySupport from './pages/EmergencySupport';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Account from './pages/Account';
import Settings from './pages/Settings';
import HelpFAQ from './pages/HelpFAQ';
import Report from './pages/Report';
import NotificationSettings from './pages/NotificationSettings';
import AdminNotifications from './pages/AdminNotifications';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/disaster-map" element={<Dashboard />} />
        <Route path="/report-disaster" element={<ReportDisaster />} />
        <Route path="/emergency-support" element={<EmergencySupport />} />
        <Route path="/my-account" element={<Account />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help-faq" element={<HelpFAQ />} />
        <Route path="/report" element={<Report />} />
        <Route path="/notification-settings" element={<NotificationSettings />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
