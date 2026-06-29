import { axiosClient } from '../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../api/apiEndpoints.js';

export const providerApi = {
  getProfile: () => axiosClient.get(API_ENDPOINTS.PROVIDER.PROFILE),
  updateProfile: (data) => axiosClient.put(API_ENDPOINTS.PROVIDER.PROFILE, data),
  updateProfileImage: (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    return axiosClient.put(`${API_ENDPOINTS.PROVIDER.PROFILE}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  changePassword: (data) => axiosClient.put(`${API_ENDPOINTS.PROVIDER.PROFILE}/password`, data),

  getDistricts: () => axiosClient.get('/reference/districts'),
  getServiceCategories: () => axiosClient.get('/reference/service-categories'),
};
