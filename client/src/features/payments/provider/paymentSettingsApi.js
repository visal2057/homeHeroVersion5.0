import { axiosClient } from '../../../api/axiosClient.js';

// The two calls the provider's payment-settings form needs.
export const paymentSettingsApi = {
  // Load the provider's saved payee details (or null if not set up yet).
  get: () => axiosClient.get('/payment-settings'),

  // Create or update the details. PUT because saving is idempotent:
  // sending the same data twice leaves one row, not two.
  save: (settings) => axiosClient.put('/payment-settings', settings),
};
