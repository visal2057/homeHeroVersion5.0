import { axiosClient } from '../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../api/apiEndpoints.js';

export function registerClient(payload) {
  return axiosClient.post(API_ENDPOINTS.AUTH.REGISTER_CLIENT, payload);
}

export function forgotPassword(email) {
  return axiosClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
}

export function resetPassword(payload) {
  return axiosClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload);
}

export function fetchRegistrationReference() {
  return axiosClient.get(API_ENDPOINTS.REGISTRATION.REFERENCE);
}

export function registerProvider(formData) {
  return axiosClient.post(API_ENDPOINTS.REGISTRATION.PROVIDER, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
