import React, { useState } from 'react';
import { Send, AlertTriangle, MapPin, Users } from 'lucide-react';
import { adminNotificationAPI } from '../../api';
import { useSubscriptions } from '../../hooks/useSubscriptions';

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
      <div className="flex items-center space-x-3 mb-6">
        <Send className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Send Targeted Notification</h2>
      </div>
      <p className="text-gray-600 mb-6">
        Send disaster notifications to users based on their subscription preferences.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
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
        </div>
        <button
          type="submit"
          disabled={sending}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{sending ? 'Sending...' : 'Send Notification'}</span>
        </button>
      </form>
      {result && (
        <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
          {result.success ? 'Success!' : `Error: ${result.error}`}
        </div>
      )}
    </div>
  );
};

export default AdminNotificationPanel;