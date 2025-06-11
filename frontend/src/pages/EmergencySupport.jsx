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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className="bg-white rounded-[22px] shadow-lg w-full max-w-lg p-8 border border-gray-200 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-[#0a4974] mb-6 text-center">Emergency Support</h2>
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#0a4974] mb-3">Emergency Contacts</h3>
          <ul className="space-y-4">
            {emergencyContacts.map((contact) => (
              <li key={contact.name} className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-[#e6f2fa] rounded-full w-10 h-10 flex items-center justify-center text-[#0a4974] font-bold text-lg">
                  {contact.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-[#2c2c2c]">{contact.name}</div>
                  <div className="text-sm text-gray-600">{contact.description}</div>
                  <div className="mt-1">
                    <a
                      href={`tel:${contact.number}`}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      {contact.number}
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#0a4974] mb-3">Quick Safety Tips</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            {tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center"></div>
      </div>
    </div>
  );
};

export default EmergencySupport;
