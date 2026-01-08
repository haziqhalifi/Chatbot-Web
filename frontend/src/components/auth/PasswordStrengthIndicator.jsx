import React from 'react';

const PasswordStrengthIndicator = ({ password }) => {
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, text: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 20;
    if (/[@$!%*?&]/.test(password)) strength += 20;

    let text = '';
    let color = '';
    if (strength <= 40) {
      text = 'Weak';
      color = 'bg-red-500';
    } else if (strength <= 60) {
      text = 'Fair';
      color = 'bg-yellow-500';
    } else if (strength <= 80) {
      text = 'Good';
      color = 'bg-blue-500';
    } else {
      text = 'Strong';
      color = 'bg-green-500';
    }

    return { strength, text, color };
  };

  const passwordStrength = getPasswordStrength();

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-600">Password strength:</span>
        <span
          className={`font-medium ${
            passwordStrength.strength <= 40
              ? 'text-red-600'
              : passwordStrength.strength <= 60
                ? 'text-yellow-600'
                : passwordStrength.strength <= 80
                  ? 'text-blue-600'
                  : 'text-green-600'
          }`}
        >
          {passwordStrength.text}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
          style={{ width: `${passwordStrength.strength}%` }}
        ></div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
