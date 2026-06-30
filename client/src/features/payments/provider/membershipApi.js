import { axiosClient } from '../../../api/axiosClient.js';

// HTTP calls for the provider's membership (subscription) screen.
export const membershipApi = {
  // Current membership + next price + payment history, all in one call.
  getOverview: () => axiosClient.get('/memberships/me'),

  // Buy or renew the membership by card (built in the next slice).
  purchase: (cardDetails) => axiosClient.post('/memberships/purchase', cardDetails),
};
