import React from 'react';
import AccountPage from '../../pages/Account';
import ReportDisaster from '../../pages/ReportDisaster';
import ReportModal from '../../pages/ReportModal';
import EmergencySupport from '../../pages/EmergencySupport';
import SettingsPage from '../../pages/Settings';

const ModalsContainer = ({
  isAccountOpen,
  isReportOpen,
  isSystemReportOpen,
  isSettingsOpen,
  isEmergencyOpen,
  onClose,
}) => {
  return (
    <>
      {/* Account Modal */}
      {isAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm modal-backdrop">
          <div className="transform transition-all duration-200 ease-out scale-100 opacity-100">
            <AccountPage onClose={onClose} />
          </div>
        </div>
      )}

      {/* Disaster Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm modal-backdrop">
          <div className="transform transition-all duration-200 ease-out scale-100 opacity-100">
            <ReportDisaster onClose={onClose} />
          </div>
        </div>
      )}

      {/* System Report Modal */}
      {isSystemReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm modal-backdrop">
          <div className="transform transition-all duration-200 ease-out scale-100 opacity-100">
            <ReportModal onClose={onClose} />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm modal-backdrop">
          <div className="transform transition-all duration-200 ease-out scale-100 opacity-100">
            <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[400px] max-w-2xl w-full mx-4 border border-gray-100 relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                onClick={onClose}
                aria-label="Close settings"
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
              <SettingsPage onClose={onClose} />
            </div>
          </div>
        </div>
      )}
      {/* Emergency Support Modal */}
      {isEmergencyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm modal-backdrop">
          <div className="transform transition-all duration-200 ease-out scale-100 opacity-100">
            <EmergencySupport onClose={onClose} />
          </div>
        </div>
      )}
    </>
  );
};

export default ModalsContainer;
