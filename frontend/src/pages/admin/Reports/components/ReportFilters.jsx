import React from 'react';
import { Search, Filter, Download, RefreshCw, FileText, ChevronDown } from 'lucide-react';

const ReportFilters = ({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  severityFilter,
  setSeverityFilter,
  sourceFilter,
  setSourceFilter,
  availableTypes,
  showExportDropdown,
  setShowExportDropdown,
  exportReportsCSV,
  exportReportsPDF,
  fetchReports,
  loading,
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
              showFilters
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-2 transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={exportReportsCSV}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as CSV
                  </button>
                  <button
                    onClick={exportReportsPDF}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={fetchReports}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
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
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="DECLINED">Declined</option>
              <option value="UNDER_REVIEW">Under Review</option>
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
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Severity</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Sources</option>
              <option value="Disaster Report">User Submitted</option>
              <option value="NADMA Realtime">NADMA Realtime</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;
