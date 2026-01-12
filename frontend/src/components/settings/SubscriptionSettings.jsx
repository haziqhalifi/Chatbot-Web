import React, { useState } from 'react';
import { Bell, Mail, MapPin, AlertTriangle, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useSubscriptions } from '../../hooks/useSubscriptions';

const SubscriptionSettings = () => {
  const { subscription, disasterTypes, locations, loading, updateSubscription } =
    useSubscriptions();

  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Quick toggle for notification methods
  const toggleNotificationMethod = async (method) => {
    if (saving) return;

    setSaving(true);
    try {
      const currentMethods = subscription?.notification_methods || ['web'];
      const newMethods = currentMethods.includes(method)
        ? currentMethods.filter((m) => m !== method)
        : [...currentMethods, method];

      await updateSubscription({
        disaster_types: subscription?.disaster_types || [],
        locations: subscription?.locations || [],
        notification_methods: newMethods,
        radius_km: subscription?.radius_km || 10,
      });
    } catch (err) {
      console.error('Failed to update notification method:', err);
    } finally {
      setSaving(false);
    }
  };

  // Quick toggle for disaster type
  const toggleDisasterType = async (type) => {
    if (saving) return;

    setSaving(true);
    try {
      const currentTypes = subscription?.disaster_types || [];
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter((t) => t !== type)
        : [...currentTypes, type];

      await updateSubscription({
        disaster_types: newTypes,
        locations: subscription?.locations || [],
        notification_methods: subscription?.notification_methods || ['web'],
        radius_km: subscription?.radius_km || 10,
      });
    } catch (err) {
      console.error('Failed to update disaster types:', err);
    } finally {
      setSaving(false);
    }
  };

  const isMethodEnabled = (method) => {
    return subscription?.notification_methods?.includes(method) || false;
  };

  const isTypeEnabled = (type) => {
    return subscription?.disaster_types?.includes(type) || false;
  };

  const subscribedCount = subscription?.disaster_types?.length || 0;
  const locationCount = subscription?.locations?.length || 0;
  const methodCount = subscription?.notification_methods?.length || 0;

  if (loading && !subscription) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Subscription Status</h3>
              {subscription?.is_active && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Methods:</span>
                <span className="ml-1 font-medium text-gray-800">{methodCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Types:</span>
                <span className="ml-1 font-medium text-gray-800">
                  {subscribedCount === 0 ? 'All' : subscribedCount}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Locations:</span>
                <span className="ml-1 font-medium text-gray-800">
                  {locationCount === 0 ? 'All' : locationCount}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-4 p-2 hover:bg-blue-100 rounded-lg transition-colors"
            disabled={saving}
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-blue-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Toggles - Always Visible */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notification Methods
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {/* In-App Toggle */}
          <button
            onClick={() => toggleNotificationMethod('web')}
            disabled={saving}
            className={`p-3 rounded-lg border-2 transition-all ${
              isMethodEnabled('web')
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  isMethodEnabled('web') ? 'border-green-600 bg-green-600' : 'border-gray-300'
                }`}
              >
                {isMethodEnabled('web') && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm font-medium text-gray-700">In-App</span>
            </div>
          </button>

          {/* Email Toggle */}
          <button
            onClick={() => toggleNotificationMethod('email')}
            disabled={saving}
            className={`p-3 rounded-lg border-2 transition-all ${
              isMethodEnabled('email')
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  isMethodEnabled('email') ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                }`}
              >
                {isMethodEnabled('email') && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm font-medium text-gray-700">Email</span>
            </div>
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="space-y-4 pt-2 border-t border-gray-200">
          {/* Disaster Types */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <h4 className="text-sm font-medium text-gray-700">Disaster Types</h4>
              {subscribedCount === 0 && (
                <span className="text-xs text-gray-500 italic">(All types enabled)</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {disasterTypes.slice(0, 6).map((type) => (
                <button
                  key={type}
                  onClick={() => toggleDisasterType(type)}
                  disabled={saving}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isTypeEnabled(type)
                      ? 'bg-orange-100 text-orange-700 border border-orange-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {type}
                </button>
              ))}
            </div>

            {disasterTypes.length > 6 && (
              <p className="text-xs text-gray-500 mt-2">
                +{disasterTypes.length - 6} more types available
              </p>
            )}
          </div>

          {/* Locations Summary */}
          {locationCount > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <h4 className="text-sm font-medium text-gray-700">Active Locations</h4>
              </div>

              <div className="flex flex-wrap gap-2">
                {subscription.locations.slice(0, 4).map((location) => (
                  <span
                    key={location}
                    className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                  >
                    {location}
                  </span>
                ))}
                {locationCount > 4 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{locationCount - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Radius */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Alert Radius:</span>
            <span className="font-medium text-gray-800">{subscription?.radius_km || 10} km</span>
          </div>

          {/* Full Settings Link */}
          <div className="pt-2">
            <a
              href="/notification-settings"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              View full notification settings →
            </a>
          </div>
        </div>
      )}

      {saving && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );
};

export default SubscriptionSettings;
