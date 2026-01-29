import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, HelpCircle, Search, Filter } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const ManageFAQ = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // Question validation
    if (!formData.question.trim()) {
      errors.question = 'Question is required';
    } else if (formData.question.trim().length < 10) {
      errors.question = 'Question must be at least 10 characters long';
    } else if (formData.question.trim().length > 500) {
      errors.question = 'Question must not exceed 500 characters';
    }

    // Answer validation
    if (!formData.answer.trim()) {
      errors.answer = 'Answer is required';
    } else if (formData.answer.trim().length < 20) {
      errors.answer = 'Answer must be at least 20 characters long';
    } else if (formData.answer.trim().length > 5000) {
      errors.answer = 'Answer must not exceed 5000 characters';
    }

    // Category validation
    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    } else if (formData.category.trim().length < 3) {
      errors.category = 'Category must be at least 3 characters long';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch FAQs
  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/faqs');

      if (!response.ok) {
        throw new Error(`Failed to fetch FAQs: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(
          'Server returned non-JSON response. Make sure the backend server is running.'
        );
      }

      const data = await response.json();
      setFaqs(data.faqs || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Get unique categories
  const categories = ['All', ...new Set(faqs.map((faq) => faq.category).filter(Boolean))];

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add new FAQ
  const handleAddFAQ = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate form before submission
    if (!validateForm()) {
      setSubmitError('Please fix the validation errors before submitting.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setSubmitError('You must be logged in to manage FAQs. Please log in again.');
        return;
      }

      const response = await fetch('http://localhost:8000/admin/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add FAQ');
      }

      await fetchFAQs();
      setShowAddModal(false);
      setFormData({ question: '', answer: '', category: '' });
      setValidationErrors({});
      setSubmitError(null);
      alert('FAQ added successfully!');
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  // Update FAQ
  const handleUpdateFAQ = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate form before submission
    if (!validateForm()) {
      setSubmitError('Please fix the validation errors before submitting.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setSubmitError('You must be logged in to manage FAQs. Please log in again.');
        return;
      }

      const response = await fetch(`http://localhost:8000/admin/faqs/${selectedFaq.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update FAQ');
      }

      await fetchFAQs();
      setShowEditModal(false);
      setSelectedFaq(null);
      setFormData({ question: '', answer: '', category: '' });
      alert('FAQ updated successfully!');
    } catch (err) {
      alert(`Error updating FAQ: ${err.message}`);
    }
  };

  // Delete FAQ
  const handleDeleteFAQ = async (faqId) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/admin/faqs/${faqId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete FAQ');
      }

      await fetchFAQs();
      alert('FAQ deleted successfully!');
    } catch (err) {
      alert(`Error deleting FAQ: ${err.message}`);
    }
  };

  // Open edit modal
  const openEditModal = (faq) => {
    setSelectedFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
    });
    setValidationErrors({});
    setSubmitError(null);
    setShowEditModal(true);
  };

  // Close modals
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedFaq(null);
    setFormData({ question: '', answer: '', category: '' });
    setValidationErrors({});
    setSubmitError(null);
  };

  return (
    <AdminLayout>
      <div className="bg-gray-50 p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage FAQs</h1>
              <p className="text-gray-600 mt-1">Add, edit, and remove frequently asked questions</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add FAQ
            </button>
          </div>
        </div>

        {/* FAQ List */}
        <div className="max-w-7xl mx-auto">
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search FAQs by question or answer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="relative min-w-[200px]">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'All' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-3 text-sm text-gray-600">
              Showing {filteredFaqs.length} of {faqs.length} FAQs
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">Loading FAQs...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              Error: {error}
            </div>
          ) : faqs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No FAQs found. Add your first FAQ to get started.</p>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No FAQs match your search criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <HelpCircle className="h-5 w-5 text-blue-600 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                        </div>
                        <p className="text-gray-700 ml-7 mb-3">{faq.answer}</p>
                        {faq.category && (
                          <div className="ml-7">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              {faq.category}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => openEditModal(faq)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit FAQ"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFAQ(faq.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete FAQ"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add FAQ Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Add New FAQ</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleAddFAQ} className="p-6">
                {submitError && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    <p className="text-sm font-medium">{submitError}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="question"
                      value={formData.question}
                      onChange={(e) => {
                        handleInputChange(e);
                        if (validationErrors.question) {
                          setValidationErrors({ ...validationErrors, question: null });
                        }
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.question
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-300 focus:border-transparent'
                      }`}
                      placeholder="Enter a clear question (min. 10 characters)"
                    />
                    {validationErrors.question && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.question}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.question.length}/500 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="answer"
                      value={formData.answer}
                      onChange={(e) => {
                        handleInputChange(e);
                        if (validationErrors.answer) {
                          setValidationErrors({ ...validationErrors, answer: null });
                        }
                      }}
                      rows="6"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.answer
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-300 focus:border-transparent'
                      }`}
                      placeholder="Provide a detailed answer (min. 20 characters)"
                    />
                    {validationErrors.answer && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.answer}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.answer.length}/5000 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={(e) => {
                        handleInputChange(e);
                        if (validationErrors.category) {
                          setValidationErrors({ ...validationErrors, category: null });
                        }
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.category
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-300 focus:border-transparent'
                      }`}
                      placeholder="e.g., General, Technical, Support (min. 3 characters)"
                    />
                    {validationErrors.category && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Add FAQ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit FAQ Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Edit FAQ</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleUpdateFAQ} className="p-6">
                {submitError && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    <p className="text-sm font-medium">{submitError}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="question"
                      value={formData.question}
                      onChange={(e) => {
                        handleInputChange(e);
                        if (validationErrors.question) {
                          setValidationErrors({ ...validationErrors, question: null });
                        }
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.question
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-300 focus:border-transparent'
                      }`}
                      placeholder="Enter a clear question (min. 10 characters)"
                    />
                    {validationErrors.question && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.question}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.question.length}/500 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="answer"
                      value={formData.answer}
                      onChange={(e) => {
                        handleInputChange(e);
                        if (validationErrors.answer) {
                          setValidationErrors({ ...validationErrors, answer: null });
                        }
                      }}
                      rows="6"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.answer
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-300 focus:border-transparent'
                      }`}
                      placeholder="Provide a detailed answer (min. 20 characters)"
                    />
                    {validationErrors.answer && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.answer}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.answer.length}/5000 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={(e) => {
                        handleInputChange(e);
                        if (validationErrors.category) {
                          setValidationErrors({ ...validationErrors, category: null });
                        }
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.category
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-300 focus:border-transparent'
                      }`}
                      placeholder="e.g., General, Technical, Support (min. 3 characters)"
                    />
                    {validationErrors.category && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Update FAQ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageFAQ;
