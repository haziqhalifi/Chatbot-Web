import React, { useState } from 'react';

const UserAvatar = ({ userProfile }) => {
  const [imageError, setImageError] = useState(false);

  if (userProfile?.profile_picture && !imageError) {
    return (
      <img
        src={userProfile.profile_picture}
        alt="User Avatar"
        className="w-8 h-8 rounded-full object-cover bg-[#0a4974] ring-2 ring-white shadow-sm"
        onError={() => {
          console.log('User profile picture failed to load, using fallback');
          setImageError(true);
        }}
      />
    );
  }

  // Fallback to user initials
  if (userProfile?.name) {
    const initials = userProfile.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return (
      <div className="w-8 h-8 rounded-full bg-[#0a4974] flex items-center justify-center text-white font-semibold text-xs ring-2 ring-white shadow-sm">
        {initials}
      </div>
    );
  }

  // Ultimate fallback - default profile image
  return (
    <>
      <img
        src="/images/profile.JPG"
        alt="User Avatar"
        className="w-8 h-8 rounded-full object-cover bg-[#0a4974] ring-2 ring-white shadow-sm"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div
        className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold text-xs"
        style={{ display: 'none' }}
      >
        👤
      </div>
    </>
  );
};

export default UserAvatar;
