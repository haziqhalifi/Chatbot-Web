import React from 'react';
import { X, Bell, Send } from 'lucide-react';

const NotificationModal = ({
  showNotificationModal,
  notificationReport,
  notificationTitle,
  setNotificationTitle,
  notificationMessage,
  setNotificationMessage,
  sendingNotification,
  handleCloseNotificationModal,
  handleConfirmNotification,
  getSeverityColor,
  getStatusColor,
  formatStatus,
}) => {
  if (!showNotificationModal || !notificationReport) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Send Disaster Notification</h2>
            <button
              onClick={handleCloseNotificationModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Report Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Type:</span>
                <span className="ml-2 text-gray-900">{notificationReport.type}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Location:</span>
                <span className="ml-2 text-gray-900">{notificationReport.location}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Severity:</span>
                {notificationReport.severity ? (
                  <span
                    className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(notificationReport.severity)}`}
                  >
                    {notificationReport.severity}
                  </span>
                ) : (
                  <span className="ml-2 text-gray-400 font-medium">-</span>
                )}
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <span
                  className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(notificationReport.status)}`}
                >
                  {formatStatus(notificationReport.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Notification Form */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="notificationTitle"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Notification Title *
              </label>
              <input
                id="notificationTitle"
                type="text"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter notification title"
              />
            </div>

            <div>
              <label
                htmlFor="notificationMessage"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Notification Message *
              </label>
              <textarea
                id="notificationMessage"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter the notification message that will be sent to affected area residents..."
              />
              <p className="mt-1 text-sm text-gray-500">
                This message will be sent to users in the affected area:{' '}
                {notificationReport.location}
              </p>
            </div>

            {/* Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Notification Preview</h4>
              <div className="bg-white border border-blue-200 rounded-md p-3">
                <div className="flex items-start">
                  <Bell className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-gray-900">
                      {notificationTitle || 'Notification Title'}
                    </h5>
                    <p className="text-sm text-gray-700 mt-1">
                      {notificationMessage || 'Notification message will appear here...'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Emergency Alert • {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleCloseNotificationModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={sendingNotification}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmNotification}
              disabled={
                sendingNotification || !notificationTitle.trim() || !notificationMessage.trim()
              }
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {sendingNotification ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
