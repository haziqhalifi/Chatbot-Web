import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import {
  AccountLayout,
  LoadingState,
  ProfilePictureCard,
  Section,
  InputField,
  SelectField,
  TextAreaField,
  AccountStatusCard,
  ActionButtons,
  LogoutButton,
} from '../components/account';

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
    return <LoadingState onClose={onClose} />;
  }

  return (
    <AccountLayout onClose={onClose}>
      <h1 className="text-2xl font-bold mb-6 text-[#0a4974] text-center">My Account</h1>

      <ProfilePictureCard profilePicture={profilePicture} emailVerified={emailVerified} />

      <form onSubmit={handleProfileSubmit} className="mb-8 space-y-8">
        <Section icon="👤" title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            {authProvider === 'google' && (
              <>
                <InputField label="First Name" value={givenName} disabled />
                <InputField label="Last Name" value={familyName} disabled />
              </>
            )}

            <InputField
              label="Email Address"
              value={email}
              disabled
              rightContent={
                emailVerified ? (
                  <span className="text-green-600 text-sm font-medium flex items-center">
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
                ) : null
              }
            />

            <InputField label="User Role" value={role} disabled />

            <InputField
              label="Account Type"
              value={authProvider === 'google' ? 'Google Account' : 'Local Account'}
              disabled
            />

            <SelectField
              label="Preferred Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              options={[
                { value: 'English', label: 'English' },
                { value: 'Bahasa Melayu', label: 'Bahasa Melayu' },
                { value: 'Mandarin', label: '中文 (Mandarin)' },
                { value: 'Tamil', label: 'தமிழ் (Tamil)' },
              ]}
            />
          </div>
        </Section>

        <Section icon="📞" title="Contact Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+60 12-345 6789"
            />

            <SelectField
              label="Timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              options={[
                { value: '', label: 'Select Timezone' },
                { value: 'Asia/Kuala_Lumpur', label: 'Malaysia (UTC+8)' },
                { value: 'Asia/Singapore', label: 'Singapore (UTC+8)' },
                { value: 'Asia/Jakarta', label: 'Indonesia (UTC+7)' },
                { value: 'Asia/Bangkok', label: 'Thailand (UTC+7)' },
                { value: 'Asia/Manila', label: 'Philippines (UTC+8)' },
                { value: 'Asia/Hong_Kong', label: 'Hong Kong (UTC+8)' },
              ]}
            />
          </div>
        </Section>

        <Section icon="🏠" title="Address Information">
          <div className="grid grid-cols-1 gap-6">
            <TextAreaField
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full address"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Kuala Lumpur"
              />

              <SelectField
                label="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                options={[
                  { value: '', label: 'Select Country' },
                  { value: 'Malaysia', label: 'Malaysia' },
                  { value: 'Singapore', label: 'Singapore' },
                  { value: 'Indonesia', label: 'Indonesia' },
                  { value: 'Thailand', label: 'Thailand' },
                  { value: 'Philippines', label: 'Philippines' },
                  { value: 'Vietnam', label: 'Vietnam' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
            </div>
          </div>
        </Section>

        <AccountStatusCard lastLogin={lastLogin} />

        <ActionButtons updating={updating} onCancel={onClose} />
      </form>

      <LogoutButton onLogout={handleLogoutAll} />
    </AccountLayout>
  );
};

export default AccountPage;
