import React from 'react';
import SubscriptionManager from '../subscription/SubscriptionManager';

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
      {/* Notification Preferences */}
      <SubscriptionManager />
    </div>
  );
};

export default NotificationsTab;
