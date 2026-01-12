import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Protected Route
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';

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

// Error pages
import AccessDenied from './pages/error/AccessDenied';
import NotFound from './pages/error/NotFound';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard/SimplifiedDashboard';
import AdminReports from './pages/admin/SimplifiedReports';
import NadmaHistory from './pages/admin/SimplifiedNadmaHistory';
import ManageUsers from './pages/admin/SimplifiedManageUsers';
import ManageFAQ from './pages/admin/SimplifiedManageFAQ';
import NotificationManagement from './pages/admin/SimplifiedNotificationManagement';

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
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedAdminRoute>
              <AdminReports />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/nadma-history"
          element={
            <ProtectedAdminRoute>
              <NadmaHistory />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedAdminRoute>
              <ManageUsers />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/faq"
          element={
            <ProtectedAdminRoute>
              <ManageFAQ />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedAdminRoute>
              <NotificationManagement />
            </ProtectedAdminRoute>
          }
        />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/disaster-map" element={<Dashboard />} />
        <Route path="/report-disaster" element={<ReportDisaster />} />
        <Route path="/emergency-support" element={<EmergencySupport />} />
        <Route path="/my-account" element={<Account />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help-faq" element={<FAQ />} />
        <Route path="/report" element={<Report />} />
        <Route path="/notification-settings" element={<NotificationSettings />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
