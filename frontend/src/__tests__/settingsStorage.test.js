import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadSettings,
  saveSettings,
  updateSetting,
  DEFAULT_SETTINGS,
  SETTINGS_UPDATED_EVENT,
} from '../utils/settingsStorage';

describe('settingsStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.textSize = '';
    vi.restoreAllMocks();
  });

  it('returns defaults when storage is empty', () => {
    const settings = loadSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('merges overrides, updates data attribute, and dispatches update event', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    const merged = saveSettings({ textSize: 'Large', notifyNearby: true });

    expect(merged.textSize).toBe('Large');
    expect(merged.notifyNearby).toBe(true);
    expect(document.documentElement.dataset.textSize).toBe('Large');

    const persisted = JSON.parse(localStorage.getItem('tiara_app_settings'));
    expect(persisted.textSize).toBe('Large');
    expect(persisted.notifyNearby).toBe(true);

    expect(dispatchSpy).toHaveBeenCalled();
    const event = dispatchSpy.mock.calls[0][0];
    expect(event.type).toBe(SETTINGS_UPDATED_EVENT);
  });

  it('updates a single setting and persists the result', () => {
    saveSettings({ textSize: 'Small', voiceInputEnabled: true });
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    const next = updateSetting('voiceInputEnabled', false);

    expect(next.voiceInputEnabled).toBe(false);
    expect(loadSettings().voiceInputEnabled).toBe(false);
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
