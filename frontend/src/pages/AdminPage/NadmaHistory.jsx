import React, { useState, useEffect } from 'react';
import {
  Shield,
  MapPin,
  Clock,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  Search,
  Filter,
  Download,
  Eye,
  X,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NadmaHistory = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch disasters from database
  const fetchDisasters = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/map/admin/nadma/history?limit=1000', {
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
        throw new Error(`Failed to fetch disasters: ${response.status}`);
      }

      const result = await response.json();
      setDisasters(result.data || []);
    } catch (error) {
      console.error('Error fetching NADMA history:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !user) {
      navigate('/signin');
      return;
    }
    fetchDisasters();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handleBackToDashboard = () => {
    navigate('/admin');
  };

  const handleRowClick = (disaster) => {
    setSelectedDisaster(disaster);
    setShowDetailModal(true);
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedDisaster(null);
  };

  // Get unique values for filters
  const availableStatuses = Array.from(
    new Set(disasters.map((d) => d?.status).filter((s) => typeof s === 'string' && s.trim()))
  ).sort();

  const availableCategories = Array.from(
    new Set(
      disasters.map((d) => d?.kategori?.name).filter((c) => typeof c === 'string' && c.trim())
    )
  ).sort();

  const availableStates = Array.from(
    new Set(disasters.map((d) => d?.state?.name).filter((s) => typeof s === 'string' && s.trim()))
  ).sort();

  // Filter disasters
  const filteredDisasters = disasters.filter((disaster) => {
    const status = String(disaster?.status || '');
    const category = String(disaster?.kategori?.name || '');
    const district = String(disaster?.district?.name || '');
    const state = String(disaster?.state?.name || '');
    const description = String(disaster?.description || disaster?.special_report || '');
    const id = String(disaster?.id ?? '');

    const needle = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !needle ||
      [id, status, category, district, state, description].join(' ').toLowerCase().includes(needle);

    const matchesStatus = statusFilter === 'All' || status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || category === categoryFilter;
    const matchesState = stateFilter === 'All' || state === stateFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesState;
  });

  const exportData = () => {
    const dataStr = JSON.stringify(filteredDisasters, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `nadma_history_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading && disasters.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading NADMA disaster history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
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
                <h1 className="text-xl font-semibold text-gray-900">NADMA Disaster History</h1>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchDisasters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        </main>
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
              <h1 className="text-xl font-semibold text-gray-900">NADMA Disaster History</h1>
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
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{disasters.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Disasters</p>
                <p className="text-2xl font-bold text-gray-900">
                  {disasters.filter((d) => d.status?.toLowerCase() === 'aktif').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {disasters.filter((d) => d.status?.toLowerCase() === 'selesai').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Special Cases</p>
                <p className="text-2xl font-bold text-gray-900">
                  {disasters.filter((d) => d.bencana_khas?.toLowerCase() === 'ya').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search disasters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
                <button
                  onClick={exportData}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={fetchDisasters}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="All">All Status</option>
                    {availableStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="All">All Categories</option>
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="All">All States</option>
                    {availableStates.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Disasters Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Disaster Records ({filteredDisasters.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            {filteredDisasters.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No disasters found matching your filters</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Special Case
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Victims
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Started
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDisasters.map((disaster) => (
                    <tr key={disaster.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{disaster.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {disaster.kategori?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            disaster.status?.toLowerCase() === 'aktif'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {disaster.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {[disaster.district?.name, disaster.state?.name]
                          .filter(Boolean)
                          .join(', ') || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {disaster.bencana_khas?.toLowerCase() === 'ya' ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            YES
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {disaster.case?.jumlah_mangsa
                          ? `${disaster.case.jumlah_mangsa} people`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {disaster.datetime_start
                          ? new Date(disaster.datetime_start).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleRowClick(disaster)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedDisaster && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Disaster Details #{selectedDisaster.id}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedDisaster.kategori?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedDisaster.status?.toLowerCase() === 'aktif'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {selectedDisaster.status || 'N/A'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {[selectedDisaster.district?.name, selectedDisaster.state?.name]
                      .filter(Boolean)
                      .join(', ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Special Case</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedDisaster.bencana_khas || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Description */}
              {(selectedDisaster.description || selectedDisaster.special_report) && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-900">
                    {selectedDisaster.description || selectedDisaster.special_report}
                  </p>
                </div>
              )}

              {/* Case Info */}
              {selectedDisaster.case && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Impact Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Relief Centers (PPS)</p>
                      <p className="text-xl font-bold text-gray-900">
                        {selectedDisaster.case.jumlah_pps || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Families Affected</p>
                      <p className="text-xl font-bold text-gray-900">
                        {selectedDisaster.case.jumlah_keluarga || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Victims</p>
                      <p className="text-xl font-bold text-gray-900">
                        {selectedDisaster.case.jumlah_mangsa || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="text-gray-900">
                    {selectedDisaster.datetime_start
                      ? new Date(selectedDisaster.datetime_start).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
                {selectedDisaster.datetime_end && (
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="text-gray-900">
                      {new Date(selectedDisaster.datetime_end).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Coordinates */}
              {(selectedDisaster.latitude || selectedDisaster.longitude) && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Coordinates</p>
                  <p className="text-gray-900">
                    Lat: {selectedDisaster.latitude}, Long: {selectedDisaster.longitude}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NadmaHistory;
