import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, chatAPI, profileAPI } from '../api';
import Header from '../components/common/Header';
import i18n from '../i18n';
import { loadSettings, saveSettings } from '../utils/settingsStorage';
import jsPDF from 'jspdf';
import { Bell, Database, HelpCircle, MessageSquare, Shield, User } from 'lucide-react';
import {
  SettingsHeader,
  TabButton,
  ProfileTab,
  InteractionTab,
  NotificationsTab,
  SecurityTab,
  DataTab,
  HelpTab,
} from '../components/settings';

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
      <SettingsHeader
        isModal={isModal}
        onClose={handleClose}
        saveStatus={saveStatus}
        saveMessage={saveMessage}
        profileError={profileError}
      />

      {/* Tabs */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-2">
          <TabButton
            id="profile"
            icon={User}
            label="Profile"
            isActive={activeTab === 'profile'}
            onClick={setActiveTab}
          />
          <TabButton
            id="interaction"
            icon={MessageSquare}
            label="Interaction"
            isActive={activeTab === 'interaction'}
            onClick={setActiveTab}
          />
          <TabButton
            id="notifications"
            icon={Bell}
            label="Notifications"
            isActive={activeTab === 'notifications'}
            onClick={setActiveTab}
          />
          <TabButton
            id="security"
            icon={Shield}
            label="Security"
            isActive={activeTab === 'security'}
            onClick={setActiveTab}
          />
          <TabButton
            id="data"
            icon={Database}
            label="Data"
            isActive={activeTab === 'data'}
            onClick={setActiveTab}
          />
          <TabButton
            id="help"
            icon={HelpCircle}
            label="Help"
            isActive={activeTab === 'help'}
            onClick={setActiveTab}
          />
        </div>
      </div>

      <div className={`px-6 pb-6 ${isModal ? 'max-h-[70vh] overflow-y-auto' : ''}`}>
        {activeTab === 'profile' && (
          <ProfileTab
            profileLoading={profileLoading}
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            roleLabel={roleLabel}
            createdAt={createdAt}
            language={language}
            setLanguage={setLanguage}
            profile={profile}
            navigate={navigate}
            onSaveProfile={handleSaveProfile}
          />
        )}

        {activeTab === 'interaction' && (
          <InteractionTab
            voiceInput={voiceInput}
            setVoiceInput={setVoiceInput}
            voiceLanguage={voiceLanguage}
            setVoiceLanguage={setVoiceLanguage}
            textSize={textSize}
            setTextSize={setTextSize}
            defaultChatLang={defaultChatLang}
            setDefaultChatLang={setDefaultChatLang}
            chatHistoryLogging={chatHistoryLogging}
            setChatHistoryLogging={setChatHistoryLogging}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab
            disasterAlerts={disasterAlerts}
            setDisasterAlerts={setDisasterAlerts}
            notifySOP={notifySOP}
            setNotifySOP={setNotifySOP}
            notifyNearby={notifyNearby}
            setNotifyNearby={setNotifyNearby}
            navigate={navigate}
          />
        )}

        {activeTab === 'security' && (
          <SecurityTab
            passwordForm={passwordForm}
            setPasswordForm={setPasswordForm}
            onChangePassword={handleChangePassword}
            passwordStatus={passwordStatus}
            passwordMessage={passwordMessage}
            privacy={privacy}
            setPrivacy={setPrivacy}
            showDeleteConfirm={showDeleteConfirm}
            setShowDeleteConfirm={setShowDeleteConfirm}
            onDeleteAccount={handleDeleteAccount}
          />
        )}

        {activeTab === 'data' && (
          <DataTab
            showChatHistory={showChatHistory}
            setShowChatHistory={setShowChatHistory}
            chatSessions={chatSessions}
            chatSessionsLoading={chatSessionsLoading}
            chatSessionsError={chatSessionsError}
            onFetchChatHistory={fetchChatHistory}
            onDownloadActivityPdf={handleDownloadActivityPdf}
            onClearChatHistory={handleClearChatHistory}
            navigate={navigate}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'help' && <HelpTab navigate={navigate} />}
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
