import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Edit, Trash2, RefreshCw, Search } from 'lucide-react';
import {
  AdminLayout,
  PageHeader,
  StatsCard,
  Card,
  Table,
  Badge,
  Button,
} from '../../components/admin';

const SimplifiedManageFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

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

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/faqs');

      if (response.ok) {
        const data = await response.json();
        setFaqs(data.faqs || []);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
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

      const url = editingFaq
        ? `http://localhost:8000/admin/faqs/${editingFaq.id}`
        : 'http://localhost:8000/admin/faqs';

      const response = await fetch(url, {
        method: editingFaq ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchFAQs();
        setShowModal(false);
        setEditingFaq(null);
        setFormData({ question: '', answer: '', category: '' });
        setValidationErrors({});
        setSubmitError(null);
      } else {
        const error = await response.json();
        console.error('Error saving FAQ:', error);
        setSubmitError(error.detail || 'Failed to save FAQ. Please try again.');
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      setSubmitError('Network error. Please check your connection and try again.');
    }
  };

  const handleDelete = async (faqId) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/admin/faqs/${faqId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchFAQs();
      } else {
        const error = await response.json();
        console.error('Error deleting FAQ:', error);
        alert(`Failed to delete FAQ: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Failed to delete FAQ. Please try again.');
    }
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
    });
    setValidationErrors({});
    setSubmitError(null);
    setShowModal(true);
  };

  const categories = ['All', ...new Set(faqs.map((faq) => faq.category).filter(Boolean))];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || faq.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      <PageHeader
        title="Manage FAQ"
        description="Add, edit, and manage frequently asked questions"
        icon={HelpCircle}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={RefreshCw} onClick={fetchFAQs} disabled={loading}>
              Refresh
            </Button>
            <Button
              icon={Plus}
              onClick={() => {
                setEditingFaq(null);
                setFormData({ question: '', answer: '', category: '' });
                setShowModal(true);
              }}
            >
              Add FAQ
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard title="Total FAQs" value={faqs.length} icon={HelpCircle} color="blue" />
        <StatsCard
          title="Categories"
          value={new Set(faqs.map((f) => f.category)).size}
          icon={HelpCircle}
          color="purple"
        />
        <StatsCard title="Active" value={faqs.length} icon={HelpCircle} color="green" />
      </div>

      {/* Filters & Table */}
      <Card>
        <Card.Content className="pb-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </Card.Content>

        <Card.Content className="pt-0">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading FAQs...</p>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No FAQs found</p>
            </div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Question</Table.Head>
                  <Table.Head>Category</Table.Head>
                  <Table.Head>Answer Preview</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredFaqs.map((faq) => (
                  <Table.Row key={faq.id}>
                    <Table.Cell className="font-medium max-w-xs">{faq.question}</Table.Cell>
                    <Table.Cell>
                      <Badge variant="info">{faq.category}</Badge>
                    </Table.Cell>
                    <Table.Cell className="max-w-md truncate text-gray-600">
                      {faq.answer}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          onClick={() => handleEdit(faq)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDelete(faq.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        />
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card.Content>

        {!loading && filteredFaqs.length > 0 && (
          <Card.Footer>
            <p className="text-sm text-gray-600 text-center">
              Showing {filteredFaqs.length} of {faqs.length} FAQs
            </p>
          </Card.Footer>
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  <p className="text-sm font-medium">{submitError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => {
                    setFormData({ ...formData, question: e.target.value });
                    if (validationErrors.question) {
                      setValidationErrors({ ...validationErrors, question: null });
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.question
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Enter a clear and concise question (min. 10 characters)"
                />
                {validationErrors.question && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.question}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.question.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value });
                    if (validationErrors.category) {
                      setValidationErrors({ ...validationErrors, category: null });
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.category
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="e.g., Account, Support, Security"
                />
                {validationErrors.category && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => {
                    setFormData({ ...formData, answer: e.target.value });
                    if (validationErrors.answer) {
                      setValidationErrors({ ...validationErrors, answer: null });
                    }
                  }}
                  rows={6}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.answer
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
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

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditingFaq(null);
                    setFormData({ question: '', answer: '', category: '' });
                    setValidationErrors({});
                    setSubmitError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingFaq ? 'Update FAQ' : 'Create FAQ'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SimplifiedManageFAQ;
