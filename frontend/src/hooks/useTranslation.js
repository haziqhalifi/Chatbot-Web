import { useTranslation } from 'react-i18next';

/**
 * Custom hook for translations with better developer experience
 * Provides shorthand methods for common translation patterns
 */
export const useT = () => {
  const { t, i18n } = useTranslation();

  return {
    // Basic translation
    t,
    
    // Common translations
    common: (key) => t(`common.${key}`),
    nav: (key) => t(`navigation.${key}`),
    auth: (key) => t(`auth.${key}`),
    chat: (key) => t(`chat.${key}`),
    disaster: (key) => t(`disaster.${key}`),
    error: (key) => t(`errors.${key}`),
    
    // Language utilities
    currentLanguage: i18n.language,
    isEnglish: i18n.language === 'en',
    isMalay: i18n.language === 'ms',
    changeLanguage: i18n.changeLanguage,
    
    // Formatted translations with parameters
    format: (key, params) => t(key, params),
    
    // Pluralization helper
    plural: (key, count, params = {}) => t(key, { count, ...params }),
  };
};

export default useT;
