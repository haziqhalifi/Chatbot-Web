import React from 'react';
import Header from '../../components/common/Header';
import SubscriptionManager from '../../components/subscription/SubscriptionManager';

const NotificationSettings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <SubscriptionManager />
      </div>
    </div>
  );
};

export default NotificationSettings;
