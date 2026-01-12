import React from 'react';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <AdminHeader />
      <main className="w-full">{children}</main>
    </div>
  );
};

export default AdminLayout;
