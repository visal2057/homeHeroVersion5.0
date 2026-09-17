import { axiosClient } from '../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../api/apiEndpoints.js';

export const chatApi = {
  getConversations: () => axiosClient.get(API_ENDPOINTS.CHAT.CONVERSATIONS),
  getUnreadCount: () => axiosClient.get(API_ENDPOINTS.CHAT.UNREAD_COUNT),
  getMessages: (bookingId, afterId) =>
    axiosClient.get(API_ENDPOINTS.CHAT.MESSAGES(bookingId), { params: afterId ? { after: afterId } : undefined }),
  sendMessage: (bookingId, text) => axiosClient.post(API_ENDPOINTS.CHAT.MESSAGES(bookingId), { text }),
  markRead: (bookingId) => axiosClient.patch(API_ENDPOINTS.CHAT.MARK_READ(bookingId)),
  getJobDetails: (bookingId) => axiosClient.get(API_ENDPOINTS.CHAT.JOB_DETAILS(bookingId)),
};
