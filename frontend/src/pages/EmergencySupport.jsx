import React from 'react';

const emergencyContacts = [
  {
    name: 'Police',
    number: '999',
    description: 'For immediate police assistance in emergencies.',
  },
  {
    name: 'Fire & Rescue',
    number: '994',
    description: 'For fire, rescue, and disaster response.',
  },
  {
    name: 'Ambulance',
    number: '991',
    description: 'For medical emergencies and ambulance services.',
  },
  {
    name: 'Disaster Relief Hotline',
    number: '1-800-123-456',
    description: 'For disaster relief and support information.',
  },
];

const tips = [
  'Stay calm and follow official instructions.',
  'Prepare an emergency kit with essentials.',
  'Know your evacuation routes.',
  'Keep emergency contacts accessible.',
  'Stay updated via trusted news sources.',
];

const EmergencySupport = ({ onClose }) => {
  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[600px] max-w-5xl w-full mx-4 border border-gray-100 relative max-h-[90vh] overflow-y-auto">
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 z-10"
        onClick={onClose}
        aria-label="Close emergency support modal"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>{' '}
      <h2 className="text-2xl font-bold text-[#0a4974] mb-6 text-center">Emergency Support</h2>
      {/* Horizontal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Emergency Contacts */}
        <div>
          <h3 className="text-lg font-semibold text-[#0a4974] mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            Emergency Contacts
          </h3>
          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <div
                key={contact.name}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex-shrink-0 bg-[#0a4974] rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {contact.name[0]}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="font-semibold text-[#2c2c2c] text-sm">{contact.name}</div>
                  <div className="text-xs text-gray-600 mb-1 leading-relaxed">
                    {contact.description}
                  </div>
                  <a
                    href={`tel:${contact.number}`}
                    className="inline-flex items-center text-[#0a4974] font-medium hover:text-blue-700 transition-colors duration-200 bg-white px-2 py-1 rounded-md border border-gray-200 hover:border-[#0a4974] text-sm"
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {contact.number}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Safety Tips and Emergency Hotline */}
        <div className="space-y-6">
          {/* Safety Tips */}
          <div>
            <h3 className="text-lg font-semibold text-[#0a4974] mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Quick Safety Tips
            </h3>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <ul className="space-y-2">
                {tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <div className="flex-shrink-0 w-1.5 h-1.5 bg-[#0a4974] rounded-full mt-2"></div>
                    <span className="text-sm leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Emergency Hotline */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <h4 className="text-red-800 font-semibold mb-2 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Emergency Hotline
            </h4>
            <p className="text-red-700 text-sm mb-3">For immediate assistance, call:</p>
            <a
              href="tel:999"
              className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Call 999 Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencySupport;
