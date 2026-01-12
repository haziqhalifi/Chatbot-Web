// Main API module - Re-exports all API endpoints for backward compatibility
import apiClient from './client';
import notificationAPI from './notification.api';
import adminNotificationAPI from './admin.api';
import subscriptionAPI from './subscription.api';
import faqAPI from './faq.api';
import chatAPI from './chat.api';
import authAPI from './auth.api';
import profileAPI from './profile.api';

// Export all API objects
export { notificationAPI };
export { adminNotificationAPI };
export { subscriptionAPI };
export { faqAPI };
export { chatAPI };
export { authAPI };
export { profileAPI };

// Export default axios instance for backward compatibility
export default apiClient;
