import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

const AccountPage = ({ onClose }) => {
  const { user, token, logout } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Public');
  const [language, setLanguage] = useState('English');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [timezone, setTimezone] = useState('');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [authProvider, setAuthProvider] = useState('local');
  const [lastLogin, setLastLogin] = useState('');
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
        console.log('Profile picture URL:', userData.profile_picture);

        setFullName(userData.name || '');
        setEmail(userData.email || '');
        setRole(userData.role || 'Public');
        setLanguage(userData.language || 'English');
        setPhone(userData.phone || '');
        setAddress(userData.address || '');
        setCity(userData.city || '');
        setCountry(userData.country || '');
        setTimezone(userData.timezone || '');
        setGivenName(userData.given_name || '');
        setFamilyName(userData.family_name || '');
        setProfilePicture(userData.profile_picture || '');
        setEmailVerified(userData.email_verified || false);
        setAuthProvider(userData.auth_provider || 'local');
        setLastLogin(userData.last_login || '');
      } catch (error) {
        console.error('Failed to fetch user profile:', error); // If API fails but we have user data from AuthContext, use it as fallback
        if (user) {
          setFullName(user.name || '');
          setEmail(user.email || '');
          setRole(user.role || 'Public');
          setLanguage(user.language || 'English');
          setPhone(user.phone || '');
          setAddress(user.address || '');
          setCity(user.city || '');
          setCountry(user.country || '');
          setTimezone(user.timezone || '');
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
      console.log('Updating profile with:', {
        name: fullName,
        language: language,
        phone: phone,
        address: address,
        city: city,
        country: country,
        timezone: timezone,
      });

      const response = await api.put(
        '/profile',
        {
          name: fullName,
          language: language,
          phone: phone,
          address: address,
          city: city,
          country: country,
          timezone: timezone,
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
      <div className="relative bg-white shadow-xl rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
        <h1 className="text-2xl font-bold mb-6 text-blue-700">My Account</h1>{' '}
        {/* Profile Picture Section */}
        <div className="mb-6 text-center">
          {profilePicture ? (
            <div>
              <img
                src={profilePicture}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto mb-2 border-4 border-blue-200 object-cover"
                onError={(e) => {
                  console.log('Profile picture failed to load:', profilePicture);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
                onLoad={() => console.log('Profile picture loaded successfully:', profilePicture)}
              />
              <div
                className="w-24 h-24 rounded-full mx-auto mb-2 border-4 border-gray-300 bg-gray-100 flex items-center justify-center text-gray-400 text-2xl"
                style={{ display: 'none' }}
              >
                👤
              </div>
              <p className="text-sm text-gray-600">Profile Picture</p>
            </div>
          ) : (
            <div>
              <div className="w-24 h-24 rounded-full mx-auto mb-2 border-4 border-gray-300 bg-gray-100 flex items-center justify-center text-gray-400 text-2xl">
                👤
              </div>
              <p className="text-sm text-gray-600">No Profile Picture</p>
            </div>
          )}
        </div>
        <form onSubmit={handleProfileSubmit} className="mb-8">
          {/* Basic Information Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-blue-600 border-b border-blue-200 pb-2">
              👤 Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {authProvider === 'google' && (
                <>
                  <div>
                    <label className="block text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                      value={givenName}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                      value={familyName}
                      disabled
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-gray-700 mb-1">Email Address</label>
                <div className="flex items-center">
                  <input
                    type="email"
                    className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                    value={email}
                    disabled
                  />
                  {emailVerified && <span className="ml-2 text-green-600 text-sm">✓ Verified</span>}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">User Role</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                  value={role}
                  disabled
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Account Type</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                  value={authProvider === 'google' ? 'Google Account' : 'Local Account'}
                  disabled
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Preferred Language</label>
                <select
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="English">English</option>
                  <option value="Bahasa Melayu">Bahasa Melayu</option>
                  <option value="Mandarin">中文 (Mandarin)</option>
                  <option value="Tamil">தமிழ் (Tamil)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-blue-600 border-b border-blue-200 pb-2">
              📞 Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+60 12-345 6789"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Timezone</label>
                <select
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="">Select Timezone</option>
                  <option value="Asia/Kuala_Lumpur">Malaysia (UTC+8)</option>
                  <option value="Asia/Singapore">Singapore (UTC+8)</option>
                  <option value="Asia/Jakarta">Indonesia (UTC+7)</option>
                  <option value="Asia/Bangkok">Thailand (UTC+7)</option>
                  <option value="Asia/Manila">Philippines (UTC+8)</option>
                  <option value="Asia/Hong_Kong">Hong Kong (UTC+8)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-blue-600 border-b border-blue-200 pb-2">
              🏠 Address Information
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Address</label>
                <textarea
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 h-20 resize-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Kuala Lumpur"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Country</label>
                  <select
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="">Select Country</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Account Status Section */}
          {lastLogin && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-blue-600 border-b border-blue-200 pb-2">
                📊 Account Status
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Last Login:</strong> {new Date(lastLogin).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={updating}
              className={`px-6 py-2 rounded transition flex-1 ${
                updating
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {updating ? 'Saving Changes...' : 'Save Changes'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
        <div className="border-t pt-6">
          <button
            onClick={handleLogoutAll}
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout from all devices
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
