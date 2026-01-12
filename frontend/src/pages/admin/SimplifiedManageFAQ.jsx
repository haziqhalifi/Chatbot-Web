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

  useEffect(() => {
    fetchFAQs();
  }, []);

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

    try {
      const url = editingFaq
        ? `http://localhost:8000/admin/faqs/${editingFaq.id}`
        : 'http://localhost:8000/admin/faqs';

      const response = await fetch(url, {
        method: editingFaq ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'secretkey',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchFAQs();
        setShowModal(false);
        setEditingFaq(null);
        setFormData({ question: '', answer: '', category: '' });
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  const handleDelete = async (faqId) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const response = await fetch(`http://localhost:8000/admin/faqs/${faqId}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': 'secretkey' },
      });

      if (response.ok) {
        await fetchFAQs();
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
    });
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditingFaq(null);
                    setFormData({ question: '', answer: '', category: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingFaq ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SimplifiedManageFAQ;
