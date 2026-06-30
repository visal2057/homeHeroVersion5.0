import { axiosClient } from '../../../api/axiosClient.js';

// All the HTTP calls the Client payment + review screens need.
// Each function just sends a request and returns the axios promise;
// the React pages decide what to do with the result.
export const clientPaymentApi = {
  // Load everything the payment page shows for one booking:
  // provider name, service category, agreed amount and the provider's
  // payee bank details (used for the card form).
  getPaymentContext: (bookingId) =>
    axiosClient.get(`/payments/booking/${bookingId}`),

  // Cash flow: the client pays the provider directly.
  // HomeHero only records that it happened, with zero commission.
  confirmCashPayment: (bookingId) =>
    axiosClient.post('/payments/cash', { bookingId }),

  // Card flow: HomeHero processes the card and keeps the 5% platform fee.
  // The backend re-calculates the fee, so we only send the raw card input.
  payByCard: (bookingId, cardDetails) =>
    axiosClient.post('/payments/card', { bookingId, ...cardDetails }),

  // Review is submitted right after a successful payment.
  // Submitting it is what finally marks the booking as Completed.
  submitReview: (bookingId, review) =>
    axiosClient.post('/reviews', { bookingId, ...review }),
};
