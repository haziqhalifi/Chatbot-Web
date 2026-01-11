import React from 'react';
import AccountPage from '../../pages/user/Account';
import Report from '../../pages/user/Report';
import ReportDisaster from '../../pages/user/ReportDisaster';
import EmergencySupport from '../../pages/user/EmergencySupport';
import SettingsPage from '../../pages/user/Settings';

const ModalsContainer = ({
  isAccountOpen,
  isReportOpen,
  isReportDisasterOpen,
  isSettingsOpen,
  isEmergencyOpen,
  onClose,
}) => {
  return (
    <>
      {/* Account Modal */}
      {isAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm modal-backdrop">
          <div className="animate-in fade-in duration-200 scale-95 animate-in">
            <AccountPage onClose={onClose} />
          </div>
        </div>
      )}{' '}
      {/* Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm modal-backdrop">
          <div className="animate-in fade-in duration-200 scale-95 animate-in">
            <Report onClose={onClose} />
          </div>
        </div>
      )}
      {/* Report Disaster Modal */}
      {isReportDisasterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm modal-backdrop">
          <div className="animate-in fade-in duration-200 scale-95 animate-in">
            <ReportDisaster onClose={onClose} />
          </div>
        </div>
      )}
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm modal-backdrop">
          <div className="animate-in fade-in duration-200 scale-95 animate-in">
            <SettingsPage onClose={onClose} />
          </div>
        </div>
      )}
      {/* Emergency Support Modal */}
      {isEmergencyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm modal-backdrop">
          <div className="animate-in fade-in duration-200 scale-95 animate-in">
            <EmergencySupport onClose={onClose} />
          </div>
        </div>
      )}
    </>
  );
};

export default ModalsContainer;
