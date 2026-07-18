import { axiosClient } from '../../api/axiosClient.js';
import { API_ENDPOINTS } from '../../api/apiEndpoints.js';

export const bookingApi = {
  createBooking: (formData) =>
    axiosClient.post('/bookings', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyBookings: () => axiosClient.get('/bookings/mine'),
  cancelBooking: (bookingId) => axiosClient.patch(`/bookings/${bookingId}/cancel`),
  // Reuses the same invoice-download endpoint the Service Provider and System
  // Admin (SP Tracking) already use; the backend checks the client actually
  // owns the underlying booking.
  downloadInvoice: async (bookingId) => {
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
