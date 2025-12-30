const STORAGE_KEY = 'tiara_app_settings';
export const SETTINGS_UPDATED_EVENT = 'tiaraSettingsUpdated';

export const DEFAULT_SETTINGS = {
  voiceInputEnabled: true,
  textSize: 'Medium', // Small | Medium | Large
  defaultChatLang: 'Auto-detect', // English | BM | Auto-detect
  chatHistoryLogging: true,
  disasterAlerts: true,
  notifySOP: true,
  notifyNearby: false,
  privacy: true,
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...DEFAULT_SETTINGS, ...(parsed || {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(nextSettings) {
  const merged = { ...DEFAULT_SETTINGS, ...(nextSettings || {}) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

  // Apply global side-effects
  try {
    document.documentElement.dataset.textSize = merged.textSize || 'Medium';
  } catch {
    // ignore
  }

  window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT));
  return merged;
}

export function updateSetting(key, value) {
  const current = loadSettings();
  const next = { ...current, [key]: value };
  return saveSettings(next);
}
