import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const TermsOfUse = () => {
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const sections = [
    {
      id: 1,
      title: 'Acceptance of Terms',
      content:
        'By accessing and using DisasterWatch ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms of Use, please do not use the Service.',
    },
    {
      id: 2,
      title: 'Description of Service',
      content: (
        <div>
          <p className="mb-4">DisasterWatch is a disaster management platform that provides:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>AI-powered chatbot assistance for disaster-related information</li>
            <li>Real-time disaster notifications and alerts</li>
            <li>GIS map visualization of disaster-prone areas</li>
            <li>Incident reporting and tracking functionality</li>
            <li>Emergency support resources</li>
          </ul>
        </div>
      ),
    },
    {
      id: 3,
      title: 'User Responsibilities',
      content: (
        <div>
          <p className="mb-4">You agree to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Use the Service only for lawful purposes</li>
            <li>Not submit false or misleading disaster reports</li>
            <li>Respect the intellectual property rights of others</li>
          </ul>
        </div>
      ),
    },
    {
      id: 4,
      title: 'Emergency Disclaimer',
      content: (
        <div>
          <p className="mb-4">
            <strong className="text-red-600">IMPORTANT:</strong> DisasterWatch is an informational
            service and should not be your sole source of emergency information. In case of
            immediate danger:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Call emergency services (999 in Malaysia) immediately</li>
            <li>Follow official government disaster management guidelines</li>
            <li>Evacuate if instructed by authorities</li>
            <li>Do not rely solely on our Service for life-threatening situations</li>
          </ul>
        </div>
      ),
    },
    {
      id: 5,
      title: 'AI Chatbot Limitations',
      content: (
        <div>
          <p className="mb-4">
            Our AI-powered chatbot provides general information and assistance. However:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Responses may not always be accurate or complete</li>
            <li>AI-generated advice should not replace professional emergency guidance</li>
            <li>The chatbot is not a substitute for official disaster management agencies</li>
            <li>We are not liable for actions taken based on chatbot responses</li>
          </ul>
        </div>
      ),
    },
    {
      id: 6,
      title: 'Data Accuracy',
      content: (
        <div>
          <p className="mb-4">While we strive to provide accurate and timely information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Map data and disaster information may not be real-time</li>
            <li>Information is sourced from various third parties and may contain errors</li>
            <li>We do not guarantee the completeness or accuracy of any information</li>
            <li>Users should verify critical information with official sources</li>
          </ul>
        </div>
      ),
    },
    {
      id: 7,
      title: 'Intellectual Property',
      content:
        'All content on DisasterWatch, including text, graphics, logos, and software, is the property of DisasterWatch or its licensors and is protected by copyright and other intellectual property laws.',
    },
    {
      id: 8,
      title: 'Limitation of Liability',
      content: (
        <div>
          <p className="mb-4">
            To the fullest extent permitted by law, DisasterWatch and its operators shall not be
            liable for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Any indirect, incidental, special, or consequential damages</li>
            <li>Loss of life, injury, or property damage resulting from use of the Service</li>
            <li>Errors, omissions, or inaccuracies in disaster information</li>
            <li>Service interruptions or technical failures</li>
            <li>Third-party actions or data breaches</li>
          </ul>
        </div>
      ),
    },
    {
      id: 9,
      title: 'Account Termination',
      content: (
        <div>
          <p className="mb-4">
            We reserve the right to suspend or terminate your account at any time for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Violation of these Terms of Use</li>
            <li>Fraudulent or illegal activity</li>
            <li>Submission of false disaster reports</li>
            <li>Abuse of the Service or other users</li>
          </ul>
        </div>
      ),
    },
    {
      id: 10,
      title: 'Modifications',
      content:
        'We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting. Your continued use of the Service after changes constitutes acceptance of the modified terms.',
    },
    {
      id: 11,
      title: 'Governing Law',
      content:
        'These Terms of Use shall be governed by and construed in accordance with the laws of Malaysia, without regard to its conflict of law provisions.',
    },
    {
      id: 12,
      title: 'Contact Information',
      content: (
        <div>
          <p className="mb-2">For questions about these Terms of Use, please contact us at:</p>
          <p>
            Email: support@disasterwatch.my
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
            <h1 className="text-3xl font-bold mb-2 text-center">Terms of Use</h1>
            <p className="text-blue-100 text-center">
              Please read our terms carefully before using DisasterWatch
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

export default TermsOfUse;
