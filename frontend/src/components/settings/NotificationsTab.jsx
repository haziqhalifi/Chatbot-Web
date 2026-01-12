import React from 'react';
import ToggleRow from './ToggleRow';
import SubscriptionSettings from './SubscriptionSettings';

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
    <div className="space-y-6">
      {/* General Notifications */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">General Notifications</h3>
        <div className="space-y-2">
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
        </div>
      </div>

      {/* Subscription Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Alert Subscriptions</h3>
        <SubscriptionSettings />
      </div>
    </div>
  );
};

export default NotificationsTab;
