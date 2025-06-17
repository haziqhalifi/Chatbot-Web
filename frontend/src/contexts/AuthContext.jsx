import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Check for existing token on app load
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken);
        // Check if token is not expired
        if (decoded.exp * 1000 > Date.now()) {
          setToken(savedToken);

          // Try to restore user data from localStorage first
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser);
              setUser(userData);
            } catch (e) {
              // If stored user data is invalid, use token data
              setUser({
                id: decoded.user_id,
                email: decoded.email,
                name: decoded.name || '',
              });
            }
          } else {
            // No stored user data, use token data
            setUser({
              id: decoded.user_id,
              email: decoded.email,
              name: decoded.name || '',
            });
          }
        } else {
          // Token expired, remove it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    // Also store user data including role
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setToken(token);
    setUser(userData);
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tiara_current_session'); // Clear chat session on logout
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
