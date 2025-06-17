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
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState({
    total_reports: 0,
    active_alerts: 0,
    total_users: 0,
    response_teams: 8,
    recent_reports: [],
  });
  const [systemStatus, setSystemStatus] = useState({
    database: 'loading',
    monitoring: 'loading',
    api: 'loading',
    uptime: '0%',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Redirect if not authenticated
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');

    if (!token && !user) {
      // No token and no user, redirect to signin
      navigate('/signin');
      return;
    }

    // If we have a token but no user yet, wait for auth context to load
    if (token && !user) {
      // Don't redirect yet, auth context might still be loading
      return;
    }

    // If user exists but no admin role, check if they came from admin signin
    if (user && !user.role) {
      // For admin pages, we can assume they're admin if they have a valid token
      // and are accessing admin routes
      console.log('User logged in, assuming admin access for admin routes');
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

  const getSystemStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return { bg: 'bg-green-100', text: 'text-green-600', label: 'Operational' };
      case 'active':
        return { bg: 'bg-green-100', text: 'text-green-600', label: 'Active' };
      case 'loading':
        return { bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Loading...' };
      case 'error':
        return { bg: 'bg-red-100', text: 'text-red-600', label: 'Error' };
      case 'inactive':
        return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Inactive' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Unknown' };
    }
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/admin/dashboard/stats', {
        method: 'GET',
        headers: {
          'X-API-Key': 'secretkey',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/signin');
          return;
        }
        throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
      }

      const stats = await response.json();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch system status
  const fetchSystemStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/admin/system/status', {
        method: 'GET',
        headers: {
          'X-API-Key': 'secretkey',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const status = await response.json();
        setSystemStatus(status);
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';

    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} hours ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    } catch {
      return 'Unknown time';
    }
  };

  // Load data when component mounts
  useEffect(() => {
    if (user || localStorage.getItem('token')) {
      fetchDashboardStats();
      fetchSystemStatus();
    }
  }, [user]);
  // Show loading or check authentication
  if (!user && !localStorage.getItem('token')) {
    return null; // Will redirect to signin
  }

  // Show loading if user is being loaded or data is loading
  if ((!user && localStorage.getItem('token')) || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchDashboardStats();
              fetchSystemStatus();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#2c2c2c] h-20 w-full flex items-center justify-between px-11">
        <div className="flex items-center">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-red-500 mr-3" />
            <h1 className="text-2xl font-bold text-[#f0f0f0] mr-16">DisasterWatch Admin</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Refresh Button */}
          <button
            onClick={() => {
              fetchDashboardStats();
              fetchSystemStatus();
            }}
            className="text-gray-300 hover:text-white flex items-center px-3 py-2 rounded-md transition-colors"
            disabled={loading}
            title="Refresh Dashboard"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>

          {/* Admin Profile Info */}
          <div className="text-right">
            <div className="text-sm text-gray-300">Welcome back,</div>
            <div className="text-sm font-medium text-[#f0f0f0]">
              {user?.name || user?.email || 'Admin'}
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Sign Out
          </button>
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
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.active_alerts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats.total_users.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Response Teams</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.response_teams}</p>
              </div>
            </div>
          </div>{' '}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.total_reports}</p>
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
              {' '}
              <div className="space-y-4">
                {dashboardStats.recent_reports.length > 0 ? (
                  dashboardStats.recent_reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{report.title}</p>
                          <p className="text-sm text-gray-600">{report.location}</p>
                          <p className="text-xs text-gray-500">by {report.reporter}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(report.severity)}`}
                        >
                          {report.severity}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatRelativeTime(report.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No recent reports available</p>
                  </div>
                )}
              </div>{' '}
              <button
                onClick={() => navigate('/admin/reports')}
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
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
                </button>{' '}
                <button
                  onClick={() => navigate('/admin/reports')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
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
          </div>{' '}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 ${getSystemStatusColor(systemStatus.api).bg} rounded-full mb-2`}
                >
                  <Activity className={`h-6 w-6 ${getSystemStatusColor(systemStatus.api).text}`} />
                </div>
                <p className="text-sm font-medium text-gray-900">API Status</p>
                <p className={`text-sm ${getSystemStatusColor(systemStatus.api).text}`}>
                  {getSystemStatusColor(systemStatus.api).label}
                </p>
              </div>

              <div className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 ${getSystemStatusColor(systemStatus.database).bg} rounded-full mb-2`}
                >
                  <Activity
                    className={`h-6 w-6 ${getSystemStatusColor(systemStatus.database).text}`}
                  />
                </div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className={`text-sm ${getSystemStatusColor(systemStatus.database).text}`}>
                  {getSystemStatusColor(systemStatus.database).label}
                </p>
              </div>

              <div className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 ${getSystemStatusColor(systemStatus.monitoring).bg} rounded-full mb-2`}
                >
                  <Eye
                    className={`h-6 w-6 ${getSystemStatusColor(systemStatus.monitoring).text}`}
                  />
                </div>
                <p className="text-sm font-medium text-gray-900">Monitoring</p>
                <p className={`text-sm ${getSystemStatusColor(systemStatus.monitoring).text}`}>
                  {getSystemStatusColor(systemStatus.monitoring).label}
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Uptime</p>
                <p className="text-sm text-blue-600">{systemStatus.uptime}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
