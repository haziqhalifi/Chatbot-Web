import React from 'react';
import { useTranslation } from 'react-i18next';

const Navigation = ({ onOpenReport, onOpenEmergency }) => {
  const { t } = useTranslation();

  return (
    <nav className="flex space-x-8">
      <button
        type="button"
        className="text-base font-semibold text-[#f0f0f0] focus:outline-none"
        onClick={onOpenReport}
      >
        {t('disaster.reportDisaster')}
      </button>
      <button
        type="button"
        className="text-base font-semibold text-[#f0f0f0] focus:outline-none"
        onClick={onOpenEmergency}
      >
        {t('disaster.emergencySupport')}
      </button>
    </nav>
  );
};

export default Navigation;
