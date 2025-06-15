import React, { useState } from 'react';
import { Send, AlertTriangle, MapPin, Users } from 'lucide-react';
import { adminNotificationAPI } from '../api';
import { useSubscriptions } from '../hooks/useSubscriptions';

const AdminNotificationPanel = () => {
  const { disasterTypes, locations } = useSubscriptions();
  const [formData, setFormData] = useState({
    disaster_type: '',
    location: '',
    title: '',
    message: '',
    type: 'warning',
  });
  const [customDisasterType, setCustomDisasterType] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [loadingApiKey, setLoadingApiKey] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchApiKey = async () => {
    setLoadingApiKey(true);
    try {
      const response = await fetch('http://localhost:8000/dev/api-key');
      if (response.ok) {
        const data = await response.json();
        setApiKey(data.api_key);
      } else {
        console.error('Failed to fetch API key');
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
    } finally {
      setLoadingApiKey(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      alert('Please enter API key');
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const finalDisasterType = customDisasterType.trim() || formData.disaster_type;
      const finalLocation = customLocation.trim() || formData.location;

      const response = await adminNotificationAPI.createTargetedNotification(
        {
          disaster_type: finalDisasterType,
          location: finalLocation,
          title: formData.title,
          message: formData.message,
          type: formData.type,
        },
        apiKey
      );

      setResult({
        success: true,
        data: response.data,
      });

      // Reset form
      setFormData({
        disaster_type: '',
        location: '',
        title: '',
        message: '',
        type: 'warning',
      });
      setCustomDisasterType('');
      setCustomLocation('');
    } catch (error) {
      setResult({
        success: false,
        error: error.response?.data?.detail || 'Failed to send notification',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Send className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Send Targeted Notification</h2>
      </div>

      <p className="text-gray-600 mb-6">
        Send disaster notifications to users based on their subscription preferences. Only users
        subscribed to the selected disaster type and location will receive the notification.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">API Key *</label>
          <div className="flex space-x-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              placeholder="Enter admin API key"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={fetchApiKey}
              disabled={loadingApiKey}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {loadingApiKey ? 'Loading...' : 'Get Key'}
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-1">
            Click "Get Key" to automatically fetch the development API key
          </p>
        </div>

        {/* Disaster Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Disaster Type *
          </label>
          <select
            name="disaster_type"
            value={formData.disaster_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          >
            <option value="">Select disaster type...</option>
            {disasterTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={customDisasterType}
            onChange={(e) => setCustomDisasterType(e.target.value)}
            placeholder="Or enter custom disaster type..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Location *
          </label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          >
            <option value="">Select location...</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            placeholder="Or enter custom location..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Notification Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notification Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="info">Info (Blue)</option>
            <option value="warning">Warning (Orange)</option>
            <option value="danger">Danger (Red)</option>
            <option value="success">Success (Green)</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notification Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Flash Flood Warning"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Enter the notification message..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={sending}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          <span>{sending ? 'Sending...' : 'Send Notification'}</span>
        </button>
      </form>

      {/* Result Display */}
      {result && (
        <div
          className={`mt-6 p-4 rounded-lg ${
            result.success
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}
        >
          {result.success ? (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4" />
                <span className="font-semibold">Notification Sent Successfully!</span>
              </div>
              <p>Notified {result.data.users_notified} users</p>
              {result.data.errors && result.data.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Errors:</p>
                  <ul className="list-disc list-inside text-sm">
                    {result.data.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div>
              <span className="font-semibold">Error:</span> {result.error}
            </div>
          )}
        </div>
      )}

      {/* Development Notice */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">
          <strong>Development Tool:</strong> This panel is for testing targeted notifications. In
          production, this would be part of an admin dashboard with proper authentication.
        </p>
      </div>

      {/* API Key Information */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-blue-800 font-semibold mb-2">API Key Information</h3>
        <p className="text-blue-700 text-sm mb-2">
          For development/testing, use the API key from your backend <code>.env</code> file:
        </p>
        <div className="bg-gray-100 p-2 rounded font-mono text-sm">
          <strong>Default API Key:</strong> <code>secretkey</code>
        </div>
        <p className="text-blue-600 text-xs mt-2">
          Location: <code>backend/.env</code> → <code>API_KEY="secretkey"</code>
        </p>
      </div>
    </div>
  );
};

export default AdminNotificationPanel;
