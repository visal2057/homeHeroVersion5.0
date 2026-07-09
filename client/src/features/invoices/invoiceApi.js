import { axiosClient } from '../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../api/apiEndpoints.js';

export const invoiceApi = {
  listMine: () => axiosClient.get(API_ENDPOINTS.INVOICES.MINE),
  getStatus: (bookingId) => axiosClient.get(API_ENDPOINTS.INVOICES.STATUS(bookingId)),
  generate: (bookingId, cashAmount) =>
    axiosClient.post(API_ENDPOINTS.INVOICES.GENERATE(bookingId), { cashAmount }),
  download: (bookingId) =>
    axiosClient.get(API_ENDPOINTS.INVOICES.DOWNLOAD(bookingId), { responseType: 'blob' }),
};
