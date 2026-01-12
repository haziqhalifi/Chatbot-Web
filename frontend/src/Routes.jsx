import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import page components
// User pages
import Dashboard from './pages/user/Dashboard';
import ReportDisaster from './pages/user/ReportDisaster';
import EmergencySupport from './pages/user/EmergencySupport';
import Account from './pages/user/Account';
import Settings from './pages/user/Settings';
import FAQ from './pages/user/FAQ';
import Report from './pages/user/Report';
import NotificationSettings from './pages/user/NotificationSettings';
import ResetPassword from './pages/user/ResetPassword';
import DisasterDashboard from './pages/user/DisasterDashboard';

// Auth pages
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import AdminSignIn from './pages/auth/AdminSignIn';

// Legal pages
import TermsOfUse from './pages/legal/TermsOfUse';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminReports from './pages/admin/Reports';
import NadmaHistory from './pages/admin/NadmaHistory';
import ManageUsers from './pages/admin/ManageUsers';
import ManageFAQ from './pages/admin/ManageFAQ';
import AdminNotifications from './pages/admin/Notifications';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/disaster-dashboard" element={<DisasterDashboard />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/signin" element={<AdminSignIn />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/nadma-history" element={<NadmaHistory />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/faq" element={<ManageFAQ />} />
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
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
