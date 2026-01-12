import api from './client';

// Profile API endpoints
const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  deleteAccount: () => api.delete('/account'),
};

export default profileAPI;
