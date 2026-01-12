import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminSidebarContext = createContext();

const SIDEBAR_STATE_KEY = 'admin_sidebar_collapsed';

export const AdminSidebarProvider = ({ children }) => {
  // Initialize from localStorage, default to false (expanded)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
    return saved === 'true';
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STATE_KEY, isCollapsed.toString());
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <AdminSidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleSidebar }}>
      {children}
    </AdminSidebarContext.Provider>
  );
};

export const useAdminSidebar = () => {
  const context = useContext(AdminSidebarContext);
  if (!context) {
    throw new Error('useAdminSidebar must be used within AdminSidebarProvider');
  }
  return context;
};
