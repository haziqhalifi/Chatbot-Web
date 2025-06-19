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

      // Update localStorage with the new profile data
      localStorage.setItem('tiara_user_profile', JSON.stringify(response.data));
      window.dispatchEvent(new Event('profileUpdated'));

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
      <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[600px] max-w-4xl w-full mx-4 border border-gray-100 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 z-10"
          onClick={onClose}
          aria-label="Close account modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a4974] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading account information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[600px] max-w-4xl w-full mx-4 border border-gray-100 relative max-h-[90vh] overflow-y-auto">
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 z-10"
        onClick={onClose}
        aria-label="Close account modal"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <h1 className="text-2xl font-bold mb-6 text-[#0a4974] text-center">My Account</h1>{' '}
      {/* Profile Picture Section */}
      <div className="mb-8 text-center">
        {profilePicture ? (
          <div>
            <img
              src={profilePicture}
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-[#0a4974] border-opacity-20 object-cover shadow-lg"
              onError={(e) => {
                console.log('Profile picture failed to load:', profilePicture);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
              onLoad={() => console.log('Profile picture loaded successfully:', profilePicture)}
            />
            <div
              className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-gray-300 bg-gray-100 flex items-center justify-center text-gray-400 text-2xl shadow-lg"
              style={{ display: 'none' }}
            >
              👤
            </div>
            <p className="text-sm text-gray-600 font-medium">Profile Picture</p>
          </div>
        ) : (
          <div>
            <div className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-2xl shadow-lg">
              👤
            </div>
            <p className="text-sm text-gray-500 font-medium">No Profile Picture</p>
          </div>
        )}
      </div>
      <form onSubmit={handleProfileSubmit} className="mb-8">
        {' '}
        {/* Basic Information Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-[#0a4974] border-b-2 border-[#0a4974] border-opacity-20 pb-2 flex items-center">
            <span className="mr-2">👤</span>
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {' '}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Full Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a4974] focus:border-transparent transition-all duration-200"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            {authProvider === 'google' && (
              <>
                {' '}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-600 cursor-not-allowed"
                    value={givenName}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-600 cursor-not-allowed"
                    value={familyName}
                    disabled
                  />
                </div>
              </>
            )}{' '}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email Address</label>
              <div className="flex items-center">
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-600 cursor-not-allowed"
                  value={email}
                  disabled
                />
                {emailVerified && (
                  <span className="ml-3 text-green-600 text-sm font-medium flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
            </div>{' '}
            <div>
              <label className="block text-gray-700 font-medium mb-2">User Role</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-600 cursor-not-allowed"
                value={role}
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Account Type</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-600 cursor-not-allowed"
                value={authProvider === 'google' ? 'Google Account' : 'Local Account'}
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Preferred Language</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a4974] focus:border-transparent transition-all duration-200"
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
        </div>{' '}
        {/* Contact Information Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-[#0a4974] border-b-2 border-[#0a4974] border-opacity-20 pb-2 flex items-center">
            <span className="mr-2">📞</span>
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a4974] focus:border-transparent transition-all duration-200"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+60 12-345 6789"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Timezone</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a4974] focus:border-transparent transition-all duration-200"
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
        </div>{' '}
        {/* Address Information Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-[#0a4974] border-b-2 border-[#0a4974] border-opacity-20 pb-2 flex items-center">
            <span className="mr-2">🏠</span>
            Address Information
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Address</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a4974] focus:border-transparent transition-all duration-200 h-24 resize-none"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">City</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a4974] focus:border-transparent transition-all duration-200"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Kuala Lumpur"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Country</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a4974] focus:border-transparent transition-all duration-200"
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
        </div>{' '}
        {/* Account Status Section */}
        {lastLogin && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-[#0a4974] border-b-2 border-[#0a4974] border-opacity-20 pb-2 flex items-center">
              <span className="mr-2">📊</span>
              Account Status
            </h2>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Last Login:</strong>{' '}
                {new Date(lastLogin).toLocaleString()}
              </p>
            </div>
          </div>
        )}{' '}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={updating}
            className={`px-6 py-3 rounded-lg transition-all duration-200 flex-1 font-medium ${
              updating
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-[#0a4974] text-white hover:bg-[#083757] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {updating ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving Changes...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>{' '}
      <div className="border-t pt-6 mt-6">
        <button
          onClick={handleLogoutAll}
          className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-all duration-200 font-medium flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout from all devices
        </button>
      </div>
    </div>
  );
};

export default AccountPage;
