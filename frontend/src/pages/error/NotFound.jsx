import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* 404 Number */}
          <div className="mb-6">
            <h1 className="text-8xl font-bold text-blue-600 mb-2">404</h1>
            <div className="flex justify-center">
              <div className="bg-blue-100 rounded-full p-4">
                <FileQuestion className="h-12 w-12 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>

          {/* Message */}
          <p className="text-gray-600 mb-2">Sorry, we couldn't find the page you're looking for.</p>
          <p className="text-gray-500 text-sm mb-8">
            The page you are trying to access may have been moved, deleted, or never existed.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <Home className="h-5 w-5 mr-2" />
              Go to Dashboard
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </button>
          </div>

          {/* Helpful Links */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">You might be looking for:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => navigate('/report-disaster')}
                className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
              >
                Report Disaster
              </button>
              <button
                onClick={() => navigate('/emergency-support')}
                className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
              >
                Emergency Support
              </button>
              <button
                onClick={() => navigate('/help-faq')}
                className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
              >
                Help & FAQ
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-300 text-sm">Error Code: 404 - Not Found</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
