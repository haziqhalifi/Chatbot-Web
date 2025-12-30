import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  MapPin,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Shield,
  Bell,
  Send,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminReports = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // State for reports data
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;
  // Selected report for detailed view
  const [selectedReport, setSelectedReport] = useState(null);

  // Notification modal state
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationReport, setNotificationReport] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false); // Redirect if not authenticated
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

  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await fetch('http://localhost:8000/admin/reports', {
        method: 'GET',
        headers: {
          'X-API-Key': 'secretkey', // Use the correct API key from backend
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/signin');
          return;
        }
        throw new Error(`Failed to fetch reports: ${response.status}`);
      }

      const data = await response.json();
      setReports(Array.isArray(data.reports) ? data.reports : []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error.message);
      // If it's a network error or API key issue, show fallback message
      if (error.message.includes('Failed to fetch') || error.message.includes('API')) {
        setError('Unable to connect to the server. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  // Load reports when component mounts
  useEffect(() => {
    if (user || localStorage.getItem('token')) {
      fetchReports();
    }
  }, [user]);

  // Function to refresh reports data
  const refreshReports = () => {
    fetchReports();
  };

  // Function to fetch individual report details
  const fetchReportDetails = async (reportId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:8000/admin/reports/${reportId}`, {
        method: 'GET',
        headers: {
          'X-API-Key': 'secretkey',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch report details: ${response.status}`);
      }

      const report = await response.json();
      setSelectedReport(report);
    } catch (error) {
      console.error('Error fetching report details:', error);
      setError('Failed to load report details');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };
  const handleBackToDashboard = () => {
    navigate('/admin');
  };

  // Handle opening notification modal
  const handleSendNotification = (report) => {
    if (report?.source === 'NADMA Realtime') {
      return;
    }
    setNotificationReport(report);
    setNotificationTitle(`${report.type} Alert - ${report.location}`);
    setNotificationMessage(
      `ALERT: ${report.type} reported in ${report.location}. ` +
        `Status: ${report.status}. Please take necessary precautions and follow local emergency guidelines.`
    );
    setShowNotificationModal(true);
  };

  // Handle sending notification
  const handleConfirmNotification = async () => {
    if (!notificationReport || !notificationTitle.trim() || !notificationMessage.trim()) {
      alert('Please fill in both title and message');
      return;
    }

    setSendingNotification(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/admin/notifications/send', {
        method: 'POST',
        headers: {
          'X-API-Key': 'secretkey',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: notificationTitle,
          message: notificationMessage,
          report_id: notificationReport.id,
          type: 'disaster_alert',
          target_area: notificationReport.location,
          disaster_type: notificationReport.type, // Include the actual disaster type from report
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send notification: ${response.status}`);
      }

      const result = await response.json();
      alert(`Notification sent successfully! ${result.recipients_count || 0} recipients notified.`);

      // Close modal and reset state
      setShowNotificationModal(false);
      setNotificationReport(null);
      setNotificationTitle('');
      setNotificationMessage('');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert(`Failed to send notification: ${error.message}`);
    } finally {
      setSendingNotification(false);
    }
  };

  // Handle closing notification modal
  const handleCloseNotificationModal = () => {
    setShowNotificationModal(false);
    setNotificationReport(null);
    setNotificationTitle('');
    setNotificationMessage('');
  };

  // Filter reports based on search and filters
  const filteredReports = reports.filter((report) => {
    const title = String(report?.title || '');
    const location = String(report?.location || '');
    const reportedBy = String(report?.reportedBy || '');
    const description = String(report?.description || '');
    const source = String(report?.source || '');

    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
    const matchesType = typeFilter === 'All' || report.type === typeFilter;
    const matchesSeverity = severityFilter === 'All' || report.severity === severityFilter;

    const matchesSource =
      sourceFilter === 'All' ||
      (sourceFilter === 'Disaster Reports' && report.source === 'Disaster Report') ||
      (sourceFilter === 'NADMA Realtime' && report.source === 'NADMA Realtime');

    return matchesSearch && matchesStatus && matchesType && matchesSeverity && matchesSource;
  });

  const availableTypes = Array.from(
    new Set((reports || []).map((r) => r?.type).filter((t) => typeof t === 'string' && t.trim()))
  ).sort((a, b) => a.localeCompare(b));

  // Pagination logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'High':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'Low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'Responding':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'Monitoring':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'Resolved':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const exportReports = () => {
    // Export functionality
    const dataStr = JSON.stringify(filteredReports, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `disaster_reports_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  // Show loading or check authentication
  if (!user && !localStorage.getItem('token')) {
    return null; // Will redirect to signin
  }

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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={handleBackToDashboard}
                  className="mr-4 p-2 rounded-md hover:bg-gray-100"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <Shield className="h-8 w-8 text-red-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">Disaster Reports</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Welcome, {user?.name || user?.email}</span>
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

        {/* Error Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Reports</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchReports}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              disabled={loading}
            >
              {loading ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Show loading state for initial load
  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={handleBackToDashboard}
                className="mr-4 p-2 rounded-md hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <Shield className="h-8 w-8 text-red-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Disaster Reports</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.name || user?.email || 'Admin'}
              </span>
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Reports</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter((r) => r.status === 'Active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">People Affected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.reduce((sum, r) => sum + r.affectedPeople, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical Reports</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter((r) => r.severity === 'Critical').length}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  <ChevronDown
                    className={`h-4 w-4 ml-2 transform ${showFilters ? 'rotate-180' : ''}`}
                  />
                </button>
                <button
                  onClick={exportReports}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>{' '}
                <button
                  onClick={fetchReports}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Responding">Responding</option>
                    <option value="Monitoring">Monitoring</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="All">All Types</option>
                    {availableTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="All">All Severity</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="All">All Sources</option>
                    <option value="Disaster Reports">Disaster Reports</option>
                    <option value="NADMA Realtime">NADMA Realtime</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Reports ({filteredReports.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reporter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>{' '}
              <tbody className="bg-white divide-y divide-gray-200">
                {currentReports.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">No reports found</p>
                        <p className="text-sm">
                          {filteredReports.length === 0 && reports.length > 0
                            ? 'Try adjusting your search or filter criteria.'
                            : 'No disaster reports have been submitted yet.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.title}</div>
                          <div className="text-sm text-gray-500">{report.type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          {report.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(report.severity)}`}
                        >
                          {report.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(report.status)}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.reportedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(report.timestamp)}
                        </div>
                      </td>{' '}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              report?.source === 'NADMA Realtime'
                                ? setSelectedReport(report)
                                : fetchReportDetails(report.id)
                            }
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleSendNotification(report)}
                            disabled={report?.source === 'NADMA Realtime'}
                            className={`flex items-center ${
                              report?.source === 'NADMA Realtime'
                                ? 'text-orange-300 cursor-not-allowed'
                                : 'text-orange-600 hover:text-orange-900'
                            }`}
                            title={
                              report?.source === 'NADMA Realtime'
                                ? 'Notifications are available for user-submitted reports'
                                : 'Send Notification'
                            }
                          >
                            <Bell className="h-4 w-4 mr-1" />
                            Notify
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstReport + 1} to{' '}
                {Math.min(indexOfLastReport, filteredReports.length)} of {filteredReports.length}{' '}
                results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border rounded-md ${
                      currentPage === i + 1
                        ? 'bg-red-600 text-white border-red-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>{' '}
      </main>

      {/* Send Notification Modal */}
      {showNotificationModal && notificationReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Send Disaster Notification</h2>
                <button
                  onClick={handleCloseNotificationModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Report Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Type:</span>
                    <span className="ml-2 text-gray-900">{notificationReport.type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Location:</span>
                    <span className="ml-2 text-gray-900">{notificationReport.location}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Severity:</span>
                    <span
                      className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(notificationReport.severity)}`}
                    >
                      {notificationReport.severity}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <span
                      className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(notificationReport.status)}`}
                    >
                      {notificationReport.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notification Form */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="notificationTitle"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Notification Title *
                  </label>
                  <input
                    id="notificationTitle"
                    type="text"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter notification title"
                  />
                </div>

                <div>
                  <label
                    htmlFor="notificationMessage"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Notification Message *
                  </label>
                  <textarea
                    id="notificationMessage"
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter the notification message that will be sent to affected area residents..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    This message will be sent to users in the affected area:{' '}
                    {notificationReport.location}
                  </p>
                </div>

                {/* Preview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Notification Preview</h4>
                  <div className="bg-white border border-blue-200 rounded-md p-3">
                    <div className="flex items-start">
                      <Bell className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                      <div>
                        <h5 className="font-semibold text-gray-900">
                          {notificationTitle || 'Notification Title'}
                        </h5>
                        <p className="text-sm text-gray-700 mt-1">
                          {notificationMessage || 'Notification message will appear here...'}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Emergency Alert • {new Date().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCloseNotificationModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={sendingNotification}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmNotification}
                  disabled={
                    sendingNotification || !notificationTitle.trim() || !notificationMessage.trim()
                  }
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {sendingNotification ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Type:</span> {selectedReport.type}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {selectedReport.location}
                      </div>
                      <div>
                        <span className="font-medium">Coordinates:</span>{' '}
                        {selectedReport.coordinates}
                      </div>
                      <div>
                        <span className="font-medium">Severity:</span>
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(selectedReport.severity)}`}
                        >
                          {selectedReport.severity}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedReport.status)}`}
                        >
                          {selectedReport.status}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>{' '}
                        {formatDate(selectedReport.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* Reporter Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Reporter Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Name:</span> {selectedReport.reportedBy}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {selectedReport.reporterEmail}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {selectedReport.reporterPhone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Impact and Response */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Impact Assessment</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Affected People:</span>{' '}
                        {selectedReport.affectedPeople}
                      </div>
                      <div>
                        <span className="font-medium">Estimated Damage:</span>{' '}
                        {selectedReport.estimatedDamage}
                      </div>
                      <div>
                        <span className="font-medium">Response Team:</span>{' '}
                        {selectedReport.responseTeam}
                      </div>
                    </div>
                  </div>

                  {/* Updates */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Updates</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedReport.updates.map((update, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <div className="text-sm text-gray-600">
                            {formatDate(update.time)} - by {update.by}
                          </div>
                          <div className="text-sm">{update.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700">{selectedReport.description}</p>
              </div>

              {/* Images */}
              {selectedReport.images.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Images</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedReport.images.map((image, index) => (
                      <div
                        key={index}
                        className="bg-gray-200 p-4 rounded text-center text-sm text-gray-600"
                      >
                        {image}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
