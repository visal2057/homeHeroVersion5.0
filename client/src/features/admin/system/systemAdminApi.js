import { axiosClient } from '../../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../../api/apiEndpoints.js';

export function fetchDashboardOverview() {
  return axiosClient.get(API_ENDPOINTS.SYSTEM_ADMIN.DASHBOARD_OVERVIEW);
}

export function fetchBookings(params) {
  return axiosClient.get(API_ENDPOINTS.SYSTEM_ADMIN.BOOKINGS, { params });
}

export function fetchUsers(params) {
  return axiosClient.get(API_ENDPOINTS.SYSTEM_ADMIN.USERS, { params });
}

export function fetchBanRequests() {
  return axiosClient.get(API_ENDPOINTS.SYSTEM_ADMIN.BAN_REQUESTS);
}

export function applyBan(payload) {
  return axiosClient.post(API_ENDPOINTS.SYSTEM_ADMIN.APPLY_BAN, payload);
}

export function removeBan(userBanId) {
  return axiosClient.delete(API_ENDPOINTS.SYSTEM_ADMIN.REMOVE_BAN(userBanId));
}

export async function downloadEarningsReport(year, month) {
  const { data } = await axiosClient.get(API_ENDPOINTS.SYSTEM_ADMIN.EARNINGS_REPORT, {
    params: { year, month },
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `homehero-earnings-${year}-${month}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function fetchSiteImages() {
  return axiosClient.get(API_ENDPOINTS.CONTENT.SITE_IMAGES);
}

export function updateSiteImage(formData) {
  return axiosClient.put(API_ENDPOINTS.CONTENT.SITE_IMAGES, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function fetchAnnouncements(status) {
  return axiosClient.get(API_ENDPOINTS.ANNOUNCEMENTS.LIST, { params: status ? { status } : {} });
}

export function createAnnouncement(payload) {
  return axiosClient.post(API_ENDPOINTS.ANNOUNCEMENTS.CREATE, payload);
}

export function updateAnnouncement(announcementId, payload) {
  return axiosClient.put(API_ENDPOINTS.ANNOUNCEMENTS.UPDATE(announcementId), payload);
}

export function archiveAnnouncement(announcementId) {
  return axiosClient.patch(API_ENDPOINTS.ANNOUNCEMENTS.ARCHIVE(announcementId));
}
