import React from 'react';

const SelectField = ({ label, value, onChange, options, disabled = false }) => {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <select
        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a4974] focus:border-transparent transition-all duration-200 ${
          disabled ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
        }`}
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
