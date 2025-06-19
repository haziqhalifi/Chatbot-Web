import React, { useState, useEffect } from 'react';
import { faqAPI } from '../api';

const groupFaqsByCategory = (faqs) => {
  const grouped = {};
  faqs.forEach((faq) => {
    const cat = faq.category || 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(faq);
  });
  return grouped;
};

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await faqAPI.getFAQs();
      setFaqs(response.data.faqs || []);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Failed to load FAQs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const formatAnswer = (answer) => {
    if (!answer) return '';
    const lines = answer.split('\n');
    const result = [];
    let currentList = [];
    lines.forEach((line, index) => {
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        currentList.push(
          <li key={`li-${index}`} className="ml-4 list-disc">
            {line.replace(/^[•-]\s*/, '').trim()}
          </li>
        );
      } else {
        if (currentList.length > 0) {
          result.push(
            <ul key={`ul-${index}`} className="mb-2">
              {currentList}
            </ul>
          );
          currentList = [];
        }
        if (line.trim()) {
          result.push(
            <p key={`p-${index}`} className="mb-2">
              {line.trim()}
            </p>
          );
        }
      }
    });
    if (currentList.length > 0) {
      result.push(
        <ul key="ul-final" className="mb-2">
          {currentList}
        </ul>
      );
    }
    return result;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="bg-white shadow-xl rounded-lg p-8 max-w-2xl w-full border-2 border-red-200">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-4 text-red-700">Error Loading FAQs</h1>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={fetchFAQs}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Group FAQs by category
  const groupedFaqs = groupFaqsByCategory(faqs);
  const categoryOrder = Object.keys(groupedFaqs).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-2xl rounded-xl border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <h1 className="text-3xl font-bold mb-2 text-center">Help & FAQ</h1>
            <p className="text-blue-100 text-center">
              Find answers to common questions and get support.
            </p>
          </div>
          <div className="p-8 space-y-8">
            {faqs.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📝</div>
                <p className="text-gray-500">No FAQs available at the moment.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {categoryOrder.map((category) => (
                  <div
                    key={category}
                    className="border-l-4 border-blue-200 pl-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6"
                  >
                    <h2 className="text-xl font-bold text-[#0a4974] mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {category}
                    </h2>
                    <div className="space-y-3">
                      {groupedFaqs[category].map((faq) => (
                        <div
                          key={faq.id}
                          className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
                        >
                          <button
                            onClick={() => toggleFAQ(faq.id)}
                            className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
                          >
                            <div className="flex-1">
                              <h3 className="font-semibold text-blue-700 text-lg">
                                {faq.question}
                              </h3>
                            </div>
                            <div className="ml-4">
                              <svg
                                className={`w-5 h-5 text-blue-600 transform transition-transform ${expandedFAQ === faq.id ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </button>
                          {expandedFAQ === faq.id && (
                            <div className="p-4 bg-white border-t border-gray-200">
                              <div className="text-gray-700 leading-relaxed">
                                {formatAnswer(faq.answer)}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
