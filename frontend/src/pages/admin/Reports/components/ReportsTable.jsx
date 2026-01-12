import React, { useState } from 'react';
import {
  FileText,
  MapPin,
  Clock,
  Eye,
  Edit,
  Bell,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';

const ReportsTable = ({
  currentReports,
  getSeverityColor,
  getStatusColor,
  formatDate,
  fetchReportDetails,
  setSelectedReport,
  handleUpdateReport,
  handleQuickApprove,
  handleQuickDecline,
  handleSendNotification,
  currentPage,
  setCurrentPage,
  totalPages,
  indexOfFirstReport,
  indexOfLastReport,
  filteredReports,
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (reportId) => {
    setOpenDropdown(openDropdown === reportId ? null : reportId);
  };

  const handleAction = (action, report) => {
    setOpenDropdown(null);
    action(report);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Reports ({filteredReports.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Report Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reporter
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentReports.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No reports found</p>
                    <p className="text-sm">
                      {filteredReports.length === 0
                        ? 'Try adjusting your search or filter criteria.'
                        : 'No disaster reports have been submitted yet.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              currentReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{report.title}</div>
                      <div className="text-sm text-gray-500">{report.type}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {report.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(report.severity)}`}
                    >
                      {report.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(report.status)}`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.reportedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(report.timestamp)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(report.id)}
                        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
                        title="Actions"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-600" />
                      </button>

                      {openDropdown === report.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenDropdown(null)}
                          />
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                            <button
                              onClick={() =>
                                handleAction(
                                  () =>
                                    report?.source === 'NADMA Realtime'
                                      ? setSelectedReport(report)
                                      : fetchReportDetails(report.id),
                                  report
                                )
                              }
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-3 text-blue-600" />
                              View Details
                            </button>

                            {report?.source !== 'NADMA Realtime' && (
                              <>
                                <button
                                  onClick={() => handleAction(handleUpdateReport, report)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Edit className="h-4 w-4 mr-3 text-green-600" />
                                  Update Report
                                </button>

                                {report.status === 'PENDING' && (
                                  <>
                                    <div className="border-t border-gray-200 my-1"></div>
                                    <button
                                      onClick={() =>
                                        handleAction(() => handleQuickApprove(report.id), report)
                                      }
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-3 text-green-600" />
                                      Quick Approve
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleAction(() => handleQuickDecline(report.id), report)
                                      }
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                      <XCircle className="h-4 w-4 mr-3 text-red-600" />
                                      Quick Decline
                                    </button>
                                  </>
                                )}

                                <div className="border-t border-gray-200 my-1"></div>
                                <button
                                  onClick={() => handleAction(handleSendNotification, report)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Bell className="h-4 w-4 mr-3 text-orange-600" />
                                  Send Notification
                                </button>
                              </>
                            )}

                            {report?.source === 'NADMA Realtime' && (
                              <div className="px-4 py-2 text-xs text-gray-500 italic border-t border-gray-200">
                                Limited actions for NADMA reports
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-700">
            Showing {indexOfFirstReport + 1} to{' '}
            {Math.min(indexOfLastReport, filteredReports.length)} of {filteredReports.length}{' '}
            results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded-lg transition-colors ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTable;
