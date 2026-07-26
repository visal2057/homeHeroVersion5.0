import { axiosClient } from '../../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../../api/apiEndpoints.js';

export function fetchPendingApplications() {
  return axiosClient.get(API_ENDPOINTS.VERIFICATION_ADMIN.APPLICATIONS);
}

export function fetchApplicationHistory() {
  return axiosClient.get(API_ENDPOINTS.VERIFICATION_ADMIN.APPLICATIONS_HISTORY);
}

export function fetchApplicationDetail(applicationId) {
  return axiosClient.get(API_ENDPOINTS.VERIFICATION_ADMIN.APPLICATION_DETAIL(applicationId));
}

export async function fetchDocumentObjectUrl(documentId) {
  const { data } = await axiosClient.get(API_ENDPOINTS.VERIFICATION_ADMIN.DOCUMENT(documentId), { responseType: 'blob' });
  return URL.createObjectURL(data);
}

export function approveApplication(applicationId) {
  return axiosClient.post(API_ENDPOINTS.VERIFICATION_ADMIN.APPROVE(applicationId));
}

export function rejectApplication(applicationId, reason) {
  return axiosClient.post(API_ENDPOINTS.VERIFICATION_ADMIN.REJECT(applicationId), { reason });
}

export function fetchComplaints() {
  return axiosClient.get(API_ENDPOINTS.VERIFICATION_ADMIN.COMPLAINTS);
}

export function fetchComplaintsHistory() {
  return axiosClient.get(API_ENDPOINTS.VERIFICATION_ADMIN.COMPLAINTS_HISTORY);
}

export function fetchComplaintDetail(complaintId) {
  return axiosClient.get(API_ENDPOINTS.VERIFICATION_ADMIN.COMPLAINT_DETAIL(complaintId));
}

export function submitComplaintVerdict(complaintId, payload) {
  return axiosClient.post(API_ENDPOINTS.VERIFICATION_ADMIN.COMPLAINT_VERDICT(complaintId), payload);
}
