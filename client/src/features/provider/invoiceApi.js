import { axiosClient } from '../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../api/apiEndpoints.js';

export function getInvoiceForm(bookingId) {
  return axiosClient.get(API_ENDPOINTS.INVOICES.FORM(bookingId));
}

export function generateInvoice(bookingId, payload) {
  return axiosClient.post(API_ENDPOINTS.INVOICES.GENERATE(bookingId), payload);
}

export async function downloadInvoice(bookingId) {
  const response = await axiosClient.get(API_ENDPOINTS.INVOICES.DOWNLOAD(bookingId), {
    responseType: 'blob',
  });

  const blobUrl = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `invoice-${bookingId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}
