// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
};

// Predefined notification templates for disaster management
export const DISASTER_NOTIFICATIONS = {
  FLOOD_WARNING: {
    title: 'Flood Warning',
    type: NOTIFICATION_TYPES.WARNING,
  },
  EVACUATION_NOTICE: {
    title: 'Evacuation Notice',
    type: NOTIFICATION_TYPES.DANGER,
  },
  WEATHER_UPDATE: {
    title: 'Weather Update',
    type: NOTIFICATION_TYPES.INFO,
  },
  EMERGENCY_ALERT: {
    title: 'Emergency Alert',
    type: NOTIFICATION_TYPES.DANGER,
  },
  SHELTER_AVAILABLE: {
    title: 'Emergency Shelter Available',
    type: NOTIFICATION_TYPES.INFO,
  },
  ALL_CLEAR: {
    title: 'All Clear',
    type: NOTIFICATION_TYPES.SUCCESS,
  },
};

class NotificationService {
  constructor() {
    this.listeners = [];
  }

  // Add a listener for new notifications
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
    };
  }

  // Emit a notification to all listeners
  emit(notification) {
    this.listeners.forEach((callback) => callback(notification));
  }

  // Helper methods for different types of notifications
  showInfo(title, message) {
    this.emit({
      title,
      message,
      type: NOTIFICATION_TYPES.INFO,
    });
  }

  showSuccess(title, message) {
    this.emit({
      title,
      message,
      type: NOTIFICATION_TYPES.SUCCESS,
    });
  }

  showWarning(title, message) {
    this.emit({
      title,
      message,
      type: NOTIFICATION_TYPES.WARNING,
    });
  }

  showDanger(title, message) {
    this.emit({
      title,
      message,
      type: NOTIFICATION_TYPES.DANGER,
    });
  }

  // Disaster-specific notification methods
  showFloodWarning(message, location = '') {
    this.emit({
      ...DISASTER_NOTIFICATIONS.FLOOD_WARNING,
      message: `${message}${location ? ` Location: ${location}` : ''}`,
    });
  }

  showEvacuationNotice(message, location = '') {
    this.emit({
      ...DISASTER_NOTIFICATIONS.EVACUATION_NOTICE,
      message: `${message}${location ? ` Location: ${location}` : ''}`,
    });
  }

  showWeatherUpdate(message) {
    this.emit({
      ...DISASTER_NOTIFICATIONS.WEATHER_UPDATE,
      message,
    });
  }

  showEmergencyAlert(message) {
    this.emit({
      ...DISASTER_NOTIFICATIONS.EMERGENCY_ALERT,
      message,
    });
  }

  showShelterAvailable(message, location = '') {
    this.emit({
      ...DISASTER_NOTIFICATIONS.SHELTER_AVAILABLE,
      message: `${message}${location ? ` Location: ${location}` : ''}`,
    });
  }

  showAllClear(message) {
    this.emit({
      ...DISASTER_NOTIFICATIONS.ALL_CLEAR,
      message,
    });
  }
}

// Create a singleton instance
export const notificationService = new NotificationService();

// React hook to use the notification service
export const useNotificationService = () => {
  return notificationService;
};
