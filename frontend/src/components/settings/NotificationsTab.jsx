import React from 'react';
import ToggleRow from './ToggleRow';

const NotificationsTab = ({
  disasterAlerts,
  setDisasterAlerts,
  notifySOP,
  setNotifySOP,
  notifyNearby,
  setNotifyNearby,
  navigate,
}) => {
  return (
    <div>
      <ToggleRow
        label="Disaster Alerts"
        description="Enable general disaster alert notifications."
        checked={disasterAlerts}
        onChange={(next) => setDisasterAlerts(next)}
      />
      <ToggleRow
        label="SOP Updates"
        description="Notify you when standard operating procedures are updated."
        checked={notifySOP}
        onChange={(next) => setNotifySOP(next)}
      />
      <ToggleRow
        label="Nearby Incidents"
        description="Use your location to notify you about nearby incidents."
        checked={notifyNearby}
        onChange={(next) => setNotifyNearby(next)}
      />

      <div className="mt-2">
        <button
          className="text-blue-600 hover:underline"
          onClick={() => navigate('/notification-settings')}
        >
          Manage detailed notification preferences
        </button>
      </div>
    </div>
  );
};

export default NotificationsTab;
