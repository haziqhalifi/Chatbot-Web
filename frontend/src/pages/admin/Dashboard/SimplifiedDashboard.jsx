import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, FileText, MapPin, RefreshCw, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
  AdminLayout,
  PageHeader,
  StatsCard,
  Card,
  Table,
  Badge,
  Button,
} from '../../../components/admin';

const SimplifiedAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_reports: 0,
    active_alerts: 0,
    total_users: 0,
    recent_reports: [],
  });

  // Fetch dashboard data
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:8000/admin/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getSeverityVariant = (severity) => {
    const variants = {
      Critical: 'danger',
      High: 'warning',
      Medium: 'info',
      Low: 'success',
    };
    return variants[severity] || 'default';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Dashboard"
        description="Overview of system statistics and recent activity"
        icon={TrendingUp}
        actions={
          <Button variant="outline" icon={RefreshCw} onClick={fetchData}>
            Refresh
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Active Alerts"
          value={stats.active_alerts}
          icon={AlertTriangle}
          color="red"
          onClick={() => navigate('/admin/reports')}
        />
        <StatsCard
          title="Total Users"
          value={stats.total_users.toLocaleString()}
          icon={Users}
          color="blue"
          onClick={() => navigate('/admin/users')}
        />
        <StatsCard
          title="Total Reports"
          value={stats.total_reports}
          icon={FileText}
          color="purple"
          onClick={() => navigate('/admin/reports')}
        />
        <StatsCard
          title="NADMA Disasters"
          value="Live"
          icon={MapPin}
          color="yellow"
          onClick={() => navigate('/admin/nadma-history')}
        />
      </div>

      {/* Recent Reports */}
      <Card>
        <Card.Header>
          <Card.Title icon={FileText}>Recent Disaster Reports</Card.Title>
          <Card.Description>Latest reports submitted by users</Card.Description>
        </Card.Header>

        <Card.Content>
          {stats.recent_reports.length > 0 ? (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Title</Table.Head>
                  <Table.Head>Location</Table.Head>
                  <Table.Head>Reporter</Table.Head>
                  <Table.Head>Severity</Table.Head>
                  <Table.Head>Date</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {stats.recent_reports.map((report) => (
                  <Table.Row key={report.id} onClick={() => navigate('/admin/reports')}>
                    <Table.Cell className="font-medium">{report.title}</Table.Cell>
                    <Table.Cell>{report.location}</Table.Cell>
                    <Table.Cell>{report.reporter}</Table.Cell>
                    <Table.Cell>
                      <Badge variant={getSeverityVariant(report.severity)}>{report.severity}</Badge>
                    </Table.Cell>
                    <Table.Cell className="text-gray-500">
                      {formatDate(report.timestamp)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent reports</p>
            </div>
          )}
        </Card.Content>

        {stats.recent_reports.length > 0 && (
          <Card.Footer>
            <Button variant="outline" fullWidth onClick={() => navigate('/admin/reports')}>
              View All Reports
            </Button>
          </Card.Footer>
        )}
      </Card>
    </AdminLayout>
  );
};

export default SimplifiedAdminDashboard;
