import React, { useState } from 'react';

const ExternalReferencesMenuCompact = () => {
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
      <div className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-50 transition-all duration-200 text-sm cursor-pointer">
        <div className="flex items-center">
          <svg
            className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400"
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
          <span>External References</span>
        </div>
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Submenu - Shows on Hover */}
      {showSubmenu && (
        <div className="absolute left-full bottom-0 ml-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-[10000]">
          <div className="py-1">
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
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
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-all duration-200 text-xs"
              >
                <svg
                  className="h-3 w-3 mr-2 flex-shrink-0 text-gray-400"
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
                  <div className="font-medium">{link.name}</div>
                  <div className="text-gray-500">{link.agency}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalReferencesMenuCompact;
