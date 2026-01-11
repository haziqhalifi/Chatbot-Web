import api from './client';

// Authentication API endpoints
const authAPI = {
  // Sign up a new user
  signup: (email, password) => {
    return api.post('/signup', { email, password });
  },

  // Sign in user
  signin: (email, password) => {
    return api.post('/signin', { email, password });
  },

  // Google authentication
  googleAuth: (credential) => {
    return api.post('/auth/google', { credential });
  },

  // Admin signin
  adminSignin: (email, password, adminCode) => {
    return api.post('/admin/signin', {
      email,
      password,
      adminCode,
    });
  },

  // Change password (authenticated)
  changePassword: (currentPassword, newPassword) => {
    return api.post('/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};

export default authAPI;
