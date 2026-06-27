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
