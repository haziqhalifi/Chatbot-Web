import React from 'react';

const ReportDetailModal = ({
  selectedReport,
  setSelectedReport,
  getSeverityColor,
  getStatusColor,
  formatDate,
  formatStatus,
}) => {
  if (!selectedReport) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h2>
            <button
              onClick={() => setSelectedReport(null)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Type:</span> {selectedReport.type}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> {selectedReport.location}
                  </div>
                  <div>
                    <span className="font-medium">Coordinates:</span> {selectedReport.coordinates}
                  </div>
                  <div>
                    <span className="font-medium">Severity:</span>
                    {selectedReport.severity ? (
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(selectedReport.severity)}`}
                      >
                        {selectedReport.severity}
                      </span>
                    ) : (
                      <span className="ml-2 text-gray-400 font-medium">-</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedReport.status)}`}
                    >
                      {formatStatus(selectedReport.status)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>{' '}
                    {formatDate(selectedReport.timestamp)}
                  </div>
                </div>
              </div>

              {/* Reporter Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Reporter Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Name:</span> {selectedReport.reportedBy}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedReport.reporterEmail}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {selectedReport.reporterPhone}
                  </div>
                </div>
              </div>
            </div>

            {/* Impact and Response */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Impact Assessment</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Affected People:</span>{' '}
                    {selectedReport.affectedPeople}
                  </div>
                  <div>
                    <span className="font-medium">Estimated Damage:</span>{' '}
                    {selectedReport.estimatedDamage}
                  </div>
                  <div>
                    <span className="font-medium">Response Team:</span>{' '}
                    {selectedReport.responseTeam}
                  </div>
                </div>
              </div>

              {/* Admin Information */}
              {(selectedReport.reviewerName || selectedReport.adminNotes) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Information</h3>
                  <div className="space-y-2">
                    {selectedReport.reviewerName && (
                      <div>
                        <span className="font-medium">Reviewed By:</span>{' '}
                        {selectedReport.reviewerName}
                      </div>
                    )}
                    {selectedReport.updatedAt && (
                      <div>
                        <span className="font-medium">Last Updated:</span>{' '}
                        {formatDate(selectedReport.updatedAt)}
                      </div>
                    )}
                    {selectedReport.adminNotes && (
                      <div>
                        <span className="font-medium">Admin Notes:</span>
                        <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded">
                          {selectedReport.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Updates */}
              {selectedReport.updates && selectedReport.updates.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Updates</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedReport.updates.map((update, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <div className="text-sm text-gray-600">
                          {formatDate(update.time)} - by {update.by}
                        </div>
                        <div className="text-sm">{update.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700">{selectedReport.description}</p>
          </div>

          {/* Images */}
          {selectedReport.images && selectedReport.images.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Images</h3>
              <div className="grid grid-cols-3 gap-2">
                {selectedReport.images.map((image, index) => (
                  <div
                    key={index}
                    className="bg-gray-200 p-4 rounded text-center text-sm text-gray-600"
                  >
                    {image}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;
