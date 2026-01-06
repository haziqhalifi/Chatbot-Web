import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadSettings,
  saveSettings,
  updateSetting,
  DEFAULT_SETTINGS,
  SETTINGS_UPDATED_EVENT,
} from '../../utils/settingsStorage';

describe('settingsStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('loadSettings', () => {
    it('should return default settings when localStorage is empty', () => {
      const settings = loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should load and merge saved settings with defaults', () => {
      const customSettings = { voiceInputEnabled: false, textSize: 'Large' };
      localStorage.setItem('tiara_app_settings', JSON.stringify(customSettings));

      const settings = loadSettings();
      expect(settings).toEqual({
        ...DEFAULT_SETTINGS,
        ...customSettings,
      });
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('tiara_app_settings', 'invalid json {');
      const settings = loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should handle null value in localStorage', () => {
      localStorage.setItem('tiara_app_settings', 'null');
      const settings = loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe('saveSettings', () => {
    it('should save settings to localStorage', () => {
      const newSettings = { voiceInputEnabled: false };
      saveSettings(newSettings);

      const stored = JSON.parse(localStorage.getItem('tiara_app_settings'));
      expect(stored.voiceInputEnabled).toBe(false);
      expect(stored.textSize).toBe(DEFAULT_SETTINGS.textSize);
    });

    it('should return merged settings', () => {
      const newSettings = { textSize: 'Large' };
      const result = saveSettings(newSettings);

      expect(result).toEqual({
        ...DEFAULT_SETTINGS,
        ...newSettings,
      });
    });

    it('should set document.documentElement.dataset.textSize', () => {
      const newSettings = { textSize: 'Large' };
      saveSettings(newSettings);

      expect(document.documentElement.dataset.textSize).toBe('Large');
    });

    it('should dispatch SETTINGS_UPDATED_EVENT', () => {
      const listener = vi.fn();
      window.addEventListener(SETTINGS_UPDATED_EVENT, listener);

      saveSettings({ voiceInputEnabled: false });

      expect(listener).toHaveBeenCalled();
      window.removeEventListener(SETTINGS_UPDATED_EVENT, listener);
    });

    it('should handle undefined settings parameter', () => {
      const result = saveSettings(undefined);
      expect(result).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe('updateSetting', () => {
    it('should update a single setting', () => {
      updateSetting('textSize', 'Large');
      const settings = loadSettings();

      expect(settings.textSize).toBe('Large');
      expect(settings.voiceInputEnabled).toBe(DEFAULT_SETTINGS.voiceInputEnabled);
    });

    it('should preserve other settings when updating one', () => {
      saveSettings({ voiceInputEnabled: false, textSize: 'Small' });
      updateSetting('notifyNearby', true);

      const settings = loadSettings();
      expect(settings.voiceInputEnabled).toBe(false);
      expect(settings.textSize).toBe('Small');
      expect(settings.notifyNearby).toBe(true);
    });

    it('should return updated settings', () => {
      const result = updateSetting('chatHistoryLogging', false);
      expect(result.chatHistoryLogging).toBe(false);
    });
  });
});
