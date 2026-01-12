import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const sections = [
    {
      id: 1,
      title: 'Introduction',
      content:
        'DisasterWatch ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our disaster management platform.',
    },
    {
      id: 2,
      title: 'Information We Collect',
      content: (
        <div>
          <div className="mb-4">
            <h4 className="font-semibold text-blue-700 mb-2">2.1 Personal Information</h4>
            <p className="mb-2">We collect the following personal information:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number (optional)</li>
              <li>Password (encrypted)</li>
              <li>Profile picture (optional)</li>
            </ul>
          </div>
          <div className="mb-4">
            <h4 className="font-semibold text-blue-700 mb-2">2.2 Location Data</h4>
            <p className="mb-2">With your permission, we may collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>GPS coordinates for disaster reporting</li>
              <li>Location-based alert preferences</li>
              <li>IP address for general location information</li>
            </ul>
          </div>
          <div className="mb-4">
            <h4 className="font-semibold text-blue-700 mb-2">2.3 Usage Data</h4>
            <p className="mb-2">We automatically collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Chat conversation history with our AI chatbot</li>
              <li>Disaster reports you submit</li>
              <li>Map interactions and search queries</li>
              <li>Login times and activity logs</li>
              <li>Browser type and device information</li>
              <li>Pages visited and features used</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">2.4 Audio Data</h4>
            <p className="mb-2">If you use voice input features:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Voice recordings are processed for transcription</li>
              <li>Audio files are temporarily stored and then deleted</li>
              <li>Transcribed text is retained for chat history</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'How We Use Your Information',
      content: (
        <div>
          <p className="mb-4">We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and maintain the Service</li>
            <li>Send disaster alerts and notifications based on your location</li>
            <li>Process and respond to disaster reports</li>
            <li>Improve our AI chatbot responses</li>
            <li>Analyze usage patterns to enhance features</li>
            <li>Communicate important service updates</li>
            <li>Verify your identity and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>
      ),
    },
    {
      id: 4,
      title: 'AI and Third-Party Services',
      content: (
        <div>
          <div className="mb-4">
            <h4 className="font-semibold text-blue-700 mb-2">4.1 OpenAI Integration</h4>
            <p className="mb-2">
              Our chatbot uses OpenAI's Assistant API. By using the chat feature:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your messages are sent to OpenAI for processing</li>
              <li>OpenAI processes data according to their privacy policy</li>
              <li>We do not control how OpenAI uses your data</li>
              <li>Please review OpenAI's privacy policy at https://openai.com/privacy</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">4.2 ArcGIS Mapping</h4>
            <p className="mb-2">We use Esri ArcGIS for map services:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Map interactions may be logged by Esri</li>
              <li>Location data is shared for map functionality</li>
              <li>Review Esri's privacy policy at https://www.esri.com/en-us/privacy</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: 'Data Sharing and Disclosure',
      content: (
        <div>
          <p className="mb-4">We may share your information with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Government Agencies:</strong> Disaster management authorities (NADMA, local
              agencies) for emergency response
            </li>
            <li>
              <strong>Service Providers:</strong> Cloud hosting (Azure), email services, AI
              providers
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law or to protect rights and
              safety
            </li>
            <li>
              <strong>Emergency Responders:</strong> In life-threatening situations
            </li>
          </ul>
          <p className="mt-4">
            <strong>We do not sell your personal information to third parties.</strong>
          </p>
        </div>
      ),
    },
    {
      id: 6,
      title: 'Data Security',
      content: (
        <div>
          <p className="mb-4">We implement security measures including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Encryption of data in transit (HTTPS/SSL)</li>
            <li>Password hashing using industry-standard algorithms</li>
            <li>Secure database storage on Azure SQL Server</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication</li>
          </ul>
          <p className="mt-4">
            However, no method of transmission over the internet is 100% secure. We cannot guarantee
            absolute security.
          </p>
        </div>
      ),
    },
    {
      id: 7,
      title: 'Data Retention',
      content: (
        <div>
          <p className="mb-4">We retain your information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account data: Until you delete your account</li>
            <li>Chat history: For 90 days, then archived</li>
            <li>Disaster reports: Indefinitely for historical records</li>
            <li>Audit logs: For 1 year for security purposes</li>
            <li>Voice recordings: Deleted immediately after transcription</li>
          </ul>
        </div>
      ),
    },
    {
      id: 8,
      title: 'Your Rights',
      content: (
        <div>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Access:</strong> Request a copy of your personal data
            </li>
            <li>
              <strong>Correction:</strong> Update or correct your information
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your account and data
            </li>
            <li>
              <strong>Opt-out:</strong> Unsubscribe from notifications
            </li>
            <li>
              <strong>Data Portability:</strong> Request your data in a portable format
            </li>
            <li>
              <strong>Withdraw Consent:</strong> Revoke location or other permissions
            </li>
          </ul>
          <p className="mt-4">
            To exercise these rights, contact us at privacy@disasterwatch.my or use the account
            settings page.
          </p>
        </div>
      ),
    },
    {
      id: 9,
      title: 'Cookies and Tracking',
      content: (
        <div>
          <p className="mb-4">We use:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Essential Cookies:</strong> For authentication and security
            </li>
            <li>
              <strong>Preference Cookies:</strong> To remember your settings
            </li>
            <li>
              <strong>Analytics:</strong> To understand how users interact with our Service
            </li>
          </ul>
          <p className="mt-4">
            You can disable cookies in your browser settings, but this may affect functionality.
          </p>
        </div>
      ),
    },
    {
      id: 10,
      title: "Children's Privacy",
      content:
        'DisasterWatch is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.',
    },
    {
      id: 11,
      title: 'International Data Transfers',
      content:
        'Your information may be transferred to and processed in countries outside Malaysia, including the United States (for OpenAI services). We ensure appropriate safeguards are in place.',
    },
    {
      id: 12,
      title: 'Changes to Privacy Policy',
      content:
        'We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on the Service. Continued use after changes constitutes acceptance.',
    },
    {
      id: 13,
      title: 'Contact Us',
      content: (
        <div>
          <p className="mb-2">
            For questions about this Privacy Policy or to exercise your rights:
          </p>
          <p>
            Email: privacy@disasterwatch.my
            <br />
            Data Protection Officer: dpo@disasterwatch.my
            <br />
            Address: DisasterWatch, Malaysia
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-2xl rounded-xl border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <h1 className="text-3xl font-bold mb-2 text-center">Privacy Policy</h1>
            <p className="text-blue-100 text-center">
              Learn how we protect and manage your personal information
            </p>
          </div>

          {/* Last Updated */}
          <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Last Updated:</strong> January 12, 2026
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-4">
            {/* Content */}
            <div className="p-8 space-y-4">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-700 text-lg">
                        {section.id}. {section.title}
                      </h3>
                    </div>
                    <div className="ml-4">
                      <svg
                        className={`w-5 h-5 text-blue-600 transform transition-transform ${
                          expandedSection === section.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>
                  {expandedSection === section.id && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="text-gray-700 leading-relaxed">
                        {typeof section.content === 'string' ? (
                          <p>{section.content}</p>
                        ) : (
                          section.content
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
