import React, { useState, useEffect } from 'react';
import {
  Send,
  Bell,
  AlertTriangle,
  MapPin,
  Users,
  Filter,
  Search,
  Trash2,
  BarChart3,
  Plus,
  X,
  RefreshCw,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminNotificationAPI } from '../../api';
import { useSubscriptions } from '../../hooks/useSubscriptions';

const NotificationManagement = () => {
  const { disasterTypes, locations } = useSubscriptions();

  // Tabs
  const [activeTab, setActiveTab] = useState('view'); // 'view', 'create'

  // View notifications state
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    notification_type: '',
    disaster_type: '',
  });
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0,
  });

  // User details modal
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationUsers, setNotificationUsers] = useState([]);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Statistics
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(true);

  // Create notification state
  const [notificationType, setNotificationType] = useState('system'); // 'system' or 'targeted'
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    disaster_type: '',
    location: '',
  });
  const [customDisasterType, setCustomDisasterType] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = {
        limit: pagination.limit,
        offset: pagination.offset,
        grouped: true,
        ...(filters.notification_type && { notification_type: filters.notification_type }),
        ...(filters.disaster_type && { disaster_type: filters.disaster_type }),
        ...(filters.search && { search: filters.search }),
      };

      const response = await adminNotificationAPI.getAllNotifications(params);
      setNotifications(response.data.notifications || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total || 0,
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for a notification
  const fetchNotificationUsers = async (notification) => {
    setLoadingUsers(true);
    setSelectedNotification(notification);
    setShowUsersModal(true);

    try {
      const params = {
        title: notification.title,
        message: notification.message,
        notification_type: notification.type,
      };

      // Only add disaster_type and location if they have values
      if (notification.disaster_type) {
        params.disaster_type = notification.disaster_type;
      }
      if (notification.location) {
        params.location = notification.location;
      }

      const response = await adminNotificationAPI.getNotificationUsers(params);
      setNotificationUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching notification users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Close users modal
  const closeUsersModal = () => {
    setShowUsersModal(false);
    setSelectedNotification(null);
    setNotificationUsers([]);
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await adminNotificationAPI.getNotificationStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Delete notification
  const handleDelete = async (notificationId) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      await adminNotificationAPI.deleteNotification(notificationId);
      fetchNotifications();
      fetchStats();
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Failed to delete notification');
    }
  };

  // Create notification
  const handleCreateNotification = async (e) => {
    e.preventDefault();

    setSending(true);
    setResult(null);

    try {
      let response;
      if (notificationType === 'system') {
        response = await adminNotificationAPI.createSystemNotification({
          title: formData.title,
          message: formData.message,
          type: formData.type,
        });
      } else {
        const finalDisasterType = customDisasterType.trim() || formData.disaster_type;
        const finalLocation = customLocation.trim() || formData.location;

        response = await adminNotificationAPI.createTargetedNotification({
          disaster_type: finalDisasterType,
          location: finalLocation,
          title: formData.title,
          message: formData.message,
          type: formData.type,
        });
      }

      // Show success message with email stats
      const data = response.data;
      let successMessage = 'Notification sent successfully!';
      if (data.emails_sent !== undefined) {
        successMessage += ` (${data.users_notified || 0} users notified`;
        if (data.emails_sent > 0) {
          successMessage += `, ${data.emails_sent} emails sent`;
        }
        if (data.emails_failed > 0) {
          successMessage += `, ${data.emails_failed} emails failed`;
        }
        successMessage += ')';
      }

      setResult({ success: true, message: successMessage, data });
      setFormData({
        title: '',
        message: '',
        type: 'info',
        disaster_type: '',
        location: '',
      });
      setCustomDisasterType('');
      setCustomLocation('');

      // Refresh notifications list if on view tab
      if (activeTab === 'view') {
        fetchNotifications();
        fetchStats();
      }
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.detail || 'Failed to send notification',
      });
    } finally {
      setSending(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };

  // Handle pagination
  const handlePageChange = (direction) => {
    setPagination((prev) => ({
      ...prev,
      offset:
        direction === 'next' ? prev.offset + prev.limit : Math.max(0, prev.offset - prev.limit),
    }));
  };

  useEffect(() => {
    if (activeTab === 'view') {
      fetchNotifications();
    }
  }, [filters, pagination.offset, activeTab]);

  useEffect(() => {
    fetchStats();
  }, []);

  const getTypeColor = (type) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800',
    };
    return colors[type] || colors.info;
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Notification Management</h1>
          <p className="text-gray-600">Create, view, and manage system notifications</p>
        </div>

        {/* Statistics */}
        {stats && showStats && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Statistics
              </h2>
              <button
                onClick={() => setShowStats(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total_notifications}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Read</p>
                <p className="text-2xl font-bold text-green-600">{stats.read_notifications}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.unread_notifications}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Last 24h</p>
                <p className="text-2xl font-bold text-purple-600">{stats.recent_24h}</p>
              </div>
            </div>
          </div>
        )}

        {!showStats && (
          <button
            onClick={() => setShowStats(true)}
            className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Show Statistics
          </button>
        )}

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('view')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'view'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bell className="w-4 h-4 inline mr-2" />
                View Notifications
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Create Notification
              </button>
            </nav>
          </div>

          {/* View Notifications Tab */}
          {activeTab === 'view' && (
            <div className="p-6">
              {/* Filters */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filters.notification_type}
                  onChange={(e) => handleFilterChange('notification_type', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="danger">Danger</option>
                </select>
                <select
                  value={filters.disaster_type}
                  onChange={(e) => handleFilterChange('disaster_type', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Disaster Types</option>
                  {disasterTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Refresh Button */}
              <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {pagination.offset + 1} -{' '}
                  {Math.min(pagination.offset + pagination.limit, pagination.total)} of{' '}
                  {pagination.total} notifications
                </p>
                <button
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="flex items-center px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {/* Notifications List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600">No notifications found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => fetchNotificationUsers(notification)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(
                                notification.type
                              )}`}
                            >
                              {notification.type}
                            </span>
                            {notification.disaster_type && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                                <AlertTriangle className="w-3 h-3 inline mr-1" />
                                {notification.disaster_type}
                              </span>
                            )}
                            {notification.location && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                                <MapPin className="w-3 h-3 inline mr-1" />
                                {notification.location}
                              </span>
                            )}
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                              <Users className="w-3 h-3 inline mr-1" />
                              {notification.user_count}{' '}
                              {notification.user_count === 1 ? 'user' : 'users'}
                            </span>
                            {notification.unread_count > 0 && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                                {notification.unread_count} unread
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-800 mb-1">{notification.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              Latest: {new Date(notification.latest_created_at).toLocaleString()}
                            </span>
                            {notification.first_created_at !== notification.latest_created_at && (
                              <span>
                                First: {new Date(notification.first_created_at).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {notifications.length > 0 && (
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    onClick={() => handlePageChange('prev')}
                    disabled={pagination.offset === 0}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange('next')}
                    disabled={pagination.offset + pagination.limit >= pagination.total}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Create Notification Tab */}
          {activeTab === 'create' && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                {/* Notification Type Toggle */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Type
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setNotificationType('system')}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                        notificationType === 'system'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <Users className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">System Wide</div>
                      <div className="text-xs mt-1">Send to all users</div>
                    </button>
                    <button
                      onClick={() => setNotificationType('targeted')}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                        notificationType === 'targeted'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <MapPin className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">Targeted</div>
                      <div className="text-xs mt-1">By disaster & location</div>
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleCreateNotification} className="space-y-4">
                  {/* Targeted notification fields */}
                  {notificationType === 'targeted' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <AlertTriangle className="w-4 h-4 inline mr-1" />
                          Disaster Type *
                        </label>
                        <select
                          value={formData.disaster_type}
                          onChange={(e) =>
                            setFormData({ ...formData, disaster_type: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select disaster type</option>
                          {disasterTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                          <option value="custom">Custom (enter below)</option>
                        </select>
                        {formData.disaster_type === 'custom' && (
                          <input
                            type="text"
                            value={customDisasterType}
                            onChange={(e) => setCustomDisasterType(e.target.value)}
                            placeholder="Enter custom disaster type"
                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          Location *
                        </label>
                        <select
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select location</option>
                          {locations.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                          <option value="custom">Custom (enter below)</option>
                        </select>
                        {formData.location === 'custom' && (
                          <input
                            type="text"
                            value={customLocation}
                            onChange={(e) => setCustomLocation(e.target.value)}
                            placeholder="Enter custom location"
                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>
                    </>
                  )}

                  {/* Common fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Level *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="danger">Danger</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Notification title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={4}
                      placeholder="Notification message"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sending ? 'Sending...' : 'Send Notification'}</span>
                  </button>
                </form>

                {/* Result Message */}
                {result && (
                  <div
                    className={`mt-6 p-4 rounded-lg ${
                      result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {result.message}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Users Modal */}
        {showUsersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800">Notification Recipients</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedNotification?.user_count}{' '}
                    {selectedNotification?.user_count === 1 ? 'user' : 'users'} received this
                    notification
                  </p>
                </div>
                <button
                  onClick={closeUsersModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Notification Preview */}
              {selectedNotification && (
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(selectedNotification.type)}`}
                    >
                      {selectedNotification.type}
                    </span>
                    {selectedNotification.disaster_type && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        {selectedNotification.disaster_type}
                      </span>
                    )}
                    {selectedNotification.location && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {selectedNotification.location}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{selectedNotification.title}</h3>
                  <p className="text-sm text-gray-600">{selectedNotification.message}</p>
                </div>
              )}

              {/* Users List */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {loadingUsers ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading users...</p>
                  </div>
                ) : notificationUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">No users found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notificationUsers.map((user, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {user.user_name || user.user_email || `User ${user.user_id}`}
                            </p>
                            {user.user_email && user.user_name && (
                              <p className="text-sm text-gray-500">{user.user_email}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              user.is_read
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {user.is_read ? 'Read' : 'Unread'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(user.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={closeUsersModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default NotificationManagement;
