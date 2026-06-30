import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const axiosClient = axios.create({ baseURL });

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('hh_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout when the server returns 401 (token expired / invalid)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hh_token');
      window.dispatchEvent(new CustomEvent('hh:session-expired'));
    }
    return Promise.reject(error);
  },
);
