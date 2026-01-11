import React, { useState } from 'react';
import Header from '../../components/common/Header';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import Dropdown from '../../components/ui/Dropdown';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const initialForm = {
  title: '',
  location: '',
  disaster_type: '',
  description: '',
};

const disasterTypes = [
  { value: '', label: 'Select type' },
  { value: 'Flood', label: 'Flood' },
  { value: 'Landslide', label: 'Landslide' },
  { value: 'Earthquake', label: 'Earthquake' },
  { value: 'Fire', label: 'Fire' },
  { value: 'Storm', label: 'Storm' },
  { value: 'Other', label: 'Other' },
];

const ReportDisaster = ({ onClose }) => {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, token } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (option) => {
    setForm((prev) => ({ ...prev, disaster_type: option.value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('You must be logged in to submit a report. Please sign in first.');
      return;
    }

    // Validation
    if (!form.title.trim()) {
      setError('Please enter a title for the report.');
      return;
    }
    if (!form.location.trim()) {
      setError('Please enter the location of the disaster.');
      return;
    }
    if (!form.disaster_type) {
      setError('Please select a disaster type.');
      return;
    }
    if (!form.description.trim()) {
      setError('Please provide a description of the disaster.');
      return;
    }
    if (form.description.length < 20) {
      setError('Please provide a more detailed description (at least 20 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      await api.post(
        '/report',
        {
          title: form.title,
          location: form.location,
          disaster_type: form.disaster_type,
          description: form.description,
          timestamp: new Date().toISOString(),
        },
        {
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      setSubmitted(true);
      setForm(initialForm);
      setError('');
    } catch (error) {
      console.error('Report submission error:', error);

      let errorMessage = 'Failed to submit report. Please try again.';

      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Please check your internet connection and try again.';
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please check your internet connection.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Session expired. Please sign in again.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.detail || 'Invalid report data.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[400px] max-w-2xl w-full mx-4 border border-gray-100 relative">
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
        onClick={onClose}
        aria-label="Close report disaster modal"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <h2 className="text-2xl font-bold text-[#0a4974] mb-6 text-center">Report a Disaster</h2>
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
          <svg
            className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError('')}
            className="text-red-400 hover:text-red-600 ml-2"
            aria-label="Dismiss error"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="rounded-full bg-green-100 p-3">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-green-800 font-bold text-lg mb-2">Report Submitted Successfully!</h3>
          <p className="text-green-700 text-sm mb-4">
            Thank you for your report. Our emergency response team will review and respond as
            needed.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setSubmitted(false)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
            >
              Submit Another Report
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}{' '}
      {!submitted && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#2c2c2c] mb-2 flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-[#0a4974]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              Title
            </label>
            <InputField
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter a title for the report"
              required
            />
          </div>{' '}
          <div>
            <label className="block text-sm font-semibold text-[#2c2c2c] mb-2 flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-[#0a4974]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Location
            </label>
            <InputField
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="E.g. Bandar Kinrara, Selangor"
              required
            />
          </div>{' '}
          <div>
            <label className="block text-sm font-semibold text-[#2c2c2c] mb-2 flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-[#0a4974]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Disaster Type
            </label>
            <Dropdown
              options={disasterTypes}
              selectedOption={disasterTypes.find((d) => d.value === form.disaster_type)}
              onSelect={handleTypeSelect}
              placeholder="Select disaster type"
              required
            />
          </div>{' '}
          <div>
            <label className="block text-sm font-semibold text-[#2c2c2c] mb-2 flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-[#0a4974]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the disaster situation in detail..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a4974] focus:border-transparent bg-white text-sm transition-all duration-200 hover:border-gray-400"
            />
          </div>{' '}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0a4974] hover:bg-[#083d5a] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Submit Report
                </>
              )}{' '}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReportDisaster;
