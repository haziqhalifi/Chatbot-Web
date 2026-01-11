import React, { useState, useEffect } from 'react';
import { Bell, Settings, MapPin, AlertTriangle, Save, Trash2, Check, X } from 'lucide-react';
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

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customLocation, setCustomLocation] = useState('');

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

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSubscription(formData);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save subscription:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete your notification preferences? You will stop receiving disaster alerts.'
      )
    ) {
      try {
        setSaving(true);
        await deleteSubscription();
        setIsEditing(false);
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

  return (
    <div className="w-full bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Notification Preferences"
        description="Manage your disaster alert subscriptions and notification settings."
      >
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Edit Preferences</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </PageHeader>

      {/* Error Display */}
      <StatusMessage error={error} />

      {/* Content */}
      <div className="px-6 pb-6">
        {/* Current Status */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-gray-800">
              {subscription?.is_active ? 'Active Subscription' : 'No Active Subscription'}
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            {subscription?.is_active
              ? 'You will receive notifications based on your preferences below.'
              : 'Set up your notification preferences to receive disaster alerts.'}
          </p>
        </div>

        {/* Disaster Types Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-800">Disaster Types</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Select the types of disasters you want to receive alerts for. Leave empty to receive
            alerts for all types.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {disasterTypes.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.disaster_types.includes(type)}
                  onChange={() => handleDisasterTypeChange(type)}
                  disabled={!isEditing}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${!isEditing ? 'text-gray-500' : 'text-gray-700'}`}>
                  {type}
                </span>
              </label>
            ))}
          </div>

          {formData.disaster_types.length === 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>No specific types selected:</strong> You will receive alerts for all
                disaster types.
              </p>
            </div>
          )}
        </div>

        {/* Locations Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Locations</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Select locations you want to receive alerts for. Leave empty to receive alerts for all
            locations.
          </p>

          {/* Popular Locations */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Popular Locations</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {locations.map((location) => (
                <label key={location} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.locations.includes(location)}
                    onChange={() => handleLocationChange(location)}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${!isEditing ? 'text-gray-500' : 'text-gray-700'}`}>
                    {location}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Location Input */}
          {isEditing && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Add Custom Location</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Enter city, state, or area name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomLocation()}
                />
                <button
                  onClick={handleAddCustomLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Selected Locations */}
          {formData.locations.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Selected Locations</h4>
              <div className="flex flex-wrap gap-2">
                {formData.locations.map((location) => (
                  <span
                    key={location}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {location}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveLocation(location)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {formData.locations.length === 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>No specific locations selected:</strong> You will receive alerts for all
                locations.
              </p>
            </div>
          )}
        </div>

        {/* Alert Radius */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">Alert Radius</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Set the radius (in kilometers) for location-based alerts.
          </p>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="100"
              value={formData.radius_km}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, radius_km: parseInt(e.target.value) }))
              }
              disabled={!isEditing}
              className="flex-1"
            />
            <span className="font-medium text-gray-700 min-w-[60px]">{formData.radius_km} km</span>
          </div>
        </div>

        {/* Notification Methods */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-800">Notification Methods</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Choose how you want to receive notifications.
          </p>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notification_methods.includes('web')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData((prev) => ({
                      ...prev,
                      notification_methods: [...prev.notification_methods, 'web'],
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      notification_methods: prev.notification_methods.filter((m) => m !== 'web'),
                    }));
                  }
                }}
                disabled={!isEditing}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={`${!isEditing ? 'text-gray-500' : 'text-gray-700'}`}>
                Web Notifications (In-app)
              </span>
            </label>

            <div className="text-sm text-gray-500 pl-6">
              <p>Email and SMS notifications coming soon!</p>
            </div>
          </div>
        </div>

        {/* Delete Subscription */}
        {subscription?.is_active && isEditing && (
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete All Preferences</span>
            </button>
            <p className="text-gray-500 text-sm mt-2">
              This will stop all disaster notifications. You can set up preferences again anytime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;
