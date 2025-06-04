import React from 'react';

const HelpFAQPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-2xl w-full border-2 border-blue-200">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Help & FAQ</h1>
        <p className="text-gray-700 mb-6">Find answers to common questions and get support.</p>
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold text-blue-600">How do I reset my password?</h2>
            <p className="text-gray-600 text-sm">
              Go to the account page and click on 'Change Password'.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-blue-600">How do I contact support?</h2>
            <p className="text-gray-600 text-sm">
              Use the 'Contact us' button at the bottom of the sign up page or email
              support@disasterwatch.com.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-blue-600">Is my data secure?</h2>
            <p className="text-gray-600 text-sm">
              Yes, we use industry-standard security practices to protect your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpFAQPage;
