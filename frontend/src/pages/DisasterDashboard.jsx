import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import {
  AlertTriangle,
  MapPin,
  Calendar,
  TrendingUp,
  BarChart3,
  Download,
  RefreshCw,
  Filter,
  Search,
  Layers,
  Mountain,
  Droplets,
  Users,
  MapPinned,
} from 'lucide-react';

const DisasterDashboard = () => {
  const navigate = useNavigate();
  const [disasters, setDisasters] = useState([]);
  const [layerData, setLayerData] = useState({
    landslide: [],
    flood: [],
    poi: [],
    population: [],
  });
  const [layerStats, setLayerStats] = useState({
    landslide: 0,
    flood: 0,
    poi: 0,
    population: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [activeTab, setActiveTab] = useState('disasters'); // disasters, layers
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // NADMA API configuration - handled in frontend
  const NADMA_API_URL = 'https://mydims.nadma.gov.my/api/disasters';
  const NADMA_TOKEN = '6571756|yN5L6StiHQOlyouD5FjmMFBOeywAxjPE79x0m7n843ac4e63';

  // Fetch ArcGIS layer data
  const fetchLayerData = async (url, type) => {
    try {
      const response = await fetch(`${url}/0/query?where=1%3D1&outFields=*&f=json`);
      if (!response.ok) throw new Error(`Failed to fetch ${type}`);
      const data = await response.json();
      return data.features || [];
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      return [];
    }
  };

  // Fetch all layer data
  const fetchAllLayers = async () => {
    try {
      const endpoints = await fetch('http://localhost:8000/map/endpoints').then((r) => r.json());

      const layerPromises = endpoints.endpoints.map(async (endpoint) => {
        const features = await fetchLayerData(endpoint.url, endpoint.type);
        return { type: endpoint.type, features };
      });

      const results = await Promise.all(layerPromises);

      const newLayerData = {};
      const newLayerStats = {};

      results.forEach(({ type, features }) => {
        newLayerData[type] = features;
        newLayerStats[type] = features.length;
      });

      setLayerData(newLayerData);
      setLayerStats(newLayerStats);
    } catch (err) {
      console.error('Error fetching layers:', err);
    }
  };

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

  // Refresh all data
  const refreshAllData = async () => {
    setLoading(true);
    await Promise.all([fetchDisasters(), fetchAllLayers()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAllData();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={32} />
            Disaster Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Real-time disaster monitoring and analytics from NADMA MyDIMS
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('disasters')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'disasters'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} />
                NADMA Disasters
              </div>
            </button>
            <button
              onClick={() => setActiveTab('layers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'layers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers size={18} />
                Map Layers Analytics
              </div>
            </button>
          </nav>
        </div>

        {/* Analytics Cards */}
        {activeTab === 'disasters' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Disasters</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.total}</p>
                  </div>
                  <BarChart3 className="text-blue-500" size={40} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active/Ongoing</p>
                    <p className="text-3xl font-bold text-orange-600">{analytics.active}</p>
                  </div>
                  <AlertTriangle className="text-orange-500" size={40} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Resolved</p>
                    <p className="text-3xl font-bold text-green-600">{analytics.resolved}</p>
                  </div>
                  <TrendingUp className="text-green-500" size={40} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Critical/High Priority</p>
                    <p className="text-3xl font-bold text-red-600">{analytics.critical}</p>
                  </div>
                  <AlertTriangle className="text-red-500" size={40} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Landslide Risk Areas</p>
                    <p className="text-3xl font-bold text-amber-600">{layerStats.landslide}</p>
                    <p className="text-xs text-gray-500 mt-1">Areas monitored</p>
                  </div>
                  <Mountain className="text-amber-500" size={40} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Flood Prone Areas</p>
                    <p className="text-3xl font-bold text-blue-600">{layerStats.flood}</p>
                    <p className="text-xs text-gray-500 mt-1">High risk zones</p>
                  </div>
                  <Droplets className="text-blue-500" size={40} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Points of Interest</p>
                    <p className="text-3xl font-bold text-purple-600">{layerStats.poi}</p>
                    <p className="text-xs text-gray-500 mt-1">Emergency facilities</p>
                  </div>
                  <MapPinned className="text-purple-500" size={40} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Population Data</p>
                    <p className="text-3xl font-bold text-green-600">{layerStats.population}</p>
                    <p className="text-xs text-gray-500 mt-1">Density regions</p>
                  </div>
                  <Users className="text-green-500" size={40} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Type Distribution Chart */}
        {activeTab === 'disasters' ? (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Disaster Types Distribution
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(typeDistribution).map(([type, count]) => (
                <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{type}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Assessment Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Landslide Risk */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-3 mb-3">
                  <Mountain className="text-amber-600" size={24} />
                  <h3 className="font-semibold text-gray-900">Landslide Risk Areas</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {layerStats.landslide} monitored zones across Malaysia
                </p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Slope stability monitoring</span>
                  <span className="font-medium text-amber-600">Active</span>
                </div>
              </div>

              {/* Flood Risk */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <Droplets className="text-blue-600" size={24} />
                  <h3 className="font-semibold text-gray-900">Flood Prone Areas</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {layerStats.flood} high-risk flood zones identified
                </p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Monsoon season critical</span>
                  <span className="font-medium text-blue-600">Monitored</span>
                </div>
              </div>

              {/* POI */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <MapPinned className="text-purple-600" size={24} />
                  <h3 className="font-semibold text-gray-900">Emergency Facilities</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {layerStats.poi} points of interest for emergency response
                </p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Shelters, hospitals, stations</span>
                  <span className="font-medium text-purple-600">Available</span>
                </div>
              </div>

              {/* Population */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="text-green-600" size={24} />
                  <h3 className="font-semibold text-gray-900">Population Density</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {layerStats.population} regions with density data
                </p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Evacuation planning data</span>
                  <span className="font-medium text-green-600">Updated</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search disasters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {Object.keys(typeDistribution).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="ongoing">Ongoing</option>
              <option value="resolved">Resolved</option>
              <option value="completed">Completed</option>
            </select>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={refreshAllData}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Data Table - Conditional based on active tab */}
        {activeTab === 'disasters' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="animate-spin text-blue-600" size={40} />
                  <span className="ml-3 text-gray-600">Loading disasters...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12 text-red-600">
                  <AlertTriangle size={24} />
                  <span className="ml-3">Error: {error}</span>
                </div>
              ) : sortedDisasters.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-gray-600">
                  <AlertTriangle size={24} />
                  <span className="ml-3">No disasters found</span>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Started
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Special Case
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedDisasters.map((disaster, index) => (
                      <tr key={disaster.id || index} className="hover:bg-gray-50 cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            #{disaster.id || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {disaster.kategori?.group_helper && (
                              <img
                                src={`https://mydims.nadma.gov.my${disaster.kategori.group_helper}`}
                                alt={disaster.kategori?.name}
                                className="w-6 h-6"
                              />
                            )}
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {disaster.kategori?.name || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              disaster.status?.toLowerCase() === 'aktif'
                                ? 'bg-orange-100 text-orange-800'
                                : disaster.status?.toLowerCase() === 'selesai'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {disaster.status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col text-sm text-gray-900">
                            <div className="flex items-center">
                              <MapPin className="text-gray-400 mr-1" size={14} />
                              <span className="font-medium">{disaster.state?.name || 'N/A'}</span>
                            </div>
                            <span className="text-xs text-gray-500 ml-5">
                              {disaster.district?.name || ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="text-gray-400 mr-1" size={14} />
                            {disaster.datetime_start
                              ? new Date(disaster.datetime_start).toLocaleDateString()
                              : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {disaster.bencana_khas?.toLowerCase() === 'ya' ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Special Case
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedDisaster(disaster);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600 text-center">
              Showing {sortedDisasters.length} of {disasters.length} disasters
            </div>
          </div>
        ) : (
          /* Layer Data Tables */
          <div className="space-y-6">
            {/* Landslide Risk Areas Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-amber-50 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <Mountain className="text-amber-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">Landslide Risk Areas</h3>
                  <span className="ml-auto px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                    {layerStats.landslide} areas
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Risk Level
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Coordinates
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {layerData.landslide.slice(0, 50).map((feature, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {feature.attributes?.Name || feature.attributes?.LOCATION || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                              {feature.attributes?.RISK || feature.attributes?.Risk || 'Medium'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {feature.geometry
                              ? `${feature.geometry.y?.toFixed(4)}, ${feature.geometry.x?.toFixed(4)}`
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {layerData.landslide.length > 50 && (
                    <div className="text-center py-3 text-sm text-gray-500">
                      Showing first 50 of {layerData.landslide.length} areas
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Flood Prone Areas Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center gap-2">
                  <Droplets className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">Flood Prone Areas</h3>
                  <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {layerStats.flood} zones
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Area
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Severity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Coordinates
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {layerData.flood.slice(0, 50).map((feature, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {feature.attributes?.Name || feature.attributes?.AREA || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {feature.attributes?.SEVERITY ||
                                feature.attributes?.Severity ||
                                'High'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {feature.geometry
                              ? `${feature.geometry.y?.toFixed(4)}, ${feature.geometry.x?.toFixed(4)}`
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {layerData.flood.length > 50 && (
                    <div className="text-center py-3 text-sm text-gray-500">
                      Showing first 50 of {layerData.flood.length} zones
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Points of Interest Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-purple-50 border-b border-purple-200">
                <div className="flex items-center gap-2">
                  <MapPinned className="text-purple-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">Emergency Facilities</h3>
                  <span className="ml-auto px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {layerStats.poi} facilities
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Facility Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Location
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {layerData.poi.slice(0, 50).map((feature, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {feature.attributes?.Name || feature.attributes?.FACILITY || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                              {feature.attributes?.TYPE || feature.attributes?.Type || 'Emergency'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {feature.geometry
                              ? `${feature.geometry.y?.toFixed(4)}, ${feature.geometry.x?.toFixed(4)}`
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {layerData.poi.length > 50 && (
                    <div className="text-center py-3 text-sm text-gray-500">
                      Showing first 50 of {layerData.poi.length} facilities
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Population Data Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-green-50 border-b border-green-200">
                <div className="flex items-center gap-2">
                  <Users className="text-green-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Population Density Regions
                  </h3>
                  <span className="ml-auto px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {layerStats.population} regions
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Region
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Density
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Coordinates
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {layerData.population.slice(0, 50).map((feature, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {feature.attributes?.Name || feature.attributes?.REGION || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              {feature.attributes?.DENSITY ||
                                feature.attributes?.Population ||
                                'Medium'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {feature.geometry
                              ? `${feature.geometry.y?.toFixed(4)}, ${feature.geometry.x?.toFixed(4)}`
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {layerData.population.length > 50 && (
                    <div className="text-center py-3 text-sm text-gray-500">
                      Showing first 50 of {layerData.population.length} regions
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disaster Detail Modal */}
      {showModal && selectedDisaster && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedDisaster.kategori?.group_helper && (
                  <img
                    src={`https://mydims.nadma.gov.my${selectedDisaster.kategori.group_helper}`}
                    alt={selectedDisaster.kategori?.name}
                    className="w-10 h-10"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Disaster #{selectedDisaster.id}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedDisaster.kategori?.name || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedDisaster(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-6">
              {/* Status & Special Case */}
              <div className="flex gap-4">
                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedDisaster.status?.toLowerCase() === 'aktif'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {selectedDisaster.status}
                  </span>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Special Case</p>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedDisaster.bencana_khas?.toLowerCase() === 'ya'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedDisaster.bencana_khas || 'Tidak'}
                  </span>
                </div>
              </div>

              {/* Location Details */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin size={20} className="text-blue-600" />
                  Location Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">State</p>
                    <p className="font-medium text-gray-900">
                      {selectedDisaster.state?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">District</p>
                    <p className="font-medium text-gray-900">
                      {selectedDisaster.district?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Latitude</p>
                    <p className="font-medium text-gray-900">
                      {selectedDisaster.latitude || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Longitude</p>
                    <p className="font-medium text-gray-900">
                      {selectedDisaster.longitude || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar size={20} className="text-purple-600" />
                  Timeline
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium text-gray-900">
                      {selectedDisaster.datetime_start
                        ? new Date(selectedDisaster.datetime_start).toLocaleString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium text-gray-900">
                      {selectedDisaster.datetime_end
                        ? new Date(selectedDisaster.datetime_end).toLocaleString()
                        : 'Ongoing'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created At</p>
                    <p className="font-medium text-gray-900">
                      {selectedDisaster.created_at
                        ? new Date(selectedDisaster.created_at).toLocaleString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-medium text-gray-900">
                      {selectedDisaster.updated_at
                        ? new Date(selectedDisaster.updated_at).toLocaleString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Case Details */}
              {selectedDisaster.case && (
                <div className="bg-amber-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users size={20} className="text-amber-600" />
                    Case Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Relief Centers (PPS)</p>
                      <p className="font-medium text-gray-900">
                        {selectedDisaster.case.jumlah_pps || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Families Affected</p>
                      <p className="font-medium text-gray-900">
                        {selectedDisaster.case.jumlah_keluarga || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Victims</p>
                      <p className="font-medium text-gray-900">
                        {selectedDisaster.case.jumlah_mangsa || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedDisaster.description && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedDisaster.description}</p>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Level ID</p>
                    <p className="font-medium text-gray-900">
                      {selectedDisaster.level_id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Backdated</p>
                    <p className="font-medium text-gray-900">
                      {selectedDisaster.is_backdated ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created By</p>
                    <p className="font-medium text-gray-900">
                      User #{selectedDisaster.created_by_id || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedDisaster(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.open(
                    `https://maps.google.com/?q=${selectedDisaster.latitude},${selectedDisaster.longitude}`,
                    '_blank'
                  );
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <MapPin size={16} />
                View on Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisasterDashboard;
