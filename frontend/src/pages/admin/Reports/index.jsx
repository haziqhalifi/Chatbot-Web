import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import AdminLayout from '../../../components/admin/AdminLayout';
import PageHeader from '../../../components/common/PageHeader';

// Components
import StatsCards from './components/StatsCards';
import ReportFilters from './components/ReportFilters';
import ReportsTable from './components/ReportsTable';
import UpdateReportModal from './components/UpdateReportModal';
import NotificationModal from './components/NotificationModal';
import ReportDetailModal from './components/ReportDetailModal';

// Utils
import { exportReportsCSV, exportReportsPDF } from './utils/exportUtils';
import {
  getSeverityColor,
  getStatusColor,
  formatDate,
  formatStatus,
  filterReports,
  getAvailableTypes,
} from './utils/helperFunctions';

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
  const [sendingNotification, setSendingNotification] = useState(false);

  // Update modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingReport, setUpdatingReport] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    severity: '',
    admin_notes: '',
    coordinates: '',
    affected_people: 0,
    estimated_damage: '',
    response_team: '',
  });
  const [updatingInProgress, setUpdatingInProgress] = useState(false);

  // Export dropdown state
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Fetch reports from API
  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/admin/reports', {
        method: 'GET',
        headers: {
          'X-API-Key': 'secretkey',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Reports data received:', data.reports?.slice(0, 1)); // Log first report to verify data structure
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load reports when component mounts
  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.relative')) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showExportDropdown]);

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
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch report details: ${response.status}`);
      }

      const data = await response.json();
      setSelectedReport(data.report);
    } catch (error) {
      console.error('Error fetching report details:', error);
      alert('Failed to fetch report details. Please try again.');
    }
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
          disaster_type: notificationReport.type,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send notification: ${response.status}`);
      }

      const result = await response.json();
      alert(`Notification sent successfully! ${result.recipients_count || 0} recipients notified.`);

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
    setNotificationMessage('');
    setNotificationTitle('');
  };

  // Handle opening update modal
  const handleUpdateReport = (report) => {
    setUpdatingReport(report);
    setUpdateForm({
      status: report.status || 'PENDING',
      severity: report.severity || '',
      admin_notes: report.adminNotes || '',
      coordinates: report.coordinates || '',
      affected_people: report.affectedPeople || 0,
      estimated_damage: report.estimatedDamage || '',
      response_team: report.responseTeam || '',
    });
    setShowUpdateModal(true);
  };

  // Handle closing update modal
  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdatingReport(null);
    setUpdateForm({
      status: '',
      severity: '',
      admin_notes: '',
      coordinates: '',
      affected_people: 0,
      estimated_damage: '',
      response_team: '',
    });
  };

  // Handle update form submission
  const handleSubmitUpdate = async () => {
    if (!updatingReport) return;

    try {
      setUpdatingInProgress(true);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `http://localhost:8000/admin/reports/${updatingReport.id}/status`,
        {
          method: 'PUT',
          headers: {
            'X-API-Key': 'secretkey',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update report');
      }

      await fetchReports();
      handleCloseUpdateModal();
      alert('Report updated successfully!');
    } catch (error) {
      console.error('Error updating report:', error);
      alert(`Failed to update report: ${error.message}`);
    } finally {
      setUpdatingInProgress(false);
    }
  };

  // Quick action: Approve report
  const handleQuickApprove = async (reportId) => {
    if (!confirm('Are you sure you want to approve this report?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/admin/reports/${reportId}/approve`, {
        method: 'POST',
        headers: {
          'X-API-Key': 'secretkey',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to approve report');

      await fetchReports();
      alert('Report approved successfully!');
    } catch (error) {
      console.error('Error approving report:', error);
      alert(`Failed to approve report: ${error.message}`);
    }
  };

  // Quick action: Decline report
  const handleQuickDecline = async (reportId) => {
    const reason = prompt('Enter reason for declining (optional):');
    if (reason === null) return;

    try {
      const token = localStorage.getItem('token');
      const url = new URL(`http://localhost:8000/admin/reports/${reportId}/decline`);
      if (reason) url.searchParams.append('reason', reason);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-API-Key': 'secretkey',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to decline report');

      await fetchReports();
      alert('Report declined successfully!');
    } catch (error) {
      console.error('Error declining report:', error);
      alert(`Failed to decline report: ${error.message}`);
    }
  };

  // Filter reports
  const filteredReports = filterReports(
    reports,
    searchTerm,
    statusFilter,
    typeFilter,
    severityFilter,
    sourceFilter
  );

  const availableTypes = getAvailableTypes(reports);

  // Pagination logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const handleExportCSV = () => {
    const token = localStorage.getItem('token');
    exportReportsCSV(token);
    setShowExportDropdown(false);
  };

  const handleExportPDF = () => {
    const token = localStorage.getItem('token');
    exportReportsPDF(token);
    setShowExportDropdown(false);
  };

  // Show loading or check authentication
  if (!user && !localStorage.getItem('token')) {
    return null;
  }

  // Show loading if user is being loaded
  if (!user && localStorage.getItem('token')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Reports</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchReports}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state for initial load
  if (loading && reports.length === 0) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <PageHeader title="Disaster Reports" icon={null} />

          {/* Content */}
          <div className="px-6 pb-6">
            {/* Statistics Cards */}
            <StatsCards reports={reports} />

            {/* Search and Filter Section */}
            <ReportFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              severityFilter={severityFilter}
              setSeverityFilter={setSeverityFilter}
              sourceFilter={sourceFilter}
              setSourceFilter={setSourceFilter}
              availableTypes={availableTypes}
              showExportDropdown={showExportDropdown}
              setShowExportDropdown={setShowExportDropdown}
              exportReportsCSV={handleExportCSV}
              exportReportsPDF={handleExportPDF}
              fetchReports={fetchReports}
              loading={loading}
            />

            {/* Reports Table */}
            <ReportsTable
              currentReports={currentReports}
              getSeverityColor={getSeverityColor}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
              formatStatus={formatStatus}
              fetchReportDetails={fetchReportDetails}
              setSelectedReport={setSelectedReport}
              handleUpdateReport={handleUpdateReport}
              handleQuickApprove={handleQuickApprove}
              handleQuickDecline={handleQuickDecline}
              handleSendNotification={handleSendNotification}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              indexOfFirstReport={indexOfFirstReport}
              indexOfLastReport={indexOfLastReport}
              filteredReports={filteredReports}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <UpdateReportModal
        showUpdateModal={showUpdateModal}
        updatingReport={updatingReport}
        updateForm={updateForm}
        setUpdateForm={setUpdateForm}
        updatingInProgress={updatingInProgress}
        handleCloseUpdateModal={handleCloseUpdateModal}
        handleSubmitUpdate={handleSubmitUpdate}
      />

      <NotificationModal
        showNotificationModal={showNotificationModal}
        notificationReport={notificationReport}
        notificationTitle={notificationTitle}
        setNotificationTitle={setNotificationTitle}
        notificationMessage={notificationMessage}
        setNotificationMessage={setNotificationMessage}
        sendingNotification={sendingNotification}
        handleCloseNotificationModal={handleCloseNotificationModal}
        handleConfirmNotification={handleConfirmNotification}
        getSeverityColor={getSeverityColor}
        getStatusColor={getStatusColor}
        formatStatus={formatStatus}
      />

      <ReportDetailModal
        selectedReport={selectedReport}
        setSelectedReport={setSelectedReport}
        getSeverityColor={getSeverityColor}
        getStatusColor={getStatusColor}
        formatDate={formatDate}
        formatStatus={formatStatus}
      />
    </AdminLayout>
  );
};

export default AdminReports;
