import React, { useState, useEffect } from 'react';
import { faqAPI } from '../api';

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

    // Convert newlines to proper JSX elements
    const lines = answer.split('\n');
    const result = [];
    let currentList = [];

    lines.forEach((line, index) => {
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        // This is a bullet point
        currentList.push(
          <li key={`li-${index}`} className="ml-4 list-disc">
            {line.replace(/^[•-]\s*/, '').trim()}
          </li>
        );
      } else {
        // If we have accumulated list items, add them as a ul
        if (currentList.length > 0) {
          result.push(
            <ul key={`ul-${index}`} className="mb-2">
              {currentList}
            </ul>
          );
          currentList = [];
        }

        // Add regular line
        if (line.trim()) {
          result.push(
            <p key={`p-${index}`} className="mb-2">
              {line.trim()}
            </p>
          );
        }
      }
    });

    // Add any remaining list items
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg border-2 border-blue-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">Help & FAQ</h1>
            <p className="text-blue-100">Find answers to common questions and get support.</p>
          </div>

          <div className="p-6">
            {faqs.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📝</div>
                <p className="text-gray-500">No FAQs available at the moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-700 text-lg">{faq.question}</h3>
                        {faq.category && (
                          <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                            {faq.category}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <svg
                          className={`w-5 h-5 text-blue-600 transform transition-transform ${
                            expandedFAQ === faq.id ? 'rotate-180' : ''
                          }`}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
