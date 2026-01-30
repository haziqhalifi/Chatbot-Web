import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import { AlertTriangle } from 'lucide-react';
import {
  AnalyticsGrid,
  SearchAndFilters,
  DisasterTable,
  MyReportsTable,
  DisasterDetailModal,
  TabNavigation,
  EmptyState,
} from '../../components/dashboard';

const DisasterDashboard = () => {
  const navigate = useNavigate();
  const [disasters, setDisasters] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [activeTab, setActiveTab] = useState('disasters');
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // NADMA API configuration - handled in frontend
  const NADMA_API_URL = 'https://mydims.nadma.gov.my/api/disasters';
  const NADMA_TOKEN = '6571756|yN5L6StiHQOlyouD5FjmMFBOeywAxjPE79x0m7n843ac4e63';

  // Fetch disasters directly from NADMA API
  const fetchDisasters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(NADMA_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NADMA_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();
      console.log('Disaster Data:', data);
      setDisasters(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Error fetching disasters:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's own submitted reports
  const fetchMyReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view your reports');
        setMyReports([]);
        return;
      }

      const response = await fetch('http://localhost:8000/my-reports', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status}`);
      }

      const data = await response.json();
      console.log('My Reports Data:', data);
      setMyReports(data.reports || []);
    } catch (err) {
      console.error('Error fetching my reports:', err);
      setError(err.message);
      setMyReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh all data
  const refreshAllData = async () => {
    setLoading(true);
    if (activeTab === 'disasters') {
      await fetchDisasters();
    } else if (activeTab === 'myreports') {
      await fetchMyReports();
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'disasters') {
      fetchDisasters();
    } else if (activeTab === 'myreports') {
      fetchMyReports();
    }
  }, [activeTab]);

  // Calculate analytics
  const analytics = {
    total: disasters.length,
    active: disasters.filter(
      (d) => d.status?.toLowerCase() === 'aktif' || d.status?.toLowerCase() === 'active'
    ).length,
    resolved: disasters.filter(
      (d) => d.status?.toLowerCase() === 'selesai' || d.status?.toLowerCase() === 'resolved'
    ).length,
    critical: disasters.filter(
      (d) => d.bencana_khas?.toLowerCase() === 'ya' || d.bencana_khas?.toLowerCase() === 'yes'
    ).length,
  };

  // Calculate analytics for user reports
  const myReportsAnalytics = {
    total: myReports.length,
    pending: myReports.filter(
      (r) => r.status?.toLowerCase() === 'pending' || r.status?.toLowerCase() === 'active'
    ).length,
    resolved: myReports.filter((r) => r.status?.toLowerCase() === 'resolved').length,
    thisMonth: myReports.filter((r) => {
      const reportDate = new Date(r.timestamp);
      const now = new Date();
      return (
        reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  // Get disaster types distribution
  const typeDistribution = disasters.reduce((acc, disaster) => {
    const type = disaster.kategori?.name || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Filter and search disasters
  const filteredDisasters = disasters.filter((disaster) => {
    const matchesSearch =
      searchTerm === '' ||
      disaster.kategori?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disaster.state?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disaster.district?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disaster.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || disaster.kategori?.name === filterType;

    const matchesStatus =
      filterStatus === 'all' || disaster.status?.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  // Sort disasters
  const sortedDisasters = [...filteredDisasters].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0);
    } else if (sortBy === 'name') {
      return (a.name || a.title || '').localeCompare(b.name || b.title || '');
    }
    return 0;
  });

  // Filter and search user reports
  const filteredMyReports = myReports.filter((report) => {
    const matchesSearch =
      searchTerm === '' ||
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus =
      filterStatus === 'all' || report.status?.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  // Sort user reports
  const sortedMyReports = [...filteredMyReports].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    } else if (sortBy === 'name') {
      return (a.title || '').localeCompare(b.title || '');
    }
    return 0;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'ID',
      'Type',
      'Status',
      'State',
      'District',
      'Date Start',
      'Description',
      'Special Case',
    ];
    const rows = sortedDisasters.map((d) => [
      d.id || '',
      d.kategori?.name || '',
      d.status || '',
      d.state?.name || '',
      d.district?.name || '',
      d.datetime_start || '',
      d.description || '',
      d.bencana_khas || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disasters_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleViewDetails = (disaster) => {
    setSelectedDisaster(disaster);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDisaster(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={32} />
            Disaster Reports
          </h1>
          <p className="mt-2 text-gray-600">
            View official disaster reports from NADMA and track your submitted reports
          </p>
        </div>

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Analytics Cards */}
        <AnalyticsGrid
          activeTab={activeTab}
          analytics={analytics}
          myReportsAnalytics={myReportsAnalytics}
        />

        {/* Filters and Actions */}
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          typeDistribution={typeDistribution}
          loading={loading}
          onRefresh={refreshAllData}
          onExport={exportToCSV}
        />

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <EmptyState
                type="loading"
                message={`Loading ${activeTab === 'disasters' ? 'disasters' : 'your reports'}...`}
              />
            ) : error ? (
              <EmptyState type="error" message={`Error: ${error}`} />
            ) : activeTab === 'disasters' ? (
              sortedDisasters.length === 0 ? (
                <EmptyState type="no-data" message="No disasters found" />
              ) : (
                <DisasterTable disasters={sortedDisasters} onViewDetails={handleViewDetails} />
              )
            ) : sortedMyReports.length === 0 ? (
              <EmptyState
                type="no-reports"
                onAction={() => navigate('/report-disaster')}
                actionLabel="Submit a Report"
              />
            ) : (
              <MyReportsTable reports={sortedMyReports} />
            )}
          </div>

          {/* Results Count */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 text-center">
            {activeTab === 'disasters'
              ? `Showing ${sortedDisasters.length} of ${disasters.length} disasters`
              : `Showing ${sortedMyReports.length} of ${myReports.length} reports`}
          </div>
        </div>
      </div>

      {/* Disaster Detail Modal */}
      {showModal && selectedDisaster && (
        <DisasterDetailModal disaster={selectedDisaster} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default DisasterDashboard;
