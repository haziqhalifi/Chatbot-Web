import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

const AccountPage = ({ onClose }) => {
  const { user, token, logout } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Public');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(true); // Always show loading initially
  const [updating, setUpdating] = useState(false); // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      // Always fetch from database to get the most up-to-date profile
      try {
        console.log('Fetching user profile from database...');
        const response = await api.get('/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 5000, // 5 second timeout
        });

        const userData = response.data;
        console.log('User profile data received:', userData);

        setFullName(userData.name || '');
        setEmail(userData.email || '');
        setRole(userData.role || 'Public');
        setLanguage(userData.language || 'English');
      } catch (error) {
        console.error('Failed to fetch user profile:', error);

        // If API fails but we have user data from AuthContext, use it as fallback
        if (user) {
          setFullName(user.name || '');
          setEmail(user.email || '');
          setRole(user.role || 'Public');
          setLanguage(user.language || 'English');
        }

        if (error.response?.status === 401) {
          // Token might be expired, logout user
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token, logout]);
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    setUpdating(true);
    try {
      console.log('Updating profile with:', { name: fullName, language: language });

      const response = await api.put(
        '/profile',
        {
          name: fullName,
          language: language,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 5000, // 5 second timeout
        }
      );

      console.log('Profile update response:', response.data);
      alert('Profile updated successfully!');

      // Refresh the profile data after successful update
      window.location.reload(); // Simple way to refresh data
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleLogoutAll = () => {
    logout();
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="relative bg-white shadow-xl rounded-lg p-8 max-w-lg w-full border-2 border-blue-200">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative bg-white shadow-xl rounded-lg p-8 max-w-lg w-full border-2 border-blue-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
        <h1 className="text-2xl font-bold mb-4 text-blue-700">My Account</h1>
        <form onSubmit={handleProfileSubmit} className="mb-8">
          <h2 className="text-lg font-semibold mb-2">🧍‍♂️ Profile Information</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>{' '}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
              value={email}
              disabled
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">User Role</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
              value={role}
              disabled
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Preferred Language</label>
            <select
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="English">English</option>
              <option value="Bahasa Melayu">Bahasa Melayu</option>
            </select>
          </div>{' '}
          <button
            type="submit"
            disabled={updating}
            className={`px-4 py-2 rounded transition ${
              updating
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
        <button
          onClick={handleLogoutAll}
          className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition mb-2"
        >
          Logout from all devices
        </button>
      </div>
    </div>
  );
};

export default AccountPage;
