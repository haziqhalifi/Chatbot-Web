import React from 'react';

const ProfileAvatar = ({ userProfile }) => {
  const [imageError, setImageError] = React.useState(false);

  if (userProfile?.profile_picture && !imageError) {
    return (
      <img
        src={userProfile.profile_picture}
        alt="User Profile"
        className="w-[50px] h-[50px] rounded-full object-cover border-2 border-gray-300"
        onError={() => {
          console.log('Profile picture failed to load, using fallback');
          setImageError(true);
        }}
      />
    );
  }

  // Fallback to user initials if available
  if (userProfile?.name) {
    const initials = userProfile.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return (
      <div className="w-[50px] h-[50px] rounded-full bg-[#0a4974] flex items-center justify-center text-white font-semibold text-lg border-2 border-gray-300">
        {initials}
      </div>
    );
  }

  // Ultimate fallback - default profile image
  return (
    <img
      src="/images/profile.JPG"
      alt="User Profile"
      className="w-[50px] h-[50px] rounded-full object-cover border-2 border-gray-300"
      onError={(e) => {
        // If even the default image fails, show a generic avatar
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
  );
};

export default ProfileAvatar;
