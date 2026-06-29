import { axiosClient } from '../../api/axiosClient.js';

export const clientApi = {
  getProfile: () => axiosClient.get('/client/profile'),
  updateProfile: (data) => axiosClient.put('/client/profile', data),

  getAnnouncements: () => axiosClient.get('/client/announcements'),

  getProvidersByCategory: (category, params) =>
    axiosClient.get(`/providers`, { params: { category, ...params } }),

  getProviderProfile: (providerId) =>
    axiosClient.get(`/providers/${providerId}/public`),

  getProviderReviews: (providerId) =>
    axiosClient.get(`/providers/${providerId}/reviews`),

  submitComplaint: (data) => axiosClient.post('/client/complaints', data),
  getComplaints: () => axiosClient.get('/client/complaints'),

  getDistricts: () => axiosClient.get('/reference/districts'),
};
