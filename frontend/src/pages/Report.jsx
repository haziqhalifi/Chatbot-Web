import React, { useState } from 'react';
import { X } from 'lucide-react';

const ReportPage = ({ onClose }) => {
  const [form, setForm] = useState({ subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you would send the report to your backend
    // After 2 seconds, close the modal
    setTimeout(() => {
      if (onClose) onClose();
    }, 2000);
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
        {submitted ? (
          <div className="text-green-600 font-semibold">Thank you for your report!</div>
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
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Submit Report
            </button>
          </form>        )}
      </div>
  );
};

export default ReportPage;
