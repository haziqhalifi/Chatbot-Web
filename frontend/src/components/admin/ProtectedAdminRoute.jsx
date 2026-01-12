import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not loading and no token, redirect to admin signin
    if (!loading && !token) {
      navigate('/admin/signin', { replace: true });
    }
  }, [loading, token, navigate]);

  // Show nothing while loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-[#f0f0f0]">Loading...</div>
      </div>
    );
  }

  // If no token after loading, redirect
  if (!token) {
    return <Navigate to="/admin/signin" replace />;
  }

  // Check if user has admin role (role must be 'admin' or 'super_admin')
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  if (!isAdmin) {
    // Not an admin, show access denied page
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
