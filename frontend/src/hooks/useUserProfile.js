import React, { useEffect, useState } from 'react';
import api from '../api'; // adjust path as needed

// Custom hook for user profile management
const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState(() => {
    // Load profile from localStorage on initialization
    const savedProfile = localStorage.getItem('tiara_user_profile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await api.get('/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserProfile(response.data);
        localStorage.setItem('tiara_user_profile', JSON.stringify(response.data));
      } catch (e) {
        // fallback to localStorage if needed
      }
    };
    fetchProfile();
  }, []);

  React.useEffect(() => {
    const handleStorageChange = () => {
      const savedProfile = localStorage.getItem('tiara_user_profile');
      setUserProfile(savedProfile ? JSON.parse(savedProfile) : null);
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom profile update events
    window.addEventListener('profileUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleStorageChange);
    };
  }, []);

  const logout = () => {
    // Clear profile cache on logout
    localStorage.removeItem('tiara_user_profile');
    localStorage.removeItem('tiara_user_profile_timestamp');
    // Remove token from localStorage/sessionStorage
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    // Redirect to sign-in page
    window.location.href = '/signin';
  };

  return { userProfile, logout };
};

export default useUserProfile;
