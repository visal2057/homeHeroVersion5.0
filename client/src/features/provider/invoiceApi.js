import { axiosClient } from '../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../api/apiEndpoints.js';

export const invoiceApi = {
  getForm: (bookingId) => axiosClient.get(API_ENDPOINTS.PROVIDER.INVOICE_FORM(bookingId)),
  generate: (bookingId, payload) => axiosClient.post(API_ENDPOINTS.PROVIDER.INVOICE_GENERATE(bookingId), payload),
  download: async (bookingId) => {
    const response = await axiosClient.get(API_ENDPOINTS.PROVIDER.INVOICE_DOWNLOAD(bookingId), {
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
  },
};
