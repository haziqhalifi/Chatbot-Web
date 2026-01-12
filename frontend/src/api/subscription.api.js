import api from './client';

// Subscription API endpoints
const subscriptionAPI = {
  // Get user's subscription preferences
  getSubscription: () => {
    return api.get('/subscriptions');
  },

  // Create or update subscription
  updateSubscription: (data) => {
    return api.post('/subscriptions', data);
  },

  // Delete subscription
  deleteSubscription: () => {
    return api.delete('/subscriptions');
  },

  // Get available disaster types
  getDisasterTypes: () => {
    return api.get('/subscriptions/disaster-types');
  },

  // Get popular locations
  getLocations: () => {
    return api.get('/subscriptions/locations');
  },
};

export default subscriptionAPI;
