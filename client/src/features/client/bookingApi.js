import { axiosClient } from '../../api/axiosClient.js';

export const bookingApi = {
  createBooking: (formData) =>
    axiosClient.post('/bookings', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyBookings: () => axiosClient.get('/bookings/mine'),
  cancelBooking: (bookingId) => axiosClient.patch(`/bookings/${bookingId}/cancel`),
};
