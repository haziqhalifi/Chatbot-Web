import React from 'react';

const ReportModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative bg-white shadow-xl rounded-lg p-8 max-w-lg w-full border-2 border-blue-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Report</h1>
        <p className="text-gray-700 mb-2">Report an issue or provide feedback.</p>
        {/* Add your report form or content here */}
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Your Message</label>
            <textarea
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              rows={4}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
