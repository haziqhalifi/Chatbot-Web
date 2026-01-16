import React, { useState, useEffect } from 'react';
import { Bell, Send, RefreshCw, Users, Plus } from 'lucide-react';
import {
  AdminLayout,
  PageHeader,
  StatsCard,
  Card,
  Table,
  Badge,
  Button,
} from '../../components/admin';
import { adminNotificationAPI } from '../../api';
import NotificationDetailModal from './NotificationDetailModal';

const SimplifiedNotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('view');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    disaster_type: '',
  });
  const [sending, setSending] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await adminNotificationAPI.getAllNotifications({
        limit: 50,
        offset: 0,
        grouped: true,
      });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminNotificationAPI.getNotificationStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSending(true);
      await adminNotificationAPI.createSystemNotification(formData);
      await fetchNotifications();
      await fetchStats();
      setFormData({ title: '', message: '', type: 'info', disaster_type: '' });
      setActiveTab('view');
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!confirm('Delete this notification?')) return;

    try {
      await adminNotificationAPI.deleteNotification(notificationId);
      await fetchNotifications();
      await fetchStats();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getTypeVariant = (type) => {
    const variants = {
      info: 'info',
      warning: 'warning',
      alert: 'danger',
      success: 'success',
    };
    return variants[type] || 'default';
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Notification Management"
        description="Send and manage system notifications"
        icon={Bell}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={fetchNotifications}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              icon={Plus}
              onClick={() => setActiveTab(activeTab === 'view' ? 'create' : 'view')}
            >
              {activeTab === 'view' ? 'Create Notification' : 'View Notifications'}
            </Button>
          </div>
        }
      />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <StatsCard
            title="Total Sent"
            value={stats.total_notifications || 0}
            icon={Bell}
            color="blue"
          />
          <StatsCard
            title="Unread"
            value={stats.unread_notifications || 0}
            icon={Bell}
            color="yellow"
          />
          <StatsCard title="Read" value={stats.read_notifications || 0} icon={Bell} color="green" />
          <StatsCard
            title="Sent Last 24h"
            value={stats.recent_24h || 0}
            icon={Bell}
            color="purple"
          />
          <StatsCard
            title="Sent Last 7d"
            value={stats.recent_7days || 0}
            icon={Bell}
            color="orange"
          />
        </div>
      )}

      {activeTab === 'view' ? (
        <Card>
          <Card.Header>
            <Card.Title icon={Bell}>Recent Notifications</Card.Title>
            <Card.Description>View all sent notifications</Card.Description>
          </Card.Header>

          <Card.Content>
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications sent yet</p>
              </div>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Title</Table.Head>
                    <Table.Head>Type</Table.Head>
                    <Table.Head>Recipients</Table.Head>
                    <Table.Head>Sent</Table.Head>
                    <Table.Head>Actions</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {notifications.map((notification) => (
                    <Table.Row
                      key={notification.id}
                      className="cursor-pointer hover:bg-blue-50"
                      onClick={() => setSelectedNotification(notification)}
                    >
                      <Table.Cell className="font-medium max-w-xs truncate">
                        {notification.title}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={getTypeVariant(notification.type)}>
                          {notification.type}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {notification.user_count ?? notification.recipient_count ?? 0} users
                      </Table.Cell>
                      <Table.Cell className="text-gray-500">
                        {notification.latest_created_at || notification.created_at
                          ? new Date(
                              notification.latest_created_at || notification.created_at
                            ).toLocaleString()
                          : 'N/A'}
                      </Table.Cell>
                      <Table.Cell
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </Card.Content>
        </Card>
      ) : (
        <Card>
          <Card.Header>
            <Card.Title icon={Send}>Create Notification</Card.Title>
            <Card.Description>Send a notification to all users</Card.Description>
          </Card.Header>

          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="alert">Alert</option>
                    <option value="success">Success</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Disaster Type (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.disaster_type}
                    onChange={(e) => setFormData({ ...formData, disaster_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab('view')}>
                  Cancel
                </Button>
                <Button type="submit" icon={Send} disabled={sending}>
                  {sending ? 'Sending...' : 'Send Notification'}
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      )}

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </AdminLayout>
  );
};

export default SimplifiedNotificationManagement;
