import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const Dropdown = ({
  options = [],
  selectedOption,
  onSelect,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const baseClasses = 'relative w-full';
  const buttonClasses = `flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50'}`;
  const dropdownClasses = `absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto`;
  const optionClasses = `px-4 py-2 cursor-pointer hover:bg-gray-100`;
  const selectedOptionClasses = `bg-blue-50 font-medium`;

  return (
    <div className={`${baseClasses} ${className}`} ref={dropdownRef} {...props}>
      <button
        type="button"
        className={buttonClasses}
        onClick={toggleDropdown}
        disabled={disabled}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-5 h-5 ml-2 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className={dropdownClasses}>
          <ul>
            {options.map((option) => (
              <li
                key={option.value}
                className={`${optionClasses} ${selectedOption && selectedOption.value === option.value ? selectedOptionClasses : ''}`}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </li>
            ))}
            {options.length === 0 && (
              <li className="px-4 py-2 text-gray-500">No options available</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  selectedOption: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired,
  }),
  onSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Dropdown;