import { useEffect, useState } from 'react';
import { loadSettings, SETTINGS_UPDATED_EVENT } from '../utils/settingsStorage';

export default function useAppSettings() {
  const [settings, setSettings] = useState(() => loadSettings());

  useEffect(() => {
    const handle = () => setSettings(loadSettings());

    window.addEventListener('storage', handle);
    window.addEventListener(SETTINGS_UPDATED_EVENT, handle);

    return () => {
      window.removeEventListener('storage', handle);
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handle);
    };
  }, []);

  return settings;
}
