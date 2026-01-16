// Helper functions for reports

export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'Critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'High':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'APPROVED':
    case 'Active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'PENDING':
    case 'Responding':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'UNDER_REVIEW':
    case 'Monitoring':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'DECLINED':
    case 'Resolved':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

export const formatStatus = (status) => {
  if (!status) return 'Pending';
  return status
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const filterReports = (
  reports,
  searchTerm,
  statusFilter,
  typeFilter,
  severityFilter,
  sourceFilter
) => {
  return reports.filter((report) => {
    const matchesSearch =
      searchTerm === '' ||
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedBy?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
    const matchesType = typeFilter === 'All' || report.type === typeFilter;
    const matchesSeverity = severityFilter === 'All' || report.severity === severityFilter;
    const matchesSource =
      sourceFilter === 'All' ||
      (sourceFilter === 'Disaster Report' && report.source === 'Disaster Report') ||
      (sourceFilter === 'NADMA Realtime' && report.source === 'NADMA Realtime');

    return matchesSearch && matchesStatus && matchesType && matchesSeverity && matchesSource;
  });
};

export const getAvailableTypes = (reports) => {
  return Array.from(
    new Set((reports || []).map((r) => r?.type).filter((t) => typeof t === 'string' && t.trim()))
  ).sort((a, b) => a.localeCompare(b));
};
