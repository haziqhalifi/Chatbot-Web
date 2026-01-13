import React, { useState } from 'react';
import api from '../../api';

/**
 * ReportIssueModal Component
 * Allows users to report issues with chatbot responses
 */
const ReportIssueModal = ({ onClose, message }) => {
  const [subject] = useState('Chat Response Report');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please describe the issue');
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare the full message including bot response context
      const fullMessage = `
Issue with chatbot response:

Bot Response:
"${message.text}"

Timestamp: ${message.timestamp}

User Description:
${description}
      `.trim();

      await api.post('/system-report', {
        subject: subject,
        message: fullMessage,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to submit report:', err);
      setError(err.response?.data?.detail || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white shadow-2xl rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none transition-colors"
          aria-label="Close"
        >
          ×
        </button>

        {/* Header */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Report an Issue</h2>

        {success ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-5xl mb-3">✓</div>
            <p className="text-green-700 font-medium">Report submitted successfully!</p>
            <p className="text-gray-600 text-sm mt-2">Thank you for your feedback.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Bot response preview */}
            <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Reporting issue with:</p>
              <p className="text-sm text-gray-700 line-clamp-3">{message.text}</p>
            </div>

            {/* Subject (read-only) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <input
                type="text"
                value={subject}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What's wrong with this response? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please explain what's wrong with this response..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportIssueModal;
