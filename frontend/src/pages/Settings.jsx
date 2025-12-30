import React, { useState } from 'react';

const user = {
  fullName: 'John Doe',
  email: 'john.doe@email.com',
  role: 'Public User', // or 'Government Officer'
  dateRegistered: '2024-01-15',
  department: 'Disaster Management Agency', // Only for government users
  accessScope: 'Full access', // Only for government users
};

const SettingsPage = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [language, setLanguage] = useState('English');
  const [voiceInput, setVoiceInput] = useState(true);
  const [voiceLanguage, setVoiceLanguage] = useState(
    localStorage.getItem('voiceLanguage') || 'auto'
  );
  const [textSize, setTextSize] = useState('Medium');
  const [defaultChatLang, setDefaultChatLang] = useState('Auto-detect');
  const [chatHistoryLogging, setChatHistoryLogging] = useState(true);
  const [disasterAlerts, setDisasterAlerts] = useState(true);
  const [notifySOP, setNotifySOP] = useState(true);
  const [notifyNearby, setNotifyNearby] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [privacy, setPrivacy] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
    alert('Account deletion (not implemented)');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className="bg-white shadow-xl rounded-lg p-6 max-w-2xl w-full border-2 border-blue-200 relative overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          ✕
        </button>
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Settings</h1>
        <div className="flex space-x-2 mb-4 border-b pb-2 overflow-x-auto">
          <button
            className={`px-3 py-1 rounded-t ${activeTab === 'profile' ? 'bg-blue-100 font-semibold' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`px-3 py-1 rounded-t ${activeTab === 'interaction' ? 'bg-blue-100 font-semibold' : ''}`}
            onClick={() => setActiveTab('interaction')}
          >
            Interaction
          </button>
          <button
            className={`px-3 py-1 rounded-t ${activeTab === 'notifications' ? 'bg-blue-100 font-semibold' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button
            className={`px-3 py-1 rounded-t ${activeTab === 'security' ? 'bg-blue-100 font-semibold' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button
            className={`px-3 py-1 rounded-t ${activeTab === 'data' ? 'bg-blue-100 font-semibold' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Data
          </button>
          <button
            className={`px-3 py-1 rounded-t ${activeTab === 'help' ? 'bg-blue-100 font-semibold' : ''}`}
            onClick={() => setActiveTab('help')}
          >
            Help
          </button>
        </div>
        <div className="overflow-y-auto max-h-[65vh] pr-1">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">User Role</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                  value={user.role}
                  readOnly
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Date Registered</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                  value={user.dateRegistered}
                  readOnly
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Language Preference</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option>English</option>
                  <option>Bahasa Melayu</option>
                </select>
              </div>
              {/* Government user fields */}
              {user.role === 'Government Officer' && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">
                      Assigned Department / Agency
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 bg-gray-100"
                      value={user.department}
                      readOnly
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Access Scope</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 bg-gray-100"
                      value={user.accessScope}
                      readOnly
                    />
                  </div>
                  <div className="mb-4">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      Go to Admin Dashboard
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {/* Interaction Preferences */}
          {activeTab === 'interaction' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-700 font-medium">Voice Input</span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={voiceInput}
                    onChange={() => setVoiceInput((v) => !v)}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition"></div>
                  <span className="ml-2 text-gray-600">{voiceInput ? 'ON' : 'OFF'}</span>
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Voice Input Language</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={voiceLanguage}
                  onChange={(e) => {
                    setVoiceLanguage(e.target.value);
                    localStorage.setItem('voiceLanguage', e.target.value);
                  }}
                >
                  <option value="auto">Auto-detect</option>
                  <option value="ms">Bahasa Melayu (Malay)</option>
                  <option value="en">English</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the language for voice recognition. Auto-detect works for both languages.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Text Size</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={textSize}
                  onChange={(e) => setTextSize(e.target.value)}
                >
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">
                  Default Chat Language
                </label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={defaultChatLang}
                  onChange={(e) => setDefaultChatLang(e.target.value)}
                >
                  <option>English</option>
                  <option>BM</option>
                  <option>Auto-detect</option>
                </select>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-700 font-medium">Enable Chat History Logging</span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={chatHistoryLogging}
                    onChange={() => setChatHistoryLogging((v) => !v)}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition"></div>
                  <span className="ml-2 text-gray-600">{chatHistoryLogging ? 'Yes' : 'No'}</span>
                </label>
              </div>
            </div>
          )}
          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-700 font-medium">Disaster Alerts</span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={disasterAlerts}
                    onChange={() => setDisasterAlerts((v) => !v)}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition"></div>
                  <span className="ml-2 text-gray-600">
                    {disasterAlerts ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-700 font-medium">Notify me of SOP updates</span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifySOP}
                    onChange={() => setNotifySOP((v) => !v)}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition"></div>
                  <span className="ml-2 text-gray-600">{notifySOP ? 'Yes' : 'No'}</span>
                </label>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-700 font-medium">Notify me of nearby incidents</span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifyNearby}
                    onChange={() => setNotifyNearby((v) => !v)}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition"></div>
                  <span className="ml-2 text-gray-600">Based on my location</span>
                </label>
              </div>
            </div>
          )}
          {/* Security Settings */}
          {activeTab === 'security' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Change Password</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert('Password change (not implemented)');
                  }}
                >
                  <div className="mb-3">
                    <label className="block text-gray-700 mb-1">Current Password</label>
                    <input type="password" className="w-full border rounded px-3 py-2" />
                  </div>
                  <div className="mb-3">
                    <label className="block text-gray-700 mb-1">New Password</label>
                    <input type="password" className="w-full border rounded px-3 py-2" />
                  </div>
                  <div className="mb-3">
                    <label className="block text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" className="w-full border rounded px-3 py-2" />
                  </div>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                  >
                    Change Password
                  </button>
                </form>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-700 font-medium">Two-Factor Authentication</span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={twoFA}
                    onChange={() => setTwoFA((v) => !v)}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition"></div>
                  <span className="ml-2 text-gray-600">{twoFA ? 'Enabled' : 'Disabled'}</span>
                </label>
              </div>
              <div className="mb-4">
                <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-full mb-2">
                  Log out of all devices
                </button>
                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={privacy}
                    onChange={() => setPrivacy((v) => !v)}
                  />
                  <span className="text-gray-700">Show my profile info to others</span>
                </label>
              </div>
              <div className="mb-4">
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete My Account
                </button>
              </div>
              {showDeleteConfirm && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full relative">
                    <h3 className="text-lg font-bold mb-4">Confirm Account Deletion</h3>
                    <p className="mb-6">
                      Are you sure you want to delete your account? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-2">
                      <button
                        className="px-4 py-2 rounded bg-gray-200"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 rounded bg-red-600 text-white"
                        onClick={handleDeleteAccount}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Data Management */}
          {activeTab === 'data' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-700 font-medium">View Chat History</span>
                <button className="text-blue-600 hover:underline">View</button>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-700 font-medium">Download Activity Log (PDF)</span>
                <button className="text-blue-600 hover:underline">Download</button>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-700 font-medium">Clear Chat History</span>
                <button className="text-red-600 hover:underline">Clear</button>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-700 font-medium">Delete My Account</span>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => setActiveTab('security')}
                >
                  Go to Security
                </button>
              </div>
            </div>
          )}
          {/* Help & Support */}
          {activeTab === 'help' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-700 font-medium">Help Center / FAQ</span>
                <a
                  href="/help-faq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Open
                </a>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-700 font-medium">Submit Feedback</span>
                <button className="text-blue-600 hover:underline">Submit</button>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-700 font-medium">Contact Support</span>
                <button className="text-blue-600 hover:underline">Contact</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
