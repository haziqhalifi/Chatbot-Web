import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageDropdown = ({ isOpen, language, onLanguageChange, onToggle }) => {
  const { i18n } = useTranslation();

  const handleLanguageSelect = (lang, locale) => {
    i18n.changeLanguage(locale);
    onLanguageChange(lang); // This will close the dropdown
  };

  // Determine if a language is currently selected based on i18n language
  const isLanguageActive = (targetLocale) => {
    return i18n.language === targetLocale;
  };

  return (
    <div className="relative flex items-center">
      <button
        className="flex items-center text-xl text-[#f0f0f0] focus:outline-none language-btn px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
        onClick={onToggle}
      >
        {language}
        <svg
          className={`ml-2 w-4 h-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="language-dropdown absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
          <div className="py-1">
            {' '}
            <button
              className={`block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 ${
                isLanguageActive('en') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
              }`}
              onClick={() => handleLanguageSelect('English', 'en')}
            >
              <div className="flex items-center">
                <span className="mr-3">🇺🇸</span>
                English
              </div>
            </button>
            <button
              className={`block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 ${
                isLanguageActive('ms') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
              }`}
              onClick={() => handleLanguageSelect('Malay', 'ms')}
            >
              <div className="flex items-center">
                <span className="mr-3">🇲🇾</span>
                Malay
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
