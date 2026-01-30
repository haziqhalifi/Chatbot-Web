import React, { useState, useEffect } from 'react';
import {
  FileText,
  RefreshCw,
  Filter,
  Download,
  Eye,
  MoreVertical,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
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
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) setOpenMenuId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:8000/admin/reports', {
        headers: {
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

  const toggleMenu = (reportId) => {
    setOpenMenuId(openMenuId === reportId ? null : reportId);
  };

  const handleEditReport = (report) => {
    console.log('Editing report:', report);
    console.log('Report severity:', report.severity);

    // Normalize status to uppercase backend values
    let normalizedStatus = report.status || 'PENDING';
    if (normalizedStatus.toLowerCase() === 'pending') normalizedStatus = 'PENDING';
    if (normalizedStatus.toLowerCase() === 'in progress') normalizedStatus = 'UNDER_REVIEW';
    if (normalizedStatus.toLowerCase() === 'resolved') normalizedStatus = 'APPROVED';
    if (normalizedStatus.toLowerCase() === 'rejected') normalizedStatus = 'DECLINED';
    if (normalizedStatus.toLowerCase() === 'active') normalizedStatus = 'PENDING';

    // Normalize severity to proper case
    let normalizedSeverity = report.severity || 'Medium';
    if (normalizedSeverity.toLowerCase() === 'low') normalizedSeverity = 'Low';
    if (normalizedSeverity.toLowerCase() === 'medium') normalizedSeverity = 'Medium';
    if (normalizedSeverity.toLowerCase() === 'high') normalizedSeverity = 'High';
    if (normalizedSeverity.toLowerCase() === 'critical') normalizedSeverity = 'Critical';

    setEditingReport({
      id: report.id,
      status: normalizedStatus,
      severity: normalizedSeverity,
      admin_notes: report.admin_notes || '',
      affected_people: report.affected_people || 0,
      estimated_damage: report.estimated_damage || '',
      response_team: report.response_team || '',
      coordinates: report.coordinates || '',
    });
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleUpdateReport = async () => {
    if (!editingReport) return;

    console.log('Updating report with data:', editingReport);

    try {
      setUpdating(true);
      const token = localStorage.getItem('token');

      const payload = {
        status: editingReport.status,
        severity: editingReport.severity,
        admin_notes: editingReport.admin_notes,
        affected_people: editingReport.affected_people || null,
        estimated_damage: editingReport.estimated_damage || null,
        response_team: editingReport.response_team || null,
        coordinates: editingReport.coordinates || null,
      };

      console.log('Sending payload:', payload);

      const response = await fetch(
        `http://localhost:8000/admin/reports/${editingReport.id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Update successful:', result);
        await fetchReports();
        setShowEditModal(false);
        setEditingReport(null);
        alert('Report updated successfully');
      } else {
        const error = await response.json();
        console.error('Update failed:', error);
        alert(`Failed to update report: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report');
    } finally {
      setUpdating(false);
    }
  };

  const handleQuickApprove = async (reportId) => {
    if (!confirm('Approve this report?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/admin/reports/${reportId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchReports();
        alert('Report approved');
      }
    } catch (error) {
      console.error('Error approving report:', error);
      alert('Failed to approve report');
    }
    setOpenMenuId(null);
  };

  const handleQuickDecline = async (reportId) => {
    const reason = prompt('Decline this report? Enter reason:');
    if (reason === null) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/admin/reports/${reportId}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        await fetchReports();
        alert('Report declined');
      }
    } catch (error) {
      console.error('Error declining report:', error);
      alert('Failed to decline report');
    }
    setOpenMenuId(null);
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type?.toLowerCase().includes(searchTerm.toLowerCase());
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
      PENDING: 'warning',
      UNDER_REVIEW: 'info',
      APPROVED: 'success',
      DECLINED: 'danger',
      Pending: 'warning',
      'In Progress': 'info',
      Resolved: 'success',
      Rejected: 'danger',
    };
    return variants[status] || 'default';
  };

  const statsByStatus = {
    pending: reports.filter((r) => r.status === 'PENDING' || r.status === 'Pending').length,
    inProgress: reports.filter((r) => r.status === 'UNDER_REVIEW' || r.status === 'In Progress')
      .length,
    resolved: reports.filter((r) => r.status === 'APPROVED' || r.status === 'Resolved').length,
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
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="DECLINED">Declined</option>
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
                  <Table.Head>Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredReports.map((report) => (
                  <Table.Row key={report.id}>
                    <Table.Cell className="font-medium">{report.title}</Table.Cell>
                    <Table.Cell>{report.type}</Table.Cell>
                    <Table.Cell>{report.location}</Table.Cell>
                    <Table.Cell>
                      <Badge variant={getSeverityVariant(report.severity)}>{report.severity}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
                    </Table.Cell>
                    <Table.Cell className="text-gray-500">
                      {formatDate(report.timestamp)}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(report.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="h-5 w-5 text-gray-600" />
                        </button>

                        {openMenuId === report.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => handleEditReport(report)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                              >
                                <Edit className="h-4 w-4" />
                                <span>Edit Report</span>
                              </button>

                              <div className="border-t border-gray-200 my-1"></div>

                              <button
                                onClick={() => handleQuickApprove(report.id)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span>Approve</span>
                              </button>

                              <button
                                onClick={() => handleQuickDecline(report.id)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                                <span>Decline</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
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

      {/* Edit Report Modal */}
      {showEditModal && editingReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Report</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editingReport.status}
                  onChange={(e) => setEditingReport({ ...editingReport, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="DECLINED">Declined</option>
                </select>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <select
                  value={editingReport.severity}
                  onChange={(e) => setEditingReport({ ...editingReport, severity: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Affected People */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Affected People
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingReport.affected_people}
                  onChange={(e) =>
                    setEditingReport({
                      ...editingReport,
                      affected_people: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Number of affected people"
                />
              </div>

              {/* Estimated Damage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Damage
                </label>
                <input
                  type="text"
                  value={editingReport.estimated_damage}
                  onChange={(e) =>
                    setEditingReport({ ...editingReport, estimated_damage: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., RM 50,000"
                />
              </div>

              {/* Response Team */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Team
                </label>
                <input
                  type="text"
                  value={editingReport.response_team}
                  onChange={(e) =>
                    setEditingReport({ ...editingReport, response_team: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Assigned response team"
                />
              </div>

              {/* Coordinates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GPS Coordinates
                </label>
                <input
                  type="text"
                  value={editingReport.coordinates}
                  onChange={(e) =>
                    setEditingReport({ ...editingReport, coordinates: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 3.1390,101.6869"
                />
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                <textarea
                  rows="4"
                  value={editingReport.admin_notes}
                  onChange={(e) =>
                    setEditingReport({ ...editingReport, admin_notes: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Administrative notes..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={updating}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateReport}
                disabled={updating}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {updating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Report</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SimplifiedAdminReports;
