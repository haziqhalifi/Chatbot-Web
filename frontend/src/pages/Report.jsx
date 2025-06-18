import React, { useState } from 'react';
import { X } from 'lucide-react';

const ReportPage = ({ onClose }) => {
  const [form, setForm] = useState({ subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/system-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: form.subject,
          message: form.message,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        // Reset form
        setForm({ subject: '', message: '' });
        // Auto-close after 2 seconds
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to submit report');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-8 max-w-lg w-full border-2 border-blue-200 relative">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
          aria-label="Close report modal"
        >
          <X className="w-6 h-6" />
        </button>
      )}
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Report an Issue</h1>
      <p className="text-gray-700 mb-6">Found a bug or have feedback? Let us know below.</p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {submitted ? (
        <div className="text-center">
          <div className="text-green-600 font-semibold mb-2">✓ Thank you for your report!</div>
          <p className="text-gray-600 text-sm">
            Your report has been saved and we'll review it soon.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief subject"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the issue or feedback"
            />
          </div>{' '}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ReportPage;
