import React, { useState, useEffect } from 'react';
import { Bell, MapPin, AlertTriangle, Save, Trash2, Check, X, Plus } from 'lucide-react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import PageHeader from '../common/PageHeader';
import StatusMessage from '../common/StatusMessage';

const SubscriptionManager = () => {
  const {
    subscription,
    disasterTypes,
    locations,
    loading,
    error,
    updateSubscription,
    deleteSubscription,
    clearError,
  } = useSubscriptions();

  const [formData, setFormData] = useState({
    disaster_types: [],
    locations: [],
    notification_methods: ['web'],
    radius_km: 10,
  });

  const [saving, setSaving] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);

  // Update form data when subscription loads
  useEffect(() => {
    if (subscription) {
      setFormData({
        disaster_types: subscription.disaster_types || [],
        locations: subscription.locations || [],
        notification_methods: subscription.notification_methods || ['web'],
        radius_km: subscription.radius_km || 10,
      });
    }
  }, [subscription]);

  const handleDisasterTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      disaster_types: prev.disaster_types.includes(type)
        ? prev.disaster_types.filter((t) => t !== type)
        : [...prev.disaster_types, type],
    }));
  };

  const handleLocationChange = (location) => {
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter((l) => l !== location)
        : [...prev.locations, location],
    }));
  };

  const handleAddCustomLocation = () => {
    if (customLocation.trim() && !formData.locations.includes(customLocation.trim())) {
      setFormData((prev) => ({
        ...prev,
        locations: [...prev.locations, customLocation.trim()],
      }));
      setCustomLocation('');
    }
  };

  const handleRemoveLocation = (location) => {
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.filter((l) => l !== location),
    }));
  };

  const toggleNotificationMethod = (method) => {
    setFormData((prev) => ({
      ...prev,
      notification_methods: prev.notification_methods.includes(method)
        ? prev.notification_methods.filter((m) => m !== method)
        : [...prev.notification_methods, method],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSubscription(formData);
    } catch (err) {
      console.error('Failed to save subscription:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        'Delete all notification preferences? You will stop receiving disaster alerts.'
      )
    ) {
      try {
        setSaving(true);
        await deleteSubscription();
      } catch (err) {
        console.error('Failed to delete subscription:', err);
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading && !subscription) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const displayedTypes = showAllTypes ? disasterTypes : disasterTypes.slice(0, 8);
  const displayedLocations = showAllLocations ? locations : locations.slice(0, 8);

  return (
    <div className="w-full bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Notification Preferences"
        description="Configure your disaster alert subscriptions"
      >
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </PageHeader>

      {/* Error Display */}
      <StatusMessage error={error} />

      {/* Content */}
      <div className="px-6 pb-6 space-y-6">
        {/* Status Banner */}
        {subscription?.is_active && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Subscription Active</span>
          </div>
        )}

        {/* Notification Methods */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            Notification Methods
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => toggleNotificationMethod('web')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.notification_methods.includes('web')
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    formData.notification_methods.includes('web')
                      ? 'border-green-600 bg-green-600'
                      : 'border-gray-300'
                  }`}
                >
                  {formData.notification_methods.includes('web') && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="font-medium text-gray-800">In-App</span>
              </div>
              <p className="text-xs text-gray-600">Real-time alerts in notification bell</p>
            </button>

            <button
              onClick={() => toggleNotificationMethod('email')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.notification_methods.includes('email')
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    formData.notification_methods.includes('email')
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                  }`}
                >
                  {formData.notification_methods.includes('email') && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="font-medium text-gray-800">Email</span>
              </div>
              <p className="text-xs text-gray-600">Sent to registered email address</p>
            </button>
          </div>
        </div>

        {/* Disaster Types */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Disaster Types
            </h3>
            {formData.disaster_types.length === 0 && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                All types
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {displayedTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleDisasterTypeChange(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.disaster_types.includes(type)
                    ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                    : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {disasterTypes.length > 8 && (
            <button
              onClick={() => setShowAllTypes(!showAllTypes)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showAllTypes ? 'Show less' : `Show ${disasterTypes.length - 8} more types`}
            </button>
          )}
        </div>

        {/* Locations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Locations
            </h3>
            {formData.locations.length === 0 && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                All locations
              </span>
            )}
          </div>

          {/* Selected Locations */}
          {formData.locations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.locations.map((location) => (
                <span
                  key={location}
                  className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {location}
                  <button
                    onClick={() => handleRemoveLocation(location)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Available Locations */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {displayedLocations.map((location) => (
              <button
                key={location}
                onClick={() => handleLocationChange(location)}
                disabled={formData.locations.includes(location)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.locations.includes(location)
                    ? 'bg-green-100 text-green-700 border-2 border-green-300 cursor-default'
                    : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                {location}
              </button>
            ))}
          </div>

          {locations.length > 8 && (
            <button
              onClick={() => setShowAllLocations(!showAllLocations)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showAllLocations ? 'Show less' : `Show ${locations.length - 8} more locations`}
            </button>
          )}

          {/* Custom Location */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="Add custom location..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomLocation()}
            />
            <button
              onClick={handleAddCustomLocation}
              disabled={!customLocation.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Alert Radius */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            Alert Radius
          </h3>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="100"
              value={formData.radius_km}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, radius_km: parseInt(e.target.value) }))
              }
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="font-semibold text-gray-800 min-w-[70px] text-right">
              {formData.radius_km} km
            </span>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="text-sm text-gray-500 pl-2">
          <p>📱 SMS notifications coming soon!</p>
        </div>

        {/* Delete Subscription */}
        {subscription?.is_active && (
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Preferences</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;
