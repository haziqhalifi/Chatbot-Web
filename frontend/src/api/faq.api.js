import api from './client';

// FAQ API endpoints
const faqAPI = {
  // Get all FAQs
  getFAQs: () => {
    return api.get('/faqs');
  },

  // Get specific FAQ by ID
  getFAQ: (faqId) => {
    return api.get(`/faqs/${faqId}`);
  },

  // Admin endpoints (require API key)
  // Note: Authorization header is automatically added by client.js interceptor
  createFAQ: (data, apiKey) => {
    return api.post('/admin/faqs', data);
  },

  updateFAQ: (faqId, data, apiKey) => {
    return api.put(`/admin/faqs/${faqId}`, data);
  },

  deleteFAQ: (faqId, apiKey) => {
    return api.delete(`/admin/faqs/${faqId}`);
  },
};

export default faqAPI;
