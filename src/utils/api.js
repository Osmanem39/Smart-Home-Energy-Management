import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handler: auto-logout on 401/422
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 422)) {
      localStorage.removeItem('token');
      window.location.reload(); // force re-login
    }
    return Promise.reject(error);
  }
);

export default api;