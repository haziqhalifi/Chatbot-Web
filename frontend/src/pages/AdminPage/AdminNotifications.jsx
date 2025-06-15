import React from 'react';
import Header from '../../components/common/Header';
import AdminNotificationPanel from '../../components/AdminNotificationPanel';

const AdminNotifications = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <AdminNotificationPanel />
      </div>
    </div>
  );
};

export default AdminNotifications;
