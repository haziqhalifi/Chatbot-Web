import React from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { AdminSidebarProvider, useAdminSidebar } from '../../contexts/AdminSidebarContext';

const AdminLayoutContent = ({ children }) => {
  const { isCollapsed } = useAdminSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <AdminSidebar />
      <main className={`${isCollapsed ? 'ml-16' : 'ml-64'} mt-16 p-6 transition-all duration-300`}>
        {children}
      </main>
    </div>
  );
};

const AdminLayout = ({ children }) => {
  return (
    <AdminSidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminSidebarProvider>
  );
};

export default AdminLayout;
