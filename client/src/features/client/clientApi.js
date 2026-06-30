import { axiosClient } from '../../api/axiosClient.js';

export const clientApi = {
  getProfile: () => axiosClient.get('/client/profile'),
  updateProfile: (data) => axiosClient.put('/client/profile', data),
  updateProfileImage: (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    return axiosClient.put('/client/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateLocation: (data) => axiosClient.put('/client/profile/location', data),
  changePassword: (data) => axiosClient.put('/client/profile/password', data),

  getAnnouncements: () => axiosClient.get('/announcements/active'),

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
