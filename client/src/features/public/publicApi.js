import { axiosClient } from '../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../api/apiEndpoints.js';

export function submitContactMessage(payload) {
  return axiosClient.post(API_ENDPOINTS.CONTACT, payload);
}
