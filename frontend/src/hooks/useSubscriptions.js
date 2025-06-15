import { useState, useEffect, useCallback } from 'react';
import { subscriptionAPI } from '../api';

export const useSubscriptions = () => {
  const [subscription, setSubscription] = useState(null);
  const [disasterTypes, setDisasterTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's subscription preferences
  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionAPI.getSubscription();
      setSubscription(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch subscription preferences');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch available disaster types
  const fetchDisasterTypes = useCallback(async () => {
    try {
      const response = await subscriptionAPI.getDisasterTypes();
      setDisasterTypes(response.data.disaster_types);
    } catch (err) {
      console.error('Failed to fetch disaster types:', err);
    }
  }, []);

  // Fetch available locations
  const fetchLocations = useCallback(async () => {
    try {
      const response = await subscriptionAPI.getLocations();
      setLocations(response.data.locations);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  }, []);

  // Update subscription
  const updateSubscription = useCallback(async (subscriptionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionAPI.updateSubscription(subscriptionData);
      setSubscription({
        ...subscriptionData,
        id: response.data.subscription_id,
        user_id: response.data.user_id,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete subscription
  const deleteSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await subscriptionAPI.deleteSubscription();
      setSubscription({
        id: null,
        disaster_types: [],
        locations: [],
        notification_methods: ['web'],
        radius_km: 10,
        is_active: false,
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user is subscribed to a specific disaster type
  const isSubscribedToType = useCallback(
    (disasterType) => {
      if (!subscription?.disaster_types?.length) return false;
      return subscription.disaster_types.some(
        (type) => type.toLowerCase() === disasterType.toLowerCase()
      );
    },
    [subscription]
  );

  // Check if user is subscribed to a specific location
  const isSubscribedToLocation = useCallback(
    (location) => {
      if (!subscription?.locations?.length) return false;
      return subscription.locations.some(
        (loc) =>
          loc.toLowerCase().includes(location.toLowerCase()) ||
          location.toLowerCase().includes(loc.toLowerCase())
      );
    },
    [subscription]
  );

  // Initial load
  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchSubscription();
      fetchDisasterTypes();
      fetchLocations();
    }
  }, [fetchSubscription, fetchDisasterTypes, fetchLocations]);

  return {
    subscription,
    disasterTypes,
    locations,
    loading,
    error,
    fetchSubscription,
    updateSubscription,
    deleteSubscription,
    isSubscribedToType,
    isSubscribedToLocation,
    clearError: () => setError(null),
  };
};
