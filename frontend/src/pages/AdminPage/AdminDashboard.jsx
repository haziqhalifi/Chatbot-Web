import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  AlertTriangle,
  Activity,
  Settings,
  FileText,
  Bell,
  Eye,
  MapPin,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeAlerts, setActiveAlerts] = useState(12);
  const [totalUsers, setTotalUsers] = useState(1547);
  const [responseTeams, setResponseTeams] = useState(8);
  const [recentReports, setRecentReports] = useState([
    {
      id: 1,
      type: 'Flood',
      location: 'Downtown District',
      severity: 'High',
      time: '2 minutes ago',
      status: 'Active',
    },
    {
      id: 2,
      type: 'Fire',
      location: 'Residential Area B',
      severity: 'Critical',
      time: '15 minutes ago',
      status: 'Responding',
    },
    {
      id: 3,
      type: 'Earthquake',
      location: 'City Center',
      severity: 'Medium',
      time: '1 hour ago',
      status: 'Monitoring',
    },
  ]);

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/signin');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'text-red-600 bg-red-100';
      case 'High':
        return 'text-orange-600 bg-orange-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'Low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'text-red-600 bg-red-100';
      case 'Responding':
        return 'text-blue-600 bg-blue-100';
      case 'Monitoring':
        return 'text-yellow-600 bg-yellow-100';
      case 'Resolved':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!user || user.role !== 'admin') {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.name || user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{activeAlerts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Response Teams</p>
                <p className="text-2xl font-bold text-gray-900">{responseTeams}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-gray-900">4.2m</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Disaster Reports</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{report.type}</p>
                        <p className="text-sm text-gray-600">{report.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(report.severity)}`}
                      >
                        {report.severity}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{report.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                View All Reports
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Bell className="h-8 w-8 text-orange-600 mb-2" />
                  <span className="text-sm font-medium">Send Alert</span>
                </button>

                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Users className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium">Manage Users</span>
                </button>

                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium">View Reports</span>
                </button>

                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Settings className="h-8 w-8 text-gray-600 mb-2" />
                  <span className="text-sm font-medium">Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">System Status</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">API Status</p>
                <p className="text-sm text-green-600">Operational</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Monitoring</p>
                <p className="text-sm text-green-600">Active</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Uptime</p>
                <p className="text-sm text-green-600">99.9%</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
