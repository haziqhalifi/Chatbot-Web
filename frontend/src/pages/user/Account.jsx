import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import { User, MapPin, Globe, Phone, Mail, Shield, Calendar } from 'lucide-react';

const TabButton = ({ id, icon: Icon, label, isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {Icon ? <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} /> : null}
      <span>{label}</span>
    </button>
  );
};

// Malaysian States
const MALAYSIAN_STATES = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Penang',
  'Perak',
  'Perlis',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'Kuala Lumpur',
  'Labuan',
  'Putrajaya',
];

const AccountPage = ({ onClose }) => {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Public');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('Malaysia');
  const [timezone, setTimezone] = useState('Asia/Kuala_Lumpur');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [authProvider, setAuthProvider] = useState('local');
  const [lastLogin, setLastLogin] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching user profile from database...');
        const response = await api.get('/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 15000,
        });
        const userData = response.data;
        console.log('User profile data received:', userData);

        setFullName(userData.name || '');
        setEmail(userData.email || '');
        setRole(userData.role || 'Public');
        setPhone(userData.phone || '');
        setAddress(userData.address || '');
        setCity(userData.city || '');
        setState(userData.state || '');
        setPostcode(userData.postcode || '');
        setCountry(userData.country || 'Malaysia');
        setTimezone(userData.timezone || 'Asia/Kuala_Lumpur');
        setGivenName(userData.given_name || '');
        setFamilyName(userData.family_name || '');
        setProfilePicture(userData.profile_picture || '');
        setEmailVerified(userData.email_verified || false);
        setAuthProvider(userData.auth_provider || 'local');
        setLastLogin(userData.last_login || '');
        setCreatedAt(userData.created_at || '');
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        if (user) {
          setFullName(user.name || '');
          setEmail(user.email || '');
          setRole(user.role || 'Public');
        }

        if (error.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token, logout, user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setSaveStatus('error');
      setSaveMessage('Session expired. Please sign in again.');
      setTimeout(() => logout(), 2000);
      return;
    }

    if (!fullName.trim()) {
      setSaveStatus('error');
      setSaveMessage('Full name is required.');
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    // Validate phone number if provided
    if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
      setSaveStatus('error');
      setSaveMessage('Please enter a valid phone number.');
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    // Validate postcode if provided
    if (postcode && !/^\d{5}$/.test(postcode)) {
      setSaveStatus('error');
      setSaveMessage('Postcode must be 5 digits.');
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    setUpdating(true);
    setSaveStatus('saving');
    setSaveMessage('Saving changes...');

    try {
      const response = await api.put(
        '/profile',
        {
          name: fullName,
          phone: phone,
          address: address,
          city: city,
          state: state,
          postcode: postcode,
          country: country,
          timezone: timezone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 15000,
        }
      );

      console.log('Profile update response:', response.data);

      // Update localStorage with the new profile data
      localStorage.setItem('tiara_user_profile', JSON.stringify(response.data));
      window.dispatchEvent(new Event('profileUpdated'));

      setSaveStatus('saved');
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);

      let errorMessage = 'Failed to update profile. Please try again.';

      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please check your internet connection.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Session expired. Please sign in again.';
          setTimeout(() => logout(), 2000);
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.detail || 'Invalid profile data.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.response.data?.detail || errorMessage;
        }
      }

      setSaveStatus('error');
      setSaveMessage(errorMessage);
      setTimeout(() => setSaveStatus(null), 5000);
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
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-100">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-800">My Account</h1>
          <p className="text-sm text-gray-500">
            Manage your personal information and account settings
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
          aria-label="Close account"
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
      </div>

      {/* Status Messages */}
      <div className="px-6 pt-4">
        {(saveStatus || saveMessage) && (
          <div
            className={`mb-3 text-sm ${
              saveStatus === 'error'
                ? 'text-red-700 bg-red-50 border border-red-200'
                : saveStatus === 'saved'
                  ? 'text-green-800 bg-green-50 border border-green-200'
                  : 'text-gray-700 bg-gray-50 border border-gray-200'
            } rounded-lg px-3 py-2`}
          >
            {saveMessage}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-2">
          <TabButton
            id="profile"
            icon={User}
            label="Profile"
            isActive={activeTab === 'profile'}
            onClick={setActiveTab}
          />
          <TabButton
            id="contact"
            icon={Phone}
            label="Contact"
            isActive={activeTab === 'contact'}
            onClick={setActiveTab}
          />
          <TabButton
            id="address"
            icon={MapPin}
            label="Address"
            isActive={activeTab === 'address'}
            onClick={setActiveTab}
          />
          <TabButton
            id="security"
            icon={Shield}
            label="Security"
            isActive={activeTab === 'security'}
            onClick={setActiveTab}
          />
        </div>
      </div>

      <div className="px-6 pb-6 max-h-[70vh] overflow-y-auto">
        <form onSubmit={handleProfileSubmit}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Profile Picture */}
              {profilePicture && (
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                    />
                    {emailVerified && (
                      <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {authProvider === 'google' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-1">First Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        value={givenName}
                        readOnly
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-1">Last Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        value={familyName}
                        readOnly
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 pr-20"
                    value={email}
                    readOnly
                  />
                  {emailVerified && (
                    <span className="absolute right-3 top-2.5 text-green-600 text-sm font-medium flex items-center">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">User Role</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    value={role}
                    readOnly
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Account Type</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    value={authProvider === 'google' ? 'Google Account' : 'Local Account'}
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., +60 12-345 6789"
                />
                <p className="text-sm text-gray-500 mt-1">Format: +60 for Malaysia</p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Timezone</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="Asia/Kuala_Lumpur">Malaysia (UTC+8)</option>
                  <option value="Asia/Singapore">Singapore (UTC+8)</option>
                  <option value="Asia/Jakarta">Indonesia (UTC+7)</option>
                  <option value="Asia/Bangkok">Thailand (UTC+7)</option>
                  <option value="Asia/Manila">Philippines (UTC+8)</option>
                  <option value="Asia/Hong_Kong">Hong Kong (UTC+8)</option>
                  <option value="Asia/Brunei">Brunei (UTC+8)</option>
                </select>
              </div>
            </div>
          )}

          {/* Address Tab */}
          {activeTab === 'address' && (
            <div className="space-y-4">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Address</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full address"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">City</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Kuala Lumpur"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">State</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  >
                    <option value="">Select State</option>
                    {MALAYSIAN_STATES.map((stateName) => (
                      <option key={stateName} value={stateName}>
                        {stateName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Postcode</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="e.g., 50000"
                    maxLength={5}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Country</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="Malaysia">Malaysia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Brunei">Brunei</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">Account Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date Registered:</span>
                    <span className="font-medium">
                      {createdAt ? new Date(createdAt).toLocaleDateString('en-MY') : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Login:</span>
                    <span className="font-medium">
                      {lastLogin
                        ? new Date(lastLogin).toLocaleDateString('en-MY', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email Status:</span>
                    <span
                      className={`font-medium ${emailVerified ? 'text-green-600' : 'text-orange-600'}`}
                    >
                      {emailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={handleLogoutAll}
                  className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {activeTab !== 'security' && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AccountPage;
