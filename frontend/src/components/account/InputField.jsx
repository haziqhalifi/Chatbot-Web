import React from 'react';

const InputField = ({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  placeholder,
  rightContent,
}) => {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <div className="flex items-center">
        <input
          type={type}
          className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a4974] focus:border-transparent transition-all duration-200 ${
            disabled ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
          }`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
        {rightContent && <div className="ml-3 flex items-center">{rightContent}</div>}
      </div>
    </div>
  );
};

export default InputField;
