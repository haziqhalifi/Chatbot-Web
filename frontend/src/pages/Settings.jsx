import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, chatAPI, profileAPI } from '../api';
import Header from '../components/common/Header';
import i18n from '../i18n';
import { loadSettings, saveSettings } from '../utils/settingsStorage';
import jsPDF from 'jspdf';
import { Bell, Database, HelpCircle, MessageSquare, Shield, User } from 'lucide-react';

const SettingsPage = ({ onClose }) => {
  const navigate = useNavigate();
  const isModal = typeof onClose === 'function';

  const [activeTab, setActiveTab] = useState('profile');

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [profile, setProfile] = useState(null);

  const initialSettings = useMemo(() => loadSettings(), []);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('English');
  const [voiceInput, setVoiceInput] = useState(initialSettings.voiceInputEnabled);
  const [voiceLanguage, setVoiceLanguage] = useState(
    localStorage.getItem('voiceLanguage') || 'auto'
  );
  const [textSize, setTextSize] = useState(initialSettings.textSize);
  const [defaultChatLang, setDefaultChatLang] = useState(initialSettings.defaultChatLang);
  const [chatHistoryLogging, setChatHistoryLogging] = useState(initialSettings.chatHistoryLogging);
  const [disasterAlerts, setDisasterAlerts] = useState(initialSettings.disasterAlerts);
  const [notifySOP, setNotifySOP] = useState(initialSettings.notifySOP);
  const [notifyNearby, setNotifyNearby] = useState(initialSettings.notifyNearby);
  const [twoFA, setTwoFA] = useState(false);
  const [privacy, setPrivacy] = useState(initialSettings.privacy);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [saveStatus, setSaveStatus] = useState(null); // 'saved' | 'saving' | 'error'
  const [saveMessage, setSaveMessage] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState(null); // 'saving' | 'saved' | 'error'
  const [passwordMessage, setPasswordMessage] = useState('');

  const [chatSessions, setChatSessions] = useState([]);
  const [chatSessionsLoading, setChatSessionsLoading] = useState(false);
  const [chatSessionsError, setChatSessionsError] = useState(null);
  const [showChatHistory, setShowChatHistory] = useState(false);

  // Load profile on mount
  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setProfileLoading(false);
        setProfileError('Please sign in to manage settings.');
        return;
      }

      setProfileLoading(true);
      setProfileError(null);
      try {
        const response = await profileAPI.getProfile();
        setProfile(response.data);
        setFullName(response.data?.name || '');
        setEmail(response.data?.email || '');
        setLanguage(response.data?.language || 'English');
      } catch (e) {
        setProfileError(e.response?.data?.detail || 'Failed to load profile');
      } finally {
        setProfileLoading(false);
      }
    };

    load();
  }, []);

  // Persist local preferences + apply side effects
  useEffect(() => {
    saveSettings({
      voiceInputEnabled: voiceInput,
      textSize,
      defaultChatLang,
      chatHistoryLogging,
      disasterAlerts,
      notifySOP,
      notifyNearby,
      privacy,
    });
  }, [
    voiceInput,
    textSize,
    defaultChatLang,
    chatHistoryLogging,
    disasterAlerts,
    notifySOP,
    notifyNearby,
    privacy,
  ]);

  // Apply language to i18n
  useEffect(() => {
    const code = language === 'Bahasa Melayu' ? 'ms' : 'en';
    if (i18n.language !== code) {
      i18n.changeLanguage(code);
    }
  }, [language]);

  const handleClose = () => {
    if (isModal) return onClose();
    navigate(-1);
  };

  const TabButton = ({ id, icon: Icon, label }) => {
    const isActive = activeTab === id;
    return (
      <button
        type="button"
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        {Icon ? <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} /> : null}
        <span>{label}</span>
      </button>
    );
  };

  const ToggleRow = ({ label, description, checked, onChange, disabled = false }) => {
    return (
      <div className="flex items-start justify-between gap-4 py-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-800">{label}</div>
          {description ? <div className="text-sm text-gray-500">{description}</div> : null}
        </div>
        <label
          className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!!checked}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
        </label>
      </div>
    );
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      setSaveStatus('error');
      setSaveMessage('Full name is required.');
      return;
    }

    setSaveStatus('saving');
    setSaveMessage('Saving...');
    try {
      const payload = {
        name: fullName.trim(),
        language,
        phone: profile?.phone || '',
        address: profile?.address || '',
        city: profile?.city || '',
        country: profile?.country || '',
        timezone: profile?.timezone || '',
      };
      const response = await profileAPI.updateProfile(payload);
      setProfile(response.data);

      // keep AuthContext/localStorage user name in sync
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          localStorage.setItem(
            'user',
            JSON.stringify({ ...parsed, name: response.data?.name || fullName.trim() })
          );
        }
      } catch {
        // ignore
      }

      localStorage.setItem('tiara_user_profile', JSON.stringify(response.data));
      window.dispatchEvent(new Event('profileUpdated'));

      setSaveStatus('saved');
      setSaveMessage('Saved.');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (e) {
      setSaveStatus('error');
      setSaveMessage(e.response?.data?.detail || 'Failed to save profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);
    setPasswordMessage('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordStatus('error');
      setPasswordMessage('Please fill in all password fields.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus('error');
      setPasswordMessage('New password and confirmation do not match.');
      return;
    }

    setPasswordStatus('saving');
    setPasswordMessage('Changing password...');
    try {
      const res = await authAPI.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      setPasswordStatus('saved');
      setPasswordMessage(res.data?.message || 'Password changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordStatus('error');
      setPasswordMessage(err.response?.data?.detail || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    try {
      await profileAPI.deleteAccount();
    } finally {
      // Clear local auth and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tiara_user_profile');
      localStorage.removeItem('tiara_current_session');
      window.location.href = '/signin';
    }
  };

  const fetchChatHistory = async () => {
    setChatSessionsLoading(true);
    setChatSessionsError(null);
    try {
      const res = await chatAPI.getSessions(50, 0);
      setChatSessions(res.data?.sessions || []);
    } catch (e) {
      setChatSessionsError(e.response?.data?.detail || 'Failed to fetch chat history');
    } finally {
      setChatSessionsLoading(false);
    }
  };

  const handleClearChatHistory = async () => {
    if (!window.confirm('Clear all chat history? This will delete all your chat sessions.')) return;
    setChatSessionsLoading(true);
    setChatSessionsError(null);
    try {
      const res = await chatAPI.getSessions(200, 0);
      const sessions = res.data?.sessions || [];
      for (const s of sessions) {
        // eslint-disable-next-line no-await-in-loop
        await chatAPI.deleteSession(s.id);
      }
      setChatSessions([]);
      localStorage.removeItem('tiara_current_session');
    } catch (e) {
      setChatSessionsError(e.response?.data?.detail || 'Failed to clear chat history');
    } finally {
      setChatSessionsLoading(false);
    }
  };

  const handleDownloadActivityPdf = async () => {
    setChatSessionsLoading(true);
    setChatSessionsError(null);
    try {
      const res = await chatAPI.getSessions(50, 0);
      const sessions = res.data?.sessions || [];

      const doc = new jsPDF();
      let y = 12;

      doc.setFontSize(14);
      doc.text('Tiara Activity Log', 14, y);
      y += 8;

      doc.setFontSize(10);
      doc.text(`User: ${email || ''}`, 14, y);
      y += 6;
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
      y += 10;

      for (const session of sessions) {
        if (y > 270) {
          doc.addPage();
          y = 12;
        }
        doc.setFontSize(12);
        const title = session.title || `Session ${session.id}`;
        doc.text(title, 14, y);
        y += 6;
        doc.setFontSize(9);
        const meta = `Provider: ${session.ai_provider || 'openai'} | Updated: ${session.updated_at || ''}`;
        doc.text(meta, 14, y);
        y += 6;

        // Fetch up to 25 messages per session to keep file reasonable
        // eslint-disable-next-line no-await-in-loop
        const msgsRes = await chatAPI.getSessionMessages(session.id, 25, 0);
        const messages = msgsRes.data?.messages || [];
        for (const m of messages) {
          if (y > 270) {
            doc.addPage();
            y = 12;
          }
          const who = (m.sender_type || '').toUpperCase();
          const line = `${who}: ${m.content || ''}`;
          const wrapped = doc.splitTextToSize(line, 180);
          doc.text(wrapped, 14, y);
          y += wrapped.length * 4 + 2;
        }

        y += 6;
      }

      doc.save('tiara-activity-log.pdf');
    } catch (e) {
      setChatSessionsError(e.response?.data?.detail || 'Failed to generate PDF');
    } finally {
      setChatSessionsLoading(false);
    }
  };

  const roleLabel = profile?.role ? String(profile.role) : 'Public';
  const createdAt = profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '';

  const content = (
    <div className={`w-full bg-white rounded-lg shadow-lg ${isModal ? 'max-w-4xl' : 'max-w-4xl'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-100">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-500">Manage your profile, preferences, and security.</p>
        </div>

        {isModal ? (
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {/* Status / errors */}
      <div className="px-6 pt-4">
        {(saveStatus || saveMessage) && (
          <div
            className={`mb-3 text-sm ${
              saveStatus === 'error'
                ? 'text-red-700 bg-red-50 border border-red-200'
                : saveStatus === 'saved'
                  ? 'text-green-800 bg-green-50 border border-green-200'
                  : 'text-gray-700 bg-gray-50 border border-gray-200'
            } rounded-lg px-3 py-2`}
          >
            {saveMessage}
          </div>
        )}
        {profileError && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {profileError}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-2">
          <TabButton id="profile" icon={User} label="Profile" />
          <TabButton id="interaction" icon={MessageSquare} label="Interaction" />
          <TabButton id="notifications" icon={Bell} label="Notifications" />
          <TabButton id="security" icon={Shield} label="Security" />
          <TabButton id="data" icon={Database} label="Data" />
          <TabButton id="help" icon={HelpCircle} label="Help" />
        </div>
      </div>

      <div className={`px-6 pb-6 ${isModal ? 'max-h-[70vh] overflow-y-auto' : ''}`}>
        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div>
            {profileLoading ? (
              <div className="text-gray-600">Loading profile...</div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">User Role</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    value={roleLabel}
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Date Registered</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    value={createdAt}
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">
                    Language Preference
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option>English</option>
                    <option>Bahasa Melayu</option>
                  </select>
                </div>

                {roleLabel === 'Government Officer' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-1">
                        Assigned Department / Agency
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        value={profile?.department || ''}
                        readOnly
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-1">Access Scope</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        value={profile?.accessScope || ''}
                        readOnly
                      />
                    </div>
                    <div className="mb-4">
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => navigate('/admin')}
                      >
                        Go to Admin Dashboard
                      </button>
                    </div>
                  </>
                )}

                <div className="flex justify-end">
                  <button
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    onClick={handleSaveProfile}
                    disabled={profileLoading}
                  >
                    Save Profile
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Interaction Preferences */}
        {activeTab === 'interaction' && (
          <div>
            <ToggleRow
              label="Voice Input"
              description="Enable microphone input when available."
              checked={voiceInput}
              onChange={(next) => setVoiceInput(next)}
            />

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Voice Input Language</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={textSize}
                onChange={(e) => setTextSize(e.target.value)}
              >
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Default Chat Language</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={defaultChatLang}
                onChange={(e) => setDefaultChatLang(e.target.value)}
              >
                <option>English</option>
                <option>BM</option>
                <option>Auto-detect</option>
              </select>
            </div>

            <ToggleRow
              label="Chat History Logging"
              description="Controls whether your chat sessions are saved."
              checked={chatHistoryLogging}
              onChange={(next) => setChatHistoryLogging(next)}
            />
            <div className="text-xs text-gray-500">Note: Chat history is stored on the server.</div>
          </div>
        )}
        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div>
            <ToggleRow
              label="Disaster Alerts"
              description="Enable general disaster alert notifications."
              checked={disasterAlerts}
              onChange={(next) => setDisasterAlerts(next)}
            />
            <ToggleRow
              label="SOP Updates"
              description="Notify you when standard operating procedures are updated."
              checked={notifySOP}
              onChange={(next) => setNotifySOP(next)}
            />
            <ToggleRow
              label="Nearby Incidents"
              description="Use your location to notify you about nearby incidents."
              checked={notifyNearby}
              onChange={(next) => setNotifyNearby(next)}
            />

            <div className="mt-2">
              <button
                className="text-blue-600 hover:underline"
                onClick={() => navigate('/notification-settings')}
              >
                Manage detailed notification preferences
              </button>
            </div>
          </div>
        )}
        {/* Security Settings */}
        {activeTab === 'security' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Change Password</h2>
              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                    }
                    autoComplete="current-password"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                    }
                    autoComplete="new-password"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                    }
                    autoComplete="new-password"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={passwordStatus === 'saving'}
                >
                  {passwordStatus === 'saving' ? 'Changing...' : 'Change Password'}
                </button>

                {passwordMessage && (
                  <div
                    className={`mt-2 text-sm ${
                      passwordStatus === 'error' ? 'text-red-600' : 'text-green-700'
                    }`}
                  >
                    {passwordMessage}
                  </div>
                )}
              </form>
            </div>
            <ToggleRow
              label="Two-Factor Authentication"
              description="Not available in this version."
              checked={false}
              onChange={() => {}}
              disabled
            />
            <div className="mb-4">
              <button
                className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors mb-2"
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  localStorage.removeItem('tiara_current_session');
                  window.location.href = '/signin';
                }}
              >
                Log out of all devices
              </button>
              <ToggleRow
                label="Public Profile"
                description="Allow others to see your profile information."
                checked={privacy}
                onChange={(next) => setPrivacy(next)}
              />
            </div>
            <div className="mb-4">
              <button
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
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
              <button
                className="text-blue-600 hover:underline"
                onClick={async () => {
                  const next = !showChatHistory;
                  setShowChatHistory(next);
                  if (next) {
                    await fetchChatHistory();
                  }
                }}
              >
                {showChatHistory ? 'Hide' : 'View'}
              </button>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-gray-700 font-medium">Download Activity Log (PDF)</span>
              <button
                className="text-blue-600 hover:underline disabled:opacity-50"
                onClick={handleDownloadActivityPdf}
                disabled={chatSessionsLoading}
              >
                Download
              </button>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-gray-700 font-medium">Clear Chat History</span>
              <button
                className="text-red-600 hover:underline disabled:opacity-50"
                onClick={handleClearChatHistory}
                disabled={chatSessionsLoading}
              >
                Clear
              </button>
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

            {chatSessionsError && <div className="text-red-600 text-sm">{chatSessionsError}</div>}
            {chatSessionsLoading && <div className="text-gray-600 text-sm">Loading...</div>}

            {showChatHistory && !chatSessionsLoading && (
              <div className="mt-3 border rounded p-3 bg-gray-50">
                <div className="text-sm font-semibold mb-2">Recent Sessions</div>
                {chatSessions.length === 0 ? (
                  <div className="text-sm text-gray-600">No chat sessions found.</div>
                ) : (
                  <div className="space-y-2">
                    {chatSessions.slice(0, 10).map((s) => (
                      <div key={s.id} className="text-sm flex justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{s.title || `Session ${s.id}`}</div>
                          <div className="text-xs text-gray-500 truncate">{s.updated_at || ''}</div>
                        </div>
                        <button
                          className="text-blue-600 hover:underline whitespace-nowrap"
                          onClick={() => navigate('/dashboard')}
                        >
                          Open Chat
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
              <button className="text-blue-600 hover:underline" onClick={() => navigate('/report')}>
                Submit
              </button>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-gray-700 font-medium">Contact Support</span>
              <button className="text-blue-600 hover:underline" onClick={() => navigate('/report')}>
                Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) return content;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">{content}</div>
    </div>
  );
};

export default SettingsPage;
