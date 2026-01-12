import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const AdminHeader = () => {
  return (
    <header className="bg-white h-16 w-full flex items-center px-6 border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-10">
      <Link to="/admin/dashboard" className="flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-lg font-semibold text-gray-900">DisasterWatch Admin</h1>
      </Link>
    </header>
  );
};

export default AdminHeader;
