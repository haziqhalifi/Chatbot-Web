import React from 'react';
import { Bell, BellRing, Settings } from 'lucide-react';
import { useSubscriptions } from '../hooks/useSubscriptions';

const SubscriptionBadge = ({ onClick }) => {
  const { subscription, loading } = useSubscriptions();

  if (loading) {
    return (
      <div className="flex items-center space-x-1 text-xs text-gray-500">
        <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
        <span>Loading...</span>
      </div>
    );
  }

  const isSubscribed =
    subscription?.is_active &&
    (subscription.disaster_types?.length > 0 || subscription.locations?.length > 0);

  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        isSubscribed
          ? 'bg-green-100 text-green-800 hover:bg-green-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      title={
        isSubscribed ? 'Subscription active - Click to manage' : 'No subscription - Click to set up'
      }
    >
      {isSubscribed ? <BellRing className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
      <span>{isSubscribed ? 'Subscribed' : 'Not subscribed'}</span>
      <Settings className="w-3 h-3 opacity-60" />
    </button>
  );
};

export default SubscriptionBadge;
