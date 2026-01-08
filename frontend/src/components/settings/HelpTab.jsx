import React from 'react';

const HelpTab = ({ navigate }) => {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-gray-700 font-medium">Help Center / FAQ</span>
        <a
          href="/help-faq"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Open
        </a>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-gray-700 font-medium">Submit Feedback</span>
        <button className="text-blue-600 hover:underline" onClick={() => navigate('/report')}>
          Submit
        </button>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-gray-700 font-medium">Contact Support</span>
        <button className="text-blue-600 hover:underline" onClick={() => navigate('/report')}>
          Contact
        </button>
      </div>
    </div>
  );
};

export default HelpTab;
