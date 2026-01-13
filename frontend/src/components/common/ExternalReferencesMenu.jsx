import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ExternalReferencesMenu = ({ onLinkClick }) => {
  const { t } = useTranslation();
  const [showSubmenu, setShowSubmenu] = useState(false);

  const externalLinks = [
    {
      name: 'Air Quality Index',
      agency: 'DOE Malaysia',
      url: 'https://apims.doe.gov.my',
    },
    {
      name: 'Disaster Portal',
      agency: 'NADMA',
      url: 'https://portalbencana.nadma.gov.my/',
    },
    {
      name: 'Flood Information',
      agency: 'JPS Malaysia',
      url: 'https://publicinfobanjir.water.gov.my/',
    },
    {
      name: 'Weather Forecast',
      agency: 'MetMalaysia',
      url: 'https://www.met.gov.my/',
    },
  ];

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowSubmenu(true)}
      onMouseLeave={() => setShowSubmenu(false)}
    >
      {/* Main Menu Item */}
      <div className="block px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors duration-150 cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            {t('navigation.external_references', 'External References')}
          </div>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Submenu - Shows on Hover */}
      {showSubmenu && (
        <div className="absolute right-full top-0 mr-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-[10000]">
          <div className="py-1">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Government Resources
              </p>
            </div>
            {externalLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors duration-150 text-sm"
                onClick={onLinkClick}
              >
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  <div>
                    <div className="text-xs font-medium">{link.name}</div>
                    <div className="text-xs text-gray-500">{link.agency}</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalReferencesMenu;
