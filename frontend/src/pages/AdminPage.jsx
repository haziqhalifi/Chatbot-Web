import React from 'react';
import AdminHeader from '../components/admin/AdminHeader';
import MapView from '../components/dashboard/MapView';
import ChatInterface from '../components/dashboard/ChatInterface';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Shield } from 'lucide-react';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token && !user) {
      // No token and no user, redirect to admin signin
      navigate('/admin/signin');
      return;
    }

    // If we have a token but no user yet, wait for auth context to load
    if (token && !user) {
      // Don't redirect yet, auth context might still be loading
      return;
    }
  }, [user, navigate]);

  // Show loading if user is being loaded
  if (!user && localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user && !localStorage.getItem('token')) {
    return null; // Will redirect to signin
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f4f4f4] relative overflow-hidden">
      <AdminHeader />
      <div className="flex-1 relative w-full overflow-hidden">
        <MapView />
        <ChatInterface />
        
        {/* Admin Overlay Indicator */}
        <div className="absolute top-4 left-4 z-50">
          <div className="bg-red-600 text-white px-3 py-1 rounded-full flex items-center space-x-2 shadow-lg">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Admin Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
