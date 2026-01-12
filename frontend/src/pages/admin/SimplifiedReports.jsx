import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Filter, Download, Eye } from 'lucide-react';
import {
  AdminLayout,
  PageHeader,
  StatsCard,
  Card,
  Table,
  Badge,
  Button,
} from '../../components/admin';

const SimplifiedAdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:8000/admin/reports', {
        headers: {
          'X-API-Key': 'secretkey',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.disaster_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
    const matchesSeverity = severityFilter === 'All' || report.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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

  const getStatusVariant = (status) => {
    const variants = {
      Pending: 'warning',
      'In Progress': 'info',
      Resolved: 'success',
      Rejected: 'danger',
    };
    return variants[status] || 'default';
  };

  const statsByStatus = {
    pending: reports.filter((r) => r.status === 'Pending').length,
    inProgress: reports.filter((r) => r.status === 'In Progress').length,
    resolved: reports.filter((r) => r.status === 'Resolved').length,
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Disaster Reports"
        description="View and manage disaster reports submitted by users"
        icon={FileText}
        actions={
          <Button variant="outline" icon={RefreshCw} onClick={fetchReports} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatsCard title="Total Reports" value={reports.length} icon={FileText} color="blue" />
        <StatsCard title="Pending" value={statsByStatus.pending} icon={FileText} color="yellow" />
        <StatsCard
          title="In Progress"
          value={statsByStatus.inProgress}
          icon={FileText}
          color="purple"
        />
        <StatsCard title="Resolved" value={statsByStatus.resolved} icon={FileText} color="green" />
      </div>

      {/* Filters & Table */}
      <Card>
        <Card.Content className="pb-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Severity</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </Card.Content>

        <Card.Content className="pt-0">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No reports found</p>
            </div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Title</Table.Head>
                  <Table.Head>Type</Table.Head>
                  <Table.Head>Location</Table.Head>
                  <Table.Head>Severity</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Reported</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredReports.map((report) => (
                  <Table.Row key={report.id} onClick={() => setSelectedReport(report)}>
                    <Table.Cell className="font-medium">{report.title}</Table.Cell>
                    <Table.Cell>{report.disaster_type}</Table.Cell>
                    <Table.Cell>{report.location}</Table.Cell>
                    <Table.Cell>
                      <Badge variant={getSeverityVariant(report.severity)}>{report.severity}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
                    </Table.Cell>
                    <Table.Cell className="text-gray-500">
                      {formatDate(report.created_at)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card.Content>

        {!loading && filteredReports.length > 0 && (
          <Card.Footer>
            <p className="text-sm text-gray-600 text-center">
              Showing {filteredReports.length} of {reports.length} reports
            </p>
          </Card.Footer>
        )}
      </Card>
    </AdminLayout>
  );
};

export default SimplifiedAdminReports;
