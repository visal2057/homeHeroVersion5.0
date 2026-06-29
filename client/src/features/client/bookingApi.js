import { axiosClient } from '../../api/axiosClient.js';

export const bookingApi = {
  createBooking: (data) => axiosClient.post('/bookings', data),
  getMyBookings: () => axiosClient.get('/bookings/mine'),
  cancelBooking: (bookingId) => axiosClient.patch(`/bookings/${bookingId}/cancel`),
  reviewBooking: (bookingId, data) => axiosClient.post(`/bookings/${bookingId}/review`, data),
};
