import React from 'react';
import ToggleRow from './ToggleRow';

const InteractionTab = ({
  voiceInput,
  setVoiceInput,
  voiceLanguage,
  setVoiceLanguage,
  textSize,
  setTextSize,
  defaultChatLang,
  setDefaultChatLang,
  chatHistoryLogging,
  setChatHistoryLogging,
}) => {
  return (
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
          <option value="en-US">English (United States)</option>
          <option value="en-GB">English (United Kingdom)</option>
          <option value="ms-MY">Bahasa Melayu (Malay)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Select the language for voice recognition. Uses Web Speech API from Chrome/Edge browser.
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
  );
};

export default InteractionTab;
