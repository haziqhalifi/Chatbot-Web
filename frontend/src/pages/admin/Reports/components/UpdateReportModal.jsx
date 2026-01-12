import React from 'react';
import { X, Edit } from 'lucide-react';

const UpdateReportModal = ({
  showUpdateModal,
  updatingReport,
  updateForm,
  setUpdateForm,
  updatingInProgress,
  handleCloseUpdateModal,
  handleSubmitUpdate,
}) => {
  if (!showUpdateModal || !updatingReport) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Update Disaster Report</h2>
              <p className="text-sm text-gray-600 mt-1">
                {updatingReport.title} - ID: {updatingReport.id}
              </p>
            </div>
            <button onClick={handleCloseUpdateModal} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Update Form */}
          <div className="space-y-6">
            {/* Status and Severity Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="DECLINED">Declined</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity *</label>
                <select
                  value={updateForm.severity}
                  onChange={(e) => setUpdateForm({ ...updateForm, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Coordinates and Affected People Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GPS Coordinates
                </label>
                <input
                  type="text"
                  value={updateForm.coordinates}
                  onChange={(e) => setUpdateForm({ ...updateForm, coordinates: e.target.value })}
                  placeholder="e.g., 3.139, 101.687"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Affected People
                </label>
                <input
                  type="number"
                  min="0"
                  value={updateForm.affected_people}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      affected_people: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Estimated Damage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Damage
              </label>
              <input
                type="text"
                value={updateForm.estimated_damage}
                onChange={(e) => setUpdateForm({ ...updateForm, estimated_damage: e.target.value })}
                placeholder="e.g., RM 500,000 or Minor structural damage"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Response Team */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Response Team</label>
              <input
                type="text"
                value={updateForm.response_team}
                onChange={(e) => setUpdateForm({ ...updateForm, response_team: e.target.value })}
                placeholder="e.g., BOMBA Kuala Lumpur, NADMA Team Alpha"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
              <textarea
                value={updateForm.admin_notes}
                onChange={(e) => setUpdateForm({ ...updateForm, admin_notes: e.target.value })}
                rows={4}
                placeholder="Add administrative notes, verification details, or investigation comments..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Summary Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Update Summary</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      updateForm.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : updateForm.status === 'DECLINED'
                          ? 'bg-red-100 text-red-800'
                          : updateForm.status === 'UNDER_REVIEW'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {updateForm.status}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Severity:</span>{' '}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      updateForm.severity === 'Critical'
                        ? 'bg-red-100 text-red-800'
                        : updateForm.severity === 'High'
                          ? 'bg-orange-100 text-orange-800'
                          : updateForm.severity === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {updateForm.severity}
                  </span>
                </p>
                {updateForm.affected_people > 0 && (
                  <p>
                    <span className="font-medium">Affected People:</span>{' '}
                    {updateForm.affected_people}
                  </p>
                )}
                {updateForm.response_team && (
                  <p>
                    <span className="font-medium">Response Team:</span> {updateForm.response_team}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleCloseUpdateModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={updatingInProgress}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitUpdate}
              disabled={updatingInProgress}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {updatingInProgress ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateReportModal;
