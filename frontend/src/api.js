/**
 * @deprecated This file is deprecated. Import from './api' instead.
 * This file is kept for backward compatibility during the transition.
 *
 * Old: import api, { notificationAPI } from '../api';
 * New: import api, { notificationAPI } from '../api';
 *
 * The new structure organizes APIs by domain in ./api/ folder
 */

// Re-export everything from the new API structure (import directly to avoid circular refs)
import apiClient from './api/client';
import notificationAPI from './api/notification.api';
import adminNotificationAPI from './api/admin.api';
import subscriptionAPI from './api/subscription.api';
import faqAPI from './api/faq.api';
import chatAPI from './api/chat.api';
import authAPI from './api/auth.api';
import profileAPI from './api/profile.api';

export { notificationAPI };
export { adminNotificationAPI };
export { subscriptionAPI };
export { faqAPI };
export { chatAPI };
export { authAPI };
export { profileAPI };

// Export the default axios client
export default apiClient;
