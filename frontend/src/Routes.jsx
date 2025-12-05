import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import page components
import Dashboard from './pages/Dashboard';
import ReportDisaster from './pages/ReportDisaster';
import EmergencySupport from './pages/EmergencySupport';
import SignIn from './pages/SignIn';
import AdminSignIn from './pages/AdminPage/AdminSignIn';
import AdminDashboard from './pages/AdminPage/AdminDashboard';
import AdminReports from './pages/AdminPage/AdminReports';
import SignUp from './pages/SignUp';
import Account from './pages/Account';
import Settings from './pages/Settings';
import FAQ from './pages/FAQ';
import Report from './pages/Report';
import NotificationSettings from './pages/NotificationSettings';
import AdminNotifications from './pages/AdminPage/AdminNotifications';
import ResetPassword from './pages/ResetPassword';
import DisasterDashboard from './pages/DisasterDashboard';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/disaster-dashboard" element={<DisasterDashboard />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/signin" element={<AdminSignIn />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/disaster-map" element={<Dashboard />} />
        <Route path="/report-disaster" element={<ReportDisaster />} />
        <Route path="/emergency-support" element={<EmergencySupport />} />
        <Route path="/my-account" element={<Account />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help-faq" element={<FAQ />} />
        <Route path="/report" element={<Report />} />
        <Route path="/notification-settings" element={<NotificationSettings />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
