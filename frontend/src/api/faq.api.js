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
  createFAQ: (data, apiKey) => {
    return api.post('/admin/faqs', data, {
      headers: { 'X-API-Key': apiKey },
    });
  },

  updateFAQ: (faqId, data, apiKey) => {
    return api.put(`/admin/faqs/${faqId}`, data, {
      headers: { 'X-API-Key': apiKey },
    });
  },

  deleteFAQ: (faqId, apiKey) => {
    return api.delete(`/admin/faqs/${faqId}`, {
      headers: { 'X-API-Key': apiKey },
    });
  },
};

export default faqAPI;
