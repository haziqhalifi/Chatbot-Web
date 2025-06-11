import React from 'react';

const HelpFAQPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-2xl w-full border-2 border-blue-200">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Help & FAQ</h1>
        <p className="text-gray-700 mb-6">Find answers to common questions and get support.</p>
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold text-blue-600">How do I reset my password?</h2>
            <p className="text-gray-600 text-sm">
              Go to the account page and click on 'Change Password'.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-blue-600">How do I contact support?</h2>
            <p className="text-gray-600 text-sm">
              Use the 'Contact us' button at the bottom of the sign up page or email
              support@disasterwatch.com.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-blue-600">Is my data secure?</h2>
            <p className="text-gray-600 text-sm">
              Yes, we use industry-standard security practices to protect your data.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-blue-600">What can I ask the chatbot?</h2>
            <p className="text-gray-600 text-sm">
              You can ask about disaster-related information such as:
              <ul className="list-disc ml-6 mt-2">
                <li>“What areas are at risk of flooding?”</li>
                <li>“Is there any landslide reported near Rawang?”</li>
                <li>“What should I do during a flash flood?”</li>
                <li>“Show me the emergency SOP for earthquakes.”</li>
              </ul>
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-blue-600">
              Can I use voice to interact with the chatbot?
            </h2>
            <p className="text-gray-600 text-sm">
              Yes! Click the microphone icon to ask your question using your voice. Make sure to
              allow microphone access in your browser.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-blue-600">
              Which languages does the chatbot support?
            </h2>
            <p className="text-gray-600 text-sm">
              Currently, the chatbot supports English and Bahasa Melayu. You can switch your
              preferred language in the account settings.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-blue-600">
              How accurate is the disaster information?
            </h2>
            <p className="text-gray-600 text-sm">
              The system uses data from verified sources like Pusat Geospatial Negara (PGN) and
              official disaster dashboards. However, always follow announcements from NADMA or local
              authorities during emergencies.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-blue-600">Can I report a disaster incident?</h2>
            <p className="text-gray-600 text-sm">
              Yes. Go to the “Report Incident” section, describe the event, and optionally upload a
              photo. Your report will be reviewed by relevant agencies.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-blue-600">I can't see the map. What should I do?</h2>
            <p className="text-gray-600 text-sm">
              Try the following:
              <ul className="list-disc ml-6 mt-2">
                <li>Refresh the page</li>
                <li>Ensure your browser supports JavaScript</li>
                <li>Allow location access if required</li>
                <li>Use a modern browser like Chrome or Edge</li>
              </ul>
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-blue-600">Who can use this chatbot?</h2>
            <p className="text-gray-600 text-sm">
              Both public users and government officers can use the system. Government officers may
              have access to additional datasets or dashboard insights based on their roles.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-blue-600">
              How do I change my language or voice settings?
            </h2>
            <p className="text-gray-600 text-sm">
              Go to My Account &gt; Preferences, and select your default input and language
              preferences.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-blue-600">Is my data secure?</h2>
            <p className="text-gray-600 text-sm">
              Yes. All personal information and reports are stored securely using encrypted
              databases. Only authorized users can access sensitive data.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-blue-600">
              Where can I get emergency contact numbers?
            </h2>
            <p className="text-gray-600 text-sm">
              Click the “Emergency Contacts” tab to view phone numbers by disaster type and region.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpFAQPage;
