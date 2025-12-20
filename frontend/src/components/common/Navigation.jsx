import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Navigation = ({ onOpenReport, onOpenEmergency }) => {
  const { t } = useTranslation();

  return (
    <nav className="flex space-x-8">
      <Link
        to="/disaster-dashboard"
        className="text-base font-semibold text-[#f0f0f0] hover:text-blue-400 transition-colors"
      >
        {t('navigation.disasterDashboard')}
      </Link>
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
