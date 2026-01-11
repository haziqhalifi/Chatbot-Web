import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// Add request interceptor to include auth token and API key
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add API key for backend endpoints
    config.headers['x-api-key'] = 'secretkey';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
