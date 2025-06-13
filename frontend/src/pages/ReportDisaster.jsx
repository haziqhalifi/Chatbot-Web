import React, { useState } from 'react';
import Header from '../components/common/Header';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import Dropdown from '../components/ui/Dropdown';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

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
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (option) => {
    setForm((prev) => ({ ...prev, disaster_type: option.value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/report', {
        user_id: user?.id || 1, // Use authenticated user's ID or fallback to 1
        title: form.title,
        location: form.location,
        disaster_type: form.disaster_type,
        description: form.description,
        timestamp: new Date().toISOString(),
      });
      setSubmitted(true);
      setForm(initialForm);
    } catch (error) {
      alert('Failed to submit report. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className="bg-white rounded-[22px] shadow-lg w-full max-w-lg p-8 border border-gray-200 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-[#0a4974] mb-6 text-center">Report a Disaster</h2>
        {submitted && (
          <div className="text-green-600 mb-4 text-center font-medium">
            Thank you for your report!
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#2c2c2c] mb-1">Title</label>
            <InputField
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter a title for the report"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2c2c2c] mb-1">Location</label>
            <InputField
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="E.g. Bandar Kinrara"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2c2c2c] mb-1">Disaster Type</label>
            <Dropdown
              options={disasterTypes}
              selectedOption={disasterTypes.find((d) => d.value === form.disaster_type)}
              onSelect={handleTypeSelect}
              placeholder="Select type"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2c2c2c] mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the disaster..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            />
          </div>
          <div className="flex justify-center pt-2">
            <Button type="submit" size="large" className="w-full">
              Submit Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportDisaster;
