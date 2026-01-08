import React, { useState } from 'react';

const ProfilePictureCard = ({ profilePicture, emailVerified }) => {
  const [showFallback, setShowFallback] = useState(false);

  const shouldShowFallback = showFallback || !profilePicture;

  return (
    <div className="mb-8 text-center">
      {!shouldShowFallback ? (
        <div>
          <img
            src={profilePicture}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-[#0a4974] border-opacity-20 object-cover shadow-lg"
            onError={() => setShowFallback(true)}
          />
          <div className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-gray-300 bg-gray-100 flex items-center justify-center text-gray-400 text-2xl shadow-lg" />
          <p className="text-sm text-gray-600 font-medium">Profile Picture</p>
        </div>
      ) : (
        <div>
          <div className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-2xl shadow-lg">
            👤
          </div>
          <p className="text-sm text-gray-500 font-medium">No Profile Picture</p>
        </div>
      )}
      {emailVerified && (
        <div className="mt-2 inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Email Verified
        </div>
      )}
    </div>
  );
};

export default ProfilePictureCard;
